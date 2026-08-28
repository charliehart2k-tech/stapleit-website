#!/usr/bin/env python3
"""Upload Cora's live-site corpus to an OpenAI vector store for file_search."""
from __future__ import annotations
import argparse, json, mimetypes, os, secrets, sys, time, urllib.error, urllib.request
from pathlib import Path

DEFAULT_BASE='https://api.openai.com/v1'

def key()->str:
    value=os.getenv('CORA_OPENAI_API_KEY') or os.getenv('STAPLEIT_OPENAI_API_KEY') or ''
    if not value: raise SystemExit('Set CORA_OPENAI_API_KEY in the environment; it is never printed.')
    return value

def api(path:str, method='GET', body=None, content_type='application/json'):
    base=(os.getenv('CORA_OPENAI_BASE_URL') or DEFAULT_BASE).rstrip('/')
    data=None
    headers={'Authorization':'Bearer '+key(),'Accept':'application/json'}
    if body is not None:
        data=body if isinstance(body,(bytes,bytearray)) else json.dumps(body).encode()
        headers['Content-Type']=content_type
    req=urllib.request.Request(base+path,data=data,headers=headers,method=method)
    try:
        with urllib.request.urlopen(req,timeout=60) as r: return json.loads(r.read().decode())
    except urllib.error.HTTPError as exc:
        detail=exc.read().decode('utf-8','replace')[:1000]
        raise SystemExit(f'OpenAI API error {exc.code} on {path}: {detail}')

def multipart_file(path:Path):
    boundary='----cora'+secrets.token_hex(12)
    chunks=[]
    def field(name,value):
        chunks.extend([f'--{boundary}\r\n'.encode(),f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode(),str(value).encode(),b'\r\n'])
    field('purpose','assistants')
    mime=mimetypes.guess_type(path.name)[0] or 'text/markdown'
    chunks.extend([
        f'--{boundary}\r\n'.encode(),
        f'Content-Disposition: form-data; name="file"; filename="{path.name}"\r\n'.encode(),
        f'Content-Type: {mime}\r\n\r\n'.encode(),path.read_bytes(),b'\r\n',f'--{boundary}--\r\n'.encode()
    ])
    return b''.join(chunks),f'multipart/form-data; boundary={boundary}'

def main()->int:
    ap=argparse.ArgumentParser()
    ap.add_argument('--corpus',default='training/cora-site-runtime-corpus.md')
    ap.add_argument('--vector-store-id',default=os.getenv('CORA_OPENAI_VECTOR_STORE_ID',''))
    ap.add_argument('--name',default='Staple IT live website knowledge')
    args=ap.parse_args()
    corpus=Path(args.corpus)
    if not corpus.is_file(): raise SystemExit(f'Corpus not found: {corpus}; run tools/build-cora-site-corpus.py first.')
    store_id=args.vector_store_id.strip()
    if not store_id:
        created=api('/vector_stores','POST',{'name':args.name})
        store_id=str(created.get('id',''))
        if not store_id: raise SystemExit('OpenAI did not return a vector store ID.')
    upload_body,ctype=multipart_file(corpus)
    uploaded=api('/files','POST',upload_body,ctype)
    file_id=str(uploaded.get('id',''))
    if not file_id: raise SystemExit('OpenAI did not return a file ID.')
    attached=api(f'/vector_stores/{store_id}/files','POST',{'file_id':file_id})
    attach_id=str(attached.get('id') or file_id)
    status=str(attached.get('status','in_progress'))
    deadline=time.time()+120
    while status not in {'completed','failed','cancelled'} and time.time()<deadline:
        time.sleep(2)
        current=api(f'/vector_stores/{store_id}/files/{attach_id}')
        status=str(current.get('status',''))
        if status=='failed':
            raise SystemExit('Vector-store indexing failed: '+json.dumps(current.get('last_error')))
    if status!='completed': raise SystemExit(f'Vector-store indexing did not complete; status={status}')
    print(f'CORA_OPENAI_VECTOR_STORE_ID={store_id}')
    print(f'CORA_OPENAI_FILE_ID={file_id}')
    print('Cora website corpus indexed successfully.')
    return 0
if __name__=='__main__': raise SystemExit(main())
