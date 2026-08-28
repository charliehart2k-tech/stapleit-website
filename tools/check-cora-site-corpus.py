#!/usr/bin/env python3
"""Validate the committed live-site snapshot used to ground Cora."""
from __future__ import annotations
import csv, hashlib, re, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
CORPUS=ROOT/'training/cora-site-corpus.md'
RUNTIME=ROOT/'training/cora-site-runtime-corpus.md'
MANIFEST=ROOT/'training/cora-site-corpus-manifest.tsv'
REQUIRED={
 'https://www.stapleit.co.uk/',
 'https://www.stapleit.co.uk/it-services/it-support/',
 'https://www.stapleit.co.uk/it-services/it-solutions/',
 'https://www.stapleit.co.uk/it-services/it-consultancy/',
 'https://www.stapleit.co.uk/it-services/cybersecurity/',
 'https://www.stapleit.co.uk/it-services/ai-integrations/',
 'https://www.stapleit.co.uk/about-us/',
 'https://www.stapleit.co.uk/about-us/who-we-support/',
 'https://www.stapleit.co.uk/about-us/our-partners/',
 'https://www.stapleit.co.uk/get-in-touch/',
 'https://www.stapleit.co.uk/get-in-touch/it-audit/',
}

def fail(msg):
    print('Cora site corpus failure: '+msg,file=sys.stderr); raise SystemExit(1)

def main():
    if not CORPUS.is_file() or not RUNTIME.is_file() or not MANIFEST.is_file(): fail('corpus, runtime corpus or manifest missing')
    rows=list(csv.DictReader(MANIFEST.open(encoding='utf-8'),delimiter='\t'))
    urls={r['url'] for r in rows}
    missing=sorted(REQUIRED-urls)
    if missing: fail('required live pages missing: '+', '.join(missing))
    if any('/dbc/' in u for u in urls): fail('/dbc/ must never enter Cora knowledge')
    if len(rows)<20: fail(f'expected at least 20 public pages, got {len(rows)}')
    if sum(1 for r in rows if r['source_class']=='canonical-service')<6: fail('canonical service coverage is too small')
    if sum(1 for r in rows if r['source_class']=='supplementary-blog')<4: fail('supplementary blog coverage is too small')
    corpus=CORPUS.read_text(encoding='utf-8')
    runtime=RUNTIME.read_text(encoding='utf-8')
    if len(corpus)<50000: fail('corpus unexpectedly small')
    if len(runtime)<40000: fail('runtime corpus unexpectedly small')
    for marker in ['Canonical service/company/contact pages outrank supplementary blog content.','Runtime package/pricing/safety rules remain authoritative']:
        if marker not in corpus: fail('authority marker missing: '+marker)
    if 'Supplementary blog posts are intentionally excluded from runtime retrieval' not in runtime: fail('runtime authority marker missing')
    if 'SOURCE CLASS: supplementary-blog' in runtime: fail('supplementary blog leaked into runtime corpus')
    if 'SOURCE URL: https://www.stapleit.co.uk/it-services/it-support/' not in runtime: fail('IT Support source marker absent from runtime corpus')
    if 'SOURCE URL: https://www.stapleit.co.uk/it-services/ai-integrations/' not in runtime: fail('AI Integrations source marker absent from runtime corpus')
    print(f'Cora site corpus contract: {len(rows)} live pages, {CORPUS.stat().st_size} bytes; runtime {RUNTIME.stat().st_size} bytes')
if __name__=='__main__': main()
