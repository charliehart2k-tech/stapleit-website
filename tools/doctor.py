from __future__ import annotations

from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
from urllib.request import urlopen
from urllib.error import HTTPError
from datetime import datetime, timezone
import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import time
import xml.etree.ElementTree as ET

sys.dont_write_bytecode = True
TOOLS = Path(__file__).resolve().parent
VENDOR_PY = TOOLS / 'vendor' / 'python'
if str(VENDOR_PY) not in sys.path:
    sys.path.insert(0, str(VENDOR_PY))
from bs4 import BeautifulSoup  # type: ignore

EXPECTED_LIQUID_SHA = '11a286f4251811e767cd6c4901e7aae76b37c561ddb884aa2b2b5ad37579316a'
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
OPTIONAL_CLOSE = {'li','dt','dd','p','rt','rp','optgroup','option','thead','tbody','tfoot','tr','td','th'}


class StructureLint(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack=[]
        self.errors=[]
        self.ids=set()
        self.counts={'html':0,'head':0,'body':0,'title':0}

    def handle_decl(self, decl):
        pass

    def handle_starttag(self, tag, attrs):
        tag=tag.lower()
        if tag in self.counts: self.counts[tag]+=1
        for k,v in attrs:
            if k.lower()=='id' and v:
                if v in self.ids: self.errors.append(f'duplicate id="{v}"')
                self.ids.add(v)
        if tag in VOID: return
        # HTML optional-close elements are tolerated. The project source is
        # normally fully closed, but this avoids false positives from legal HTML.
        if tag in OPTIONAL_CLOSE and self.stack and self.stack[-1]==tag:
            self.stack.pop()
        self.stack.append(tag)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag.lower() not in VOID and self.stack and self.stack[-1]==tag.lower():
            self.stack.pop()

    def handle_endtag(self, tag):
        tag=tag.lower()
        if tag in VOID: return
        if tag in self.stack:
            # Anything popped above the requested element is structurally
            # suspicious unless it has optional end tags.
            while self.stack:
                top=self.stack.pop()
                if top==tag: break
                if top not in OPTIONAL_CLOSE:
                    self.errors.append(f'<{top}> closed implicitly by </{tag}>')
        else:
            self.errors.append(f'unmatched </{tag}>')

    def finish(self):
        leftovers=[t for t in self.stack if t not in OPTIONAL_CLOSE]
        if leftovers: self.errors.append('unclosed tags: '+', '.join(leftovers[-10:]))
        for tag in ('html','head','body','title'):
            if self.counts[tag] != 1:
                self.errors.append(f'expected one <{tag}>, found {self.counts[tag]}')
        return self.errors


class Gate:
    def __init__(self, project:Path):
        self.project=project
        self.site=project/'site'
        self.errors=[]
        self.passes=[]
        self.metrics={}

    def passed(self,msg):
        self.passes.append(msg); print(f'[PASS] {msg}')
    def failed(self,msg):
        self.errors.append(msg); print(f'[FAIL] {msg}')
    def check(self,condition,msg):
        (self.passed if condition else self.failed)(msg)

    def file_checks(self):
        required=[
            'site/index.html','site/404.html','site/it-services/it-support/index.html',
            'site/.well-known/security.txt','Start-Staging.ps1','tools/dev/_server.py','tools/build_production.py',
            'tools/asset_minifier.py','tools/Apply-Update.ps1','tools/Build-Production.ps1',
            'tools/Smoke-Test-Production.ps1','deploy/nginx-security-headers.conf',
            'deploy/nginx-site.conf.example','deploy/activate-release.sh',
            'docs/BROWSER-SUPPORT.md','docs/DEPLOYMENT.md','docs/FRAMEWORK-HARDENING.md',
        ]
        for rel in required:
            self.check((self.project/rel).exists(),f'required file: {rel}')

        confidential=list((self.project/'reference').rglob('*.docx')) if (self.project/'reference').exists() else []
        self.check(not confidential,'no confidential DOCX files live under reference/')
        archive=self.project/'reference/source-archives/www.stapleit.co.uk-full-scrape.zip'
        self.check(not archive.exists(),'full source-scrape archive is outside the working project')

    def git_checks(self):
        self.check((self.project/'.git').is_dir(),'Git repository is initialised')
        ignore=(self.project/'.gitignore').read_text(encoding='utf-8') if (self.project/'.gitignore').exists() else ''
        for token in ('staging/runtime/','staging/backups/','dist/','**/__pycache__/','*.pyc'):
            self.check(token in ignore,f'.gitignore excludes {token}')
        if (self.project/'.git').is_dir():
            r=subprocess.run(['git','-c',f'safe.directory={self.project}','-C',str(self.project),'rev-list','--count','HEAD'],capture_output=True,text=True)
            count=int(r.stdout.strip() or 0) if r.returncode==0 else 0
            self.metrics['git_commits']=count
            self.check(count>=1,'baseline Git commit exists')

    def html_checks(self):
        pages=sorted(self.site.rglob('*.html'))
        self.metrics['source_html_pages']=len(pages)
        broken=[]; missing_assets=[]; lint_errors=[]; seo_errors=[]
        real_pages=0; placeholders=0
        for page in pages:
            text=page.read_text(encoding='utf-8')
            parser=StructureLint()
            try: parser.feed(text); parser.close()
            except Exception as exc: parser.errors.append(str(exc))
            for err in parser.finish(): lint_errors.append(f'{page.relative_to(self.site)}: {err}')
            soup=BeautifulSoup(text,'html.parser')
            if page.name!='404.html':
                canonical=soup.find('link',rel=lambda v:v and 'canonical' in v)
                og_title=soup.find('meta',attrs={'property':'og:title'})
                og_desc=soup.find('meta',attrs={'property':'og:description'})
                og_image=soup.find('meta',attrs={'property':'og:image'})
                twitter=soup.find('meta',attrs={'name':'twitter:card'})
                if not all((canonical,og_title,og_desc,og_image,twitter)):
                    seo_errors.append(f'{page.relative_to(self.site)} missing canonical/OG/Twitter metadata')
                placeholder=bool(soup.find('link',href=re.compile(r'placeholder\.css$')))
                if placeholder:
                    placeholders+=1
                    robots=soup.find('meta',attrs={'name':'robots'})
                    if not robots or 'noindex' not in robots.get('content','').lower():
                        seo_errors.append(f'{page.relative_to(self.site)} placeholder is not noindex')
                else:
                    real_pages+=1
            for a in soup.find_all('a',href=True):
                href=a['href'].strip()
                parts=urlsplit(href)
                if not href or href.startswith('#') or parts.scheme in {'http','https','mailto','tel'} or href.startswith('//'):
                    continue
                path=parts.path
                if path.startswith('/'):
                    target=(self.site/path.lstrip('/')).resolve()
                else:
                    target=(page.parent/path).resolve()
                if target.is_dir(): target=target/'index.html'
                if not target.exists(): broken.append((str(page.relative_to(self.site)),href))
            for tag,attr in (('link','href'),('script','src'),('img','src'),('source','src')):
                for el in soup.find_all(tag):
                    value=(el.get(attr) or '').strip()
                    if not value: continue
                    parts=urlsplit(value)
                    if parts.scheme in {'http','https','data'} or value.startswith('//'): continue
                    if tag=='link' and el.get('rel') and 'canonical' in el.get('rel'): continue
                    path=parts.path
                    target=(self.site/path.lstrip('/')).resolve() if path.startswith('/') else (page.parent/path).resolve()
                    if not target.exists(): missing_assets.append((str(page.relative_to(self.site)),value))

        home_text=(self.site/'index.html').read_text(encoding='utf-8')
        home=BeautifulSoup(home_text,'html.parser')
        hero_video=home.select_one('.home-hero-shell > video.liquid-motion')
        self.check(bool(hero_video) and not hero_video.has_attr('poster'),'homepage hero is video-only with no static poster layer')
        self.check('brand-moment' not in home_text and 'brand-interlude' not in home_text,'standalone oversized Staple logo interlude is absent')
        home_css=(self.site/'assets/css/pages/home.css').read_text(encoding='utf-8')
        self.check('background-image:url("../../media/liquid-wave-poster.webp")' not in home_css.split('/* Compact, single-surface IT Support intro. */')[0],'homepage hero CSS has no static liquid-wave image')
        nav_css=(self.site/'assets/css/nav.css').read_text(encoding='utf-8')
        self.check('background:rgba(0,0,0,.10) padding-box' in nav_css,'navigation ribbon uses transparent black glass')
        schema=home.find('script',attrs={'type':'application/ld+json'})
        schema_ok=False
        if schema:
            try:
                payload=json.loads(schema.string or schema.get_text())
                schema_ok=payload.get('@type')=='ProfessionalService' and payload.get('telephone') and payload.get('address')
            except Exception: pass
        self.check(not lint_errors,f'HTML structural lint passes ({len(pages)} pages)')
        if lint_errors: self.metrics['html_lint_errors']=lint_errors[:20]
        self.check(not broken,f'no broken internal links ({sum(1 for _ in pages)} pages scanned)')
        if broken: self.metrics['broken_links']=broken[:20]
        self.check(not missing_assets,'no missing local HTML assets')
        if missing_assets: self.metrics['missing_assets']=missing_assets[:20]
        self.check(not seo_errors,'canonical/Open Graph/Twitter metadata is present and placeholders are noindex')
        if seo_errors: self.metrics['seo_errors']=seo_errors[:20]
        self.check(schema_ok,'homepage ProfessionalService JSON-LD is present and parseable')
        self.metrics['real_pages']=real_pages
        self.metrics['placeholder_pages']=placeholders

    def liquid_checks(self):
        vendor=self.site/'assets/js/vendor/liquidGL-2.0.1.js'
        actual=hashlib.sha256(vendor.read_bytes()).hexdigest() if vendor.exists() else ''
        self.check(actual==EXPECTED_LIQUID_SHA,'liquidGL is fully self-hosted with the pinned SHA-256')
        loader=self.site/'assets/js/liquid-enhance.js'
        code=loader.read_text(encoding='utf-8') if loader.exists() else ''
        self.check("params.get('liquid')||'on'" in code,'contained liquidGL surfaces are enabled by default')
        self.check('specular:false' in code,'liquidGL persistent target uses specular:false')
        self.check(not any(x in code for x in ('cdn.jsdelivr','unpkg','poc.js')),'liquidGL loader has no CDN fallback')
        pages=list(self.site.rglob('*.html'))
        target_pages=[p for p in pages if 'js-liquid-surface' in p.read_text(encoding='utf-8')]
        loader_pages=[p for p in pages if 'liquid-enhance.js' in p.read_text(encoding='utf-8')]
        self.check(sorted(loader_pages)==sorted(target_pages),'liquid-enhance.js loads exactly on pages with a liquidGL target')
        self.check(len(target_pages)>=5,'liquidGL is used selectively across the homepage and service pages')
        surface_counts=[p.read_text(encoding='utf-8').count('js-liquid-surface') for p in target_pages]
        contained=all(1 <= count <= 3 for count in surface_counts)
        self.check(contained,'each liquidGL page contains one to three small contained targets')
        scoped=all('data-liquid-snapshot=' in p.read_text(encoding='utf-8') for p in target_pages)
        self.check(scoped,'every liquidGL target declares an explicit local snapshot region')
        combined='\n'.join(p.read_text(encoding='utf-8') for p in pages)
        self.check(not any(t in combined for t in ('js-liquid-nav','js-liquid-nav-shell','nav-shell-lens','nav-pill-lens')),'no nav shell or nav pill is a liquidGL target')
        self.check(not re.search(r'class=[\"\'][^\"\']*(?:home|support|service)-hero-(?:shell|stage)[^\"\']*js-liquid',combined),'no hero shell/stage is itself a liquidGL target')

    def staging_shell_checks(self):
        shell=(self.project/'Start-Staging.ps1').read_text(encoding='utf-8-sig')
        self.check('$tokens = @(Tokenize $line)' in shell,'one-word staging commands are forced to an array (System.Char crash guard)')
        self.check("$cmd = ([string]$tokens[0]).ToLowerInvariant()" in shell,'staging command token is explicitly cast to String before case normalization')
        command_try=shell.find('try{\n      $tokens = @(Tokenize $line)')
        self.check(command_try != -1,'staging command parsing is inside the per-command try/catch')
        server=(self.project/'tools/dev/_server.py').read_text(encoding='utf-8')
        self.check('no-store, no-cache, must-revalidate, max-age=0' in server,'local dev server disables static asset caching')

    def hygiene_checks(self):
        servers=[p for p in (self.project/'tools').rglob('*') if p.is_file() and p.name in {'_server.py','dev_server.py'}]
        self.check(servers==[self.project/'tools/dev/_server.py'],'exactly one dev server exists')
        caches=list(self.project.rglob('__pycache__'))+list(self.project.rglob('*.pyc'))+list(self.project.rglob('*.pyo'))
        self.check(not caches,'no Python cache artefacts are present')
        docs=list((self.project/'docs').iterdir())
        versioned=[p.name for p in docs if re.search(r'(?:^|[-_])v\d+',p.name,re.I)]
        self.check(not versioned,'no version-stacked documentation files remain')
        topics={'DESIGN-SYSTEM.md','PERFORMANCE.md','LIQUIDGL.md','CHANGELOG.md','VALIDATION.json'}
        self.check(all((self.project/'docs'/name).exists() for name in topics),'one current file exists for each core documentation topic')

    def deployment_checks(self):
        nginx=(self.project/'deploy/nginx-security-headers.conf').read_text(encoding='utf-8')
        self.check('add_header Content-Security-Policy' in nginx and 'add_header X-Content-Type-Options' in nginx,'security headers are real nginx add_header directives')
        self.check('# add_header Strict-Transport-Security' in nginx,'HSTS remains explicitly disabled until HTTPS validation')
        deploy=(self.project/'docs/DEPLOYMENT.md').read_text(encoding='utf-8')
        self.check('/releases/' in deploy and 'current ->' in deploy and 'Rollback' in deploy,'timestamped release/current-symlink rollback strategy is documented')
        self.check((self.site/'.well-known/security.txt').exists(),'.well-known/security.txt exists')

    def build_checks(self):
        dist=self.project/'dist'
        dist.mkdir(exist_ok=True)
        sentinel=dist/'__stale_probe__'
        sentinel.write_text('must disappear',encoding='utf-8')
        env=os.environ.copy(); env['PYTHONDONTWRITEBYTECODE']='1'
        result=subprocess.run([sys.executable,str(self.project/'tools/build_production.py'),'--project',str(self.project)],capture_output=True,text=True,env=env)
        self.metrics['build_stdout']=result.stdout.strip().splitlines()[-8:]
        if result.returncode != 0:
            self.failed('production build completes cleanly')
            self.metrics['build_stderr']=result.stderr[-4000:]
            return
        self.passed('production build completes cleanly')
        self.check(not sentinel.exists(),'dist/ is rebuilt cleanly with no stale files')
        self.check((dist/'robots.txt').exists() and (dist/'sitemap.xml').exists(),'build generates robots.txt and sitemap.xml')
        try:
            ET.parse(dist/'sitemap.xml'); sitemap_ok=True
        except Exception: sitemap_ok=False
        self.check(sitemap_ok,'generated sitemap.xml is valid XML')
        app_src=self.site/'assets/js/app.js'; app_dist=dist/'assets/js/app.js'
        self.check(app_dist.stat().st_size < app_src.stat().st_size,'production JavaScript is genuinely minified')
        css_src=self.site/'assets/css/pages/home.css'; css_dist=dist/'assets/css/pages/home.css'
        self.check(css_dist.stat().st_size < css_src.stat().st_size,'production CSS is genuinely minified')
        builder=(self.project/'tools/build_production.py').read_text(encoding='utf-8')
        self.check('def min_js' not in builder and 'def min_css' not in builder and 'asset_minifier' in builder,'old pseudo-minifier functions are removed from the builder')
        self.check(not (dist/'reference').exists() and not (dist/'tools').exists() and not (dist/'docs').exists(),'dist/ contains deployable site content only')

    def dev_smoke(self):
        runtime=self.project/'staging/runtime/doctor'
        shutil.rmtree(runtime,ignore_errors=True); runtime.mkdir(parents=True,exist_ok=True)
        env=os.environ.copy(); env['PYTHONDONTWRITEBYTECODE']='1'
        proc=subprocess.Popen([sys.executable,str(self.project/'tools/dev/_server.py'),'--root',str(self.site),'--runtime',str(runtime),'--port','0'],stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,text=True,env=env)
        try:
            deadline=time.time()+8; port_file=runtime/'port.txt'
            while time.time()<deadline and not port_file.exists():
                if proc.poll() is not None: break
                time.sleep(.1)
            if not port_file.exists():
                self.failed('local dev server starts'); return
            port=int(port_file.read_text().strip()); base=f'http://127.0.0.1:{port}'
            with urlopen(base+'/',timeout=4) as r: home_ok=r.status==200
            service_routes=['/it-services/it-support/','/it-services/it-solutions/','/it-services/it-consultancy/','/it-services/cybersecurity/','/it-services/ai-integrations/']
            service_ok=True
            for route in service_routes:
                with urlopen(base+route,timeout=4) as r: service_ok=service_ok and r.status==200
            try:
                urlopen(base+'/definitely-not-a-real-route/',timeout=4); missing_ok=False; body=''
            except HTTPError as exc:
                body=exc.read().decode('utf-8','ignore'); missing_ok=exc.code==404 and "That page isn't here." in body
            self.check(home_ok and service_ok,'local dev server serves homepage and all IT Services dropdown pages')
            self.check(missing_ok,'local dev server serves the custom 404 with HTTP 404 status')
        except Exception as exc:
            self.failed(f'local dev smoke test: {exc}')
        finally:
            proc.terminate()
            try: proc.wait(timeout=3)
            except Exception: proc.kill()
            shutil.rmtree(runtime,ignore_errors=True)

    def run(self):
        self.file_checks(); self.git_checks(); self.html_checks(); self.liquid_checks(); self.staging_shell_checks(); self.hygiene_checks(); self.deployment_checks(); self.build_checks(); self.dev_smoke()
        # A final cache sweep ensures the gate itself did not dirty the package.
        caches=list(self.project.rglob('__pycache__'))+list(self.project.rglob('*.pyc'))+list(self.project.rglob('*.pyo'))
        if caches:
            for p in caches:
                if p.is_dir(): shutil.rmtree(p,ignore_errors=True)
                else: p.unlink(missing_ok=True)
            self.failed('acceptance run generated Python cache artefacts (they were removed)')
        report={
            'generated_at':datetime.now(timezone.utc).isoformat(),
            'status':'PASS' if not self.errors else 'FAIL',
            'passes':self.passes,
            'failures':self.errors,
            'metrics':self.metrics,
        }
        (self.project/'docs/VALIDATION.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
        if self.errors:
            print(f'\n[FAIL] {len(self.errors)} framework acceptance check(s) failed.')
            return 1
        print(f'\n[OK] Framework acceptance gate passed ({len(self.passes)} checks).')
        return 0


def main():
    parser=argparse.ArgumentParser(); parser.add_argument('--project',required=True); args=parser.parse_args()
    return Gate(Path(args.project).resolve()).run()

if __name__=='__main__':
    raise SystemExit(main())
