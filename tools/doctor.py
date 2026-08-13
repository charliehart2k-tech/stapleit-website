from __future__ import annotations
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
from urllib.request import urlopen
from urllib.error import HTTPError
import argparse, hashlib, json, os, re, shutil, subprocess, sys, time

sys.dont_writebytecode=True
TOOLS=Path(__file__).resolve().parent
VENDOR_PY=TOOLS/'vendor'/'python'
if str(VENDOR_PY) not in sys.path: sys.path.insert(0,str(VENDOR_PY))
from bs4 import BeautifulSoup  # type: ignore

EXPECTED='11a286f4251811e767cd6c4901e7aae76b37c561ddb884aa2b2b5ad37579316a'
VOID={'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}

class Lint(HTMLParser):
    def __init__(self): super().__init__(convert_charrefs=True); self.stack=[]; self.errors=[]; self.ids=set()
    def handle_starttag(self,tag,attrs):
        if tag in VOID:return
        for k,v in attrs:
            if k=='id' and v:
                if v in self.ids:self.errors.append('duplicate id '+v)
                self.ids.add(v)
        self.stack.append(tag)
    def handle_endtag(self,tag):
        if tag in VOID:return
        if tag in self.stack:
            while self.stack:
                if self.stack.pop()==tag:return
        self.errors.append('unmatched '+tag)

class Gate:
    def __init__(self,project): self.project=project; self.site=project/'site'; self.passes=[]; self.errors=[]
    def check(self,ok,msg):
        (self.passes if ok else self.errors).append(msg); print(('[PASS] ' if ok else '[FAIL] ')+msg)
    def files(self):
        for rel in ['site/index.html','site/404.html','site/it-services/it-support/index.html','site/assets/css/design-v4.css','site/assets/js/liquid-enhance.js','site/assets/js/vendor/liquidGL-2.0.1.js','Start-Staging.ps1','tools/dev/_server.py','tools/build_production.py']:
            self.check((self.project/rel).exists(),'required file: '+rel)
        html=[p.relative_to(self.site).as_posix() for p in self.site.rglob('*.html')]
        self.check(sorted(html)==['404.html','index.html','it-services/it-support/index.html'],'only Home, IT Support and technical 404 remain in site/')
        self.check(not list((self.project/'docs').glob('*V[0-9]*')),'no version-stacked design docs')
    def html(self):
        broken=[]; missing=[]; lint=[]
        for page in self.site.rglob('*.html'):
            text=page.read_text(encoding='utf-8'); parser=Lint(); parser.feed(text); parser.close(); lint += [f'{page}: {e}' for e in parser.errors]
            soup=BeautifulSoup(text,'html.parser')
            for a in soup.find_all('a',href=True):
                href=a['href'].strip(); u=urlsplit(href)
                if not href or href.startswith('#') or u.scheme in {'http','https','mailto','tel'} or href.startswith('//'):continue
                t=(self.site/u.path.lstrip('/')).resolve() if u.path.startswith('/') else (page.parent/u.path).resolve()
                if t.is_dir():t=t/'index.html'
                if not t.exists():broken.append((page.name,href))
            for tag,attr in [('link','href'),('script','src'),('img','src'),('source','src')]:
                for el in soup.find_all(tag):
                    v=(el.get(attr) or '').strip(); u=urlsplit(v)
                    if not v or u.scheme in {'http','https','data'} or v.startswith('//'):continue
                    if tag=='link' and el.get('rel') and 'canonical' in el.get('rel'):continue
                    t=(self.site/u.path.lstrip('/')).resolve() if u.path.startswith('/') else (page.parent/u.path).resolve()
                    if not t.exists():missing.append((page.name,v))
        self.check(not lint,'HTML structure parses cleanly')
        self.check(not broken,'no broken internal links')
        self.check(not missing,'no missing local assets')
        home=(self.site/'index.html').read_text(encoding='utf-8'); support=(self.site/'it-services/it-support/index.html').read_text(encoding='utf-8')
        self.check('assets/css/design-v4.css' in home and '../../assets/css/design-v4.css' in support,'Design Drop 04 stylesheet loads last on both active pages')
        self.check('brand-lens' not in home+support,'double/nested brand liquid pill is removed')
        self.check('Staple.<span class="it-accent it-blue">IT</span>' in home and 'Staple.<span class="it-accent it-blue">IT</span>' in support,'Staple.IT wordmark highlights IT in Staple blue')
        self.check('it-accent it-green">IT</span> Support' in home+support,'IT Support highlights IT in support green')
    def liquid(self):
        vendor=self.site/'assets/js/vendor/liquidGL-2.0.1.js'; actual=hashlib.sha256(vendor.read_bytes()).hexdigest() if vendor.exists() else ''
        self.check(actual==EXPECTED,'pinned liquidGL vendor SHA-256 matches')
        code=(self.site/'assets/js/liquid-enhance.js').read_text(encoding='utf-8')
        for needle,msg in [("document.querySelectorAll('.js-liquid-surface')",'loader discovers all liquid surfaces'),('slice(0,3)','loader caps active lenses at three'),("params.get('liquid')||'on'",'liquidGL enabled by default'),('specular:bool','specular is configurable per target')]: self.check(needle in code,msg)
        self.check(not any(x in code for x in ['cdn.jsdelivr','unpkg','poc.js']),'liquidGL has no CDN fallback')
        pages=[p for p in self.site.rglob('*.html') if 'js-liquid-surface' in p.read_text(encoding='utf-8')]
        self.check(len(pages)==2,'only Home and IT Support contain liquidGL targets')
        self.check(all(1<=p.read_text(encoding='utf-8').count('js-liquid-surface')<=3 for p in pages),'each active page has one to three liquid surfaces')
        self.check(all('nav-gl-surface js-liquid-surface' in p.read_text(encoding='utf-8') for p in pages),'entire nav is a liquidGL target on both active pages')
        self.check(all('data-liquid-snapshot="body"' in p.read_text(encoding='utf-8') for p in pages),'all surfaces use shared body snapshot')
        nav=(self.site/'assets/css/nav.css').read_text(encoding='utf-8')
        self.check('backdrop-filter' not in nav,'nav CSS contains no CSS glass blur')
    def staging(self):
        shell=(self.project/'Start-Staging.ps1').read_text(encoding='utf-8-sig')
        self.check('$tokens = @(Tokenize $line)' in shell,'PowerShell one-word command crash guard remains')
        self.check("$cmd = ([string]$tokens[0]).ToLowerInvariant()" in shell,'PowerShell command token is cast to string')
        server=(self.project/'tools/dev/_server.py').read_text(encoding='utf-8')
        self.check('no-store, no-cache, must-revalidate, max-age=0' in server,'dev server disables asset caching')
    def build(self):
        env=os.environ.copy();env['PYTHONDONTWRITEBYTECODE']='1'
        r=subprocess.run([sys.executable,str(self.project/'tools/build_production.py'),'--project',str(self.project)],capture_output=True,text=True,env=env)
        self.check(r.returncode==0,'production build completes cleanly')
        if r.returncode: print(r.stderr)
        dist=self.project/'dist'; self.check((dist/'robots.txt').exists() and (dist/'sitemap.xml').exists(),'robots.txt and sitemap.xml generated')
    def smoke(self):
        runtime=self.project/'staging/runtime/doctor';shutil.rmtree(runtime,ignore_errors=True);runtime.mkdir(parents=True,exist_ok=True)
        env=os.environ.copy();env['PYTHONDONTWRITEBYTECODE']='1'
        p=subprocess.Popen([sys.executable,str(self.project/'tools/dev/_server.py'),'--root',str(self.site),'--runtime',str(runtime),'--port','0'],stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,env=env)
        try:
            pf=runtime/'port.txt'; deadline=time.time()+8
            while time.time()<deadline and not pf.exists(): time.sleep(.1)
            if not pf.exists(): self.check(False,'dev server starts');return
            base='http://127.0.0.1:'+pf.read_text().strip(); ok=True
            for route in ['/','/it-services/it-support/']:
                with urlopen(base+route,timeout=4) as r: ok=ok and r.status==200
            self.check(ok,'dev server serves Home and IT Support')
            try:urlopen(base+'/not-a-route/',timeout=4);missing=False
            except HTTPError as e:missing=e.code==404 and "That page isn't here." in e.read().decode('utf-8','ignore')
            self.check(missing,'custom 404 returns HTTP 404')
        finally:
            p.terminate();shutil.rmtree(runtime,ignore_errors=True)
    def run(self):
        self.files();self.html();self.liquid();self.staging();self.build();self.smoke()
        report={'status':'PASS' if not self.errors else 'FAIL','passes':self.passes,'failures':self.errors}
        (self.project/'docs/VALIDATION.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
        print(f"\n[{'OK' if not self.errors else 'FAIL'}] {len(self.passes)} passed; {len(self.errors)} failed.")
        return 1 if self.errors else 0

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--project',required=True);a=ap.parse_args();return Gate(Path(a.project).resolve()).run()
if __name__=='__main__':raise SystemExit(main())
