#!/usr/bin/env python3
"""Build Cora's grounded knowledge snapshot from the live Staple IT website."""
from __future__ import annotations
import argparse, hashlib, html, re, sys, urllib.request, xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

BASE='https://www.stapleit.co.uk'
SITEMAP=f'{BASE}/sitemap.xml'
UA='StapleIT-Cora-KnowledgeSync/1.0 (+https://www.stapleit.co.uk/)'
EXCLUDED_PATHS={'/dbc/'}

class MainTextParser(HTMLParser):
    block_tags={'h1','h2','h3','h4','p','li','dt','dd','blockquote'}
    ignore_tags={'script','style','noscript','svg','form','nav','header','footer'}
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_main=False; self.main_depth=0; self.ignore_depth=0
        self.current_tag=''; self.buf=[]; self.blocks=[]; self.title=''
        self.in_title=False; self.title_buf=[]
    def handle_starttag(self, tag, attrs):
        tag=tag.lower()
        if tag=='title': self.in_title=True; self.title_buf=[]
        if tag=='main': self.in_main=True; self.main_depth=1; return
        if self.in_main: self.main_depth += 1
        if not self.in_main: return
        if tag in self.ignore_tags: self.ignore_depth += 1
        if self.ignore_depth==0 and tag in self.block_tags:
            self.flush(); self.current_tag=tag; self.buf=[]
    def handle_endtag(self, tag):
        tag=tag.lower()
        if tag=='title':
            self.in_title=False; self.title=' '.join(''.join(self.title_buf).split())
        if self.in_main and self.ignore_depth==0 and tag==self.current_tag:
            self.flush()
        if self.in_main and tag in self.ignore_tags and self.ignore_depth: self.ignore_depth -= 1
        if self.in_main:
            self.main_depth -= 1
            if tag=='main' or self.main_depth<=0:
                self.flush(); self.in_main=False; self.main_depth=0
    def handle_data(self, data):
        if self.in_title: self.title_buf.append(data)
        if self.in_main and self.ignore_depth==0 and self.current_tag:
            self.buf.append(data)
    def flush(self):
        if not self.current_tag: return
        text=' '.join(''.join(self.buf).split())
        if text:
            prefix='# ' if self.current_tag=='h1' else '## ' if self.current_tag=='h2' else '### ' if self.current_tag in {'h3','h4'} else '- ' if self.current_tag=='li' else ''
            self.blocks.append(prefix+text)
        self.current_tag=''; self.buf=[]

def fetch(url:str)->str:
    req=urllib.request.Request(url, headers={'User-Agent':UA,'Accept':'text/html,application/xml;q=0.9,*/*;q=0.8'})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read().decode('utf-8','replace')

def sitemap_urls()->list[str]:
    root=ET.fromstring(fetch(SITEMAP))
    ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
    children=[x.text.strip() for x in root.findall('.//s:loc',ns) if x.text]
    urls=[]
    for child in children:
        xml=ET.fromstring(fetch(child))
        urls.extend(x.text.strip() for x in xml.findall('.//s:loc',ns) if x.text)
    out=[]
    for url in urls:
        parsed=urlparse(url)
        path=parsed.path or '/'
        if parsed.netloc not in {'www.stapleit.co.uk','stapleit.co.uk'}: continue
        if path in EXCLUDED_PATHS: continue
        if path.startswith('/wp-') or '/feed/' in path: continue
        out.append(f'{BASE}{path}')
    return list(dict.fromkeys(out))

def source_class(url:str)->str:
    path=urlparse(url).path
    if path.startswith('/it-services/') or path in {'/','/it-services/'}: return 'canonical-service'
    if path.startswith('/get-in-touch/'): return 'canonical-contact'
    if path.startswith('/about-us/'): return 'canonical-company'
    if path.startswith('/the-staple-blog/') and path!='/the-staple-blog/': return 'supplementary-blog'
    return 'public-site'

def clean_blocks(blocks:list[str])->list[str]:
    seen=set(); out=[]
    boilerplate={
        'Home','IT Services','About Us','Get in touch','Remote Support','The Staple Blog',
        'Client Portal','Privacy Policy','Legal','Who We Support','Our Partners','Cookie icon'
    }
    for block in blocks:
        raw=re.sub(r'^#{1,3}\s+|^-\s+','',block).strip()
        if not raw or raw in boilerplate: continue
        if raw.startswith(('This field is mandatory','The e-mail address is invalid','* Indicates required fields','We need your consent to load')): continue
        if raw in {'Categories','Authors','Leave a Reply Cancel reply','All Posts'}: continue
        key=raw.casefold()
        if key in seen: continue
        seen.add(key); out.append(block)
    return out

def main()->int:
    ap=argparse.ArgumentParser()
    ap.add_argument('--output',default='training/cora-site-corpus.md')
    ap.add_argument('--manifest',default='training/cora-site-corpus-manifest.tsv')
    args=ap.parse_args()
    sections=[]; manifest=[]
    for url in sitemap_urls():
        try: page=fetch(url)
        except Exception as exc:
            print(f'WARN fetch failed {url}: {exc}',file=sys.stderr); continue
        parser=MainTextParser(); parser.feed(page)
        blocks=clean_blocks(parser.blocks)
        if not blocks: continue
        body='\n\n'.join(blocks).strip()
        digest=hashlib.sha256(body.encode()).hexdigest()
        cls=source_class(url)
        first_h1=next((b[2:].strip() for b in blocks if b.startswith('# ')), '')
        first_heading=next((re.sub(r'^#{1,3}\s+','',b).strip() for b in blocks if re.match(r'^#{1,3}\s+',b)), '')
        html_title='' if parser.title.strip().casefold()=='cookie icon' else parser.title
        title=first_h1 or first_heading or html_title or url
        sections.append(f'---\nSOURCE URL: {url}\nSOURCE CLASS: {cls}\nPAGE TITLE: {title}\nCONTENT SHA256: {digest}\n---\n\n{body}\n')
        manifest.append((url,cls,title,digest,str(len(body))))
    header=(
        '# Staple IT live website knowledge snapshot\n\n'
        'This corpus is generated from public pages listed in https://www.stapleit.co.uk/sitemap.xml.\n'
        'Canonical service/company/contact pages outrank supplementary blog content.\n'
        'Runtime package/pricing/safety rules remain authoritative if a website snapshot conflicts with them.\n\n'
    )
    out=Path(args.output); out.parent.mkdir(parents=True,exist_ok=True); out.write_text(header+'\n'.join(sections),encoding='utf-8')
    man=Path(args.manifest); man.write_text('url\tsource_class\ttitle\tsha256\tchars\n'+'\n'.join('\t'.join(x) for x in manifest)+'\n',encoding='utf-8')
    print(f'Cora live-site corpus: {len(manifest)} pages, {out.stat().st_size} bytes')
    for row in manifest: print(f'{row[1]:22s} {row[4]:>6s} {row[0]}')
    return 0
if __name__=='__main__': raise SystemExit(main())
