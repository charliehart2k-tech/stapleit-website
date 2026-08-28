#!/usr/bin/env python3
from __future__ import annotations
import json, os, subprocess, threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

class Handler(BaseHTTPRequestHandler):
    def log_message(self,*args): pass
    def reply(self,obj,status=200):
        raw=json.dumps(obj).encode(); self.send_response(status); self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(raw))); self.end_headers(); self.wfile.write(raw)
    def do_POST(self):
        auth=self.headers.get('Authorization','')
        if auth!='Bearer sk-test-sync-secret': return self.reply({'error':'bad auth'},401)
        n=int(self.headers.get('Content-Length','0')); body=self.rfile.read(n)
        if self.path=='/vector_stores': return self.reply({'id':'vs_mock_site'})
        if self.path=='/files':
            if b'purpose' not in body or b'cora-site-corpus.md' not in body: return self.reply({'error':'bad multipart'},400)
            return self.reply({'id':'file_mock_site'})
        if self.path=='/vector_stores/vs_mock_site/files': return self.reply({'id':'file_mock_site','status':'in_progress'})
        return self.reply({'error':'unknown'},404)
    def do_GET(self):
        if self.path=='/vector_stores/vs_mock_site/files/file_mock_site': return self.reply({'id':'file_mock_site','status':'completed','last_error':None})
        return self.reply({'error':'unknown'},404)

def main():
    root=Path(__file__).resolve().parents[2]
    server=ThreadingHTTPServer(('127.0.0.1',0),Handler); port=server.server_address[1]
    t=threading.Thread(target=server.serve_forever,daemon=True); t.start()
    env=os.environ.copy(); env.update({'CORA_OPENAI_API_KEY':'sk-test-sync-secret','CORA_OPENAI_BASE_URL':f'http://127.0.0.1:{port}'})
    try:
        proc=subprocess.run(['python3','tools/sync-cora-openai-knowledge.py','--corpus','training/cora-site-corpus.md'],cwd=root,env=env,text=True,capture_output=True,timeout=20)
    finally: server.shutdown(); server.server_close()
    if proc.returncode!=0: raise SystemExit('sync tool failed: '+proc.stderr)
    if 'CORA_OPENAI_VECTOR_STORE_ID=vs_mock_site' not in proc.stdout: raise SystemExit('vector store id missing')
    if 'CORA_OPENAI_FILE_ID=file_mock_site' not in proc.stdout: raise SystemExit('file id missing')
    if 'sk-test-sync-secret' in proc.stdout+proc.stderr: raise SystemExit('API key leaked')
    print('Cora OpenAI vector sync contract: PASS')
if __name__=='__main__': main()
