from __future__ import annotations

from pathlib import Path
from datetime import datetime, timezone
import argparse
import hashlib
import re
import shutil
import sys
import subprocess

sys.dont_write_bytecode = True
TOOLS = Path(__file__).resolve().parent
VENDOR_PY = TOOLS / 'vendor' / 'python'
if str(VENDOR_PY) not in sys.path:
    sys.path.insert(0, str(VENDOR_PY))
if str(TOOLS) not in sys.path:
    sys.path.insert(0, str(TOOLS))

from bs4 import BeautifulSoup  # type: ignore
from asset_minifier import minify_file

EXPECTED_VENDOR_SHA256 = '11a286f4251811e767cd6c4901e7aae76b37c561ddb884aa2b2b5ad37579316a'
BASE_URL = 'https://stapleit.co.uk'


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def fail(message: str):
    print(f'BUILD FAILED: {message}', file=sys.stderr)
    raise SystemExit(1)


def verify_liquid_vendor(site: Path):
    vendor = site / 'assets/js/vendor/liquidGL-2.0.1.js'
    if not vendor.exists():
        fail('liquidGL vendor file is missing.')
    actual = sha256(vendor)
    if actual != EXPECTED_VENDOR_SHA256:
        fail(f'liquidGL SHA-256 mismatch: {actual}')
    code = vendor.read_text(encoding='utf-8')
    if 'Version: v2.0.1' not in code or 'export default liquidGL;' not in code:
        fail('liquidGL v2.0.1 content markers are missing.')
    if (site / 'assets/js/vendor/liquidGL-2.0.1.poc.js').exists():
        fail('The old CDN POC bridge must not exist.')


def minify_assets(dist: Path):
    stats = []
    for css in sorted((dist / 'assets/css').rglob('*.css')):
        before, after = minify_file(css)
        stats.append((css.relative_to(dist).as_posix(), before, after))
    for js in sorted((dist / 'assets/js').glob('*.js')):
        # The pinned third-party vendor is under vendor/ and is deliberately
        # not rewritten, preserving its verified upstream SHA-256.
        before, after = minify_file(js)
        stats.append((js.relative_to(dist).as_posix(), before, after))

    # Optional extra syntax gate where Node happens to exist. The production
    # builder does not require Node; it remains fully offline/Python-driven.
    node = shutil.which('node')
    if node:
        for js in sorted((dist / 'assets/js').glob('*.js')):
            result = subprocess.run([node, '--check', str(js)], capture_output=True, text=True)
            if result.returncode != 0:
                fail(f'JavaScript syntax check failed for {js.name}: {result.stderr.strip()}')
    return stats


def generate_search_files(dist: Path):
    urls = []
    for page in sorted(dist.rglob('*.html')):
        if page.name == '404.html':
            continue
        soup = BeautifulSoup(page.read_text(encoding='utf-8'), 'html.parser')
        robots = soup.find('meta', attrs={'name': 'robots'})
        if robots and 'noindex' in robots.get('content', '').lower():
            continue
        canonical = soup.find('link', rel=lambda value: value and 'canonical' in value)
        if canonical and canonical.get('href'):
            urls.append(canonical['href'])

    urls = sorted(set(urls))
    today = datetime.now(timezone.utc).date().isoformat()
    sitemap = ['<?xml version="1.0" encoding="UTF-8"?>',
               '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for url in urls:
        sitemap.extend(['  <url>', f'    <loc>{url}</loc>', f'    <lastmod>{today}</lastmod>', '  </url>'])
    sitemap.append('</urlset>')
    (dist / 'sitemap.xml').write_text('\n'.join(sitemap) + '\n', encoding='utf-8')
    (dist / 'robots.txt').write_text(
        'User-agent: *\nAllow: /\n\nSitemap: https://stapleit.co.uk/sitemap.xml\n',
        encoding='utf-8',
    )
    return urls


def deployment_gates(dist: Path):
    pages = list(dist.rglob('*.html'))
    target_pages = [p for p in pages if 'js-liquid-surface' in p.read_text(encoding='utf-8')]
    loader_pages = [p for p in pages if 'liquid-enhance.js' in p.read_text(encoding='utf-8')]
    if sorted(loader_pages) != sorted(target_pages):
        fail('liquid-enhance.js must load exactly on pages that contain a liquidGL target.')

    combined = '\n'.join(p.read_text(encoding='utf-8') for p in pages)
    for token in ('js-liquid-nav', 'js-liquid-nav-shell', 'nav-shell-lens', 'nav-pill-lens'):
        if token in combined:
            fail(f'Forbidden nav liquidGL token remains: {token}')
    if re.search(r'class=[\"\'][^\"\']*(?:home|support|service)-hero-(?:shell|stage)[^\"\']*js-liquid', combined):
        fail('A hero shell/stage itself must never be a liquidGL target.')

    for page in target_pages:
        text = page.read_text(encoding='utf-8')
        surface_count = text.count('js-liquid-surface')
        if not (1 <= surface_count <= 3):
            fail(f'Each liquidGL page must contain one to three contained targets: {page}')
        if 'data-liquid-snapshot=' not in text:
            fail(f'liquidGL target is missing an explicit local snapshot region: {page}')

    loader = (dist / 'assets/js/liquid-enhance.js').read_text(encoding='utf-8')
    if any(token in loader for token in ('cdn.jsdelivr', 'unpkg', 'poc.js')):
        fail('liquid loader contains a CDN/POC fallback.')
    if "params.get('liquid')||'on'" not in loader:
        fail('Contained liquidGL surfaces are expected to be enabled by default.')
    if 'specular:false' not in loader:
        fail('Persistent liquidGL target must use specular:false.')
    if not (dist / '.well-known/security.txt').exists():
        fail('.well-known/security.txt is missing from production output.')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--project', required=True)
    args = parser.parse_args()

    project = Path(args.project).resolve()
    src = project / 'site'
    dist = project / 'dist'
    if not src.is_dir():
        fail(f'Site source not found: {src}')

    verify_liquid_vendor(src)

    # Clean build: never overlay on stale output.
    if dist.exists():
        shutil.rmtree(dist)
    shutil.copytree(src, dist, ignore=shutil.ignore_patterns('__pycache__', '*.pyc', '*.pyo'))

    stats = minify_assets(dist)
    indexed_urls = generate_search_files(dist)
    deployment_gates(dist)

    before = sum(item[1] for item in stats)
    after = sum(item[2] for item in stats)
    saving = (1 - after / before) * 100 if before else 0
    print(f'Production build created: {dist}')
    print(f'[PASS] Clean dist/ generated from site/ only.')
    print(f'[PASS] liquidGL vendor SHA-256 verified.')
    print(f'[PASS] Parser/token-aware asset minification: {before} -> {after} bytes ({saving:.1f}% smaller).')
    print(f'[PASS] robots.txt and sitemap.xml generated ({len(indexed_urls)} indexable route(s)).')


if __name__ == '__main__':
    main()
