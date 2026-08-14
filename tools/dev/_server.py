from __future__ import annotations

from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import argparse
import threading
import time
import urllib.parse


SECURITY_HEADERS = {
    'Content-Security-Policy': (
        "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; "
        "form-action 'self'; img-src 'self' data:; media-src 'self'; "
        "font-src 'self' https://fonts.gstatic.com; "
        "style-src 'self' https://fonts.googleapis.com; script-src 'self'; connect-src 'self'"
    ),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
}


class Stamp:
    def __init__(self, root: Path):
        self.root = root
        self.value = 0
        self.lock = threading.Lock()

    def refresh(self) -> None:
        latest = 0
        for path in self.root.rglob('*'):
            if path.is_file():
                try:
                    latest = max(latest, path.stat().st_mtime_ns)
                except OSError:
                    pass
        with self.lock:
            self.value = latest

    def get(self) -> int:
        with self.lock:
            return self.value


def watch(stamp: Stamp) -> None:
    while True:
        stamp.refresh()
        time.sleep(.45)


RELOAD = """(()=>{let last=null,timer=null;async function tick(){try{const r=await fetch('/__staple_stamp',{cache:'no-store'});const s=await r.text();if(last!==null&&s!==last){location.reload();return}last=s}catch(_){}timer=setTimeout(tick,650)}tick();addEventListener('beforeunload',()=>{if(timer)clearTimeout(timer)})})();"""


def inject(data: bytes) -> bytes:
    try:
        text = data.decode('utf-8')
    except UnicodeDecodeError:
        return data
    tag = '<script src="/__staple_reload.js"></script>'
    if tag not in text:
        text = text.replace('</body>', tag + '</body>') if '</body>' in text else text + tag
    return text.encode('utf-8')


def make_handler(root: Path, stamp: Stamp):
    root = root.resolve()
    not_found = root / '404.html'

    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(root), **kwargs)

        def log_message(self, fmt, *args):
            print(time.strftime('%H:%M:%S'), '-', fmt % args, flush=True)

        def _headers_buffer_pairs(self):
            pairs = []
            for raw in getattr(self, '_headers_buffer', []):
                try:
                    line = raw.decode('latin-1').strip()
                except Exception:
                    continue
                if ':' in line:
                    k, v = line.split(':', 1)
                    pairs.append((k.strip(), v.strip()))
            return pairs

        def _send_bytes(self, status: int, content_type: str, body: bytes, cache='no-store'):
            self.send_response(status)
            self.send_header('Content-Type', content_type)
            self.send_header('Cache-Control', cache)
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def end_headers(self):
            # Keep local staging deliberately uncached so design changes cannot
            # be masked by a stale asset in the browser.
            existing = {k.lower() for k, _ in self._headers_buffer_pairs()}
            if 'cache-control' not in existing:
                self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
                self.send_header('Pragma', 'no-cache')
                self.send_header('Expires', '0')

            # Mirror the production security baseline during development. HSTS
            # is intentionally omitted because staging is local HTTP.
            for name, value in SECURITY_HEADERS.items():
                if name.lower() not in existing:
                    self.send_header(name, value)

            self.send_header('X-Staple-Staging', '1')
            super().end_headers()

        def _send_404_page(self):
            if not_found.exists():
                self._send_bytes(404, 'text/html; charset=utf-8', inject(not_found.read_bytes()))
            else:
                self.send_error(404, 'File not found')

        def do_GET(self):
            path = urllib.parse.urlsplit(self.path).path

            # Reject Windows-style path traversal syntax explicitly. The server
            # is local-only, but keeping this invariant mirrors production.
            if '\\' in path:
                self.send_error(400, 'Backslashes are not valid URL path separators')
                return

            if path == '/__staple_stamp':
                self._send_bytes(200, 'text/plain; charset=utf-8', str(stamp.get()).encode())
                return
            if path == '/__staple_reload.js':
                self._send_bytes(200, 'application/javascript; charset=utf-8', RELOAD.encode())
                return

            translated = Path(self.translate_path(path)).resolve()
            try:
                translated.relative_to(root)
            except ValueError:
                self.send_error(403, 'Path outside site root')
                return

            candidate = translated / 'index.html' if translated.is_dir() else translated
            if candidate.is_file() and candidate.suffix.lower() in {'.html', '.htm'}:
                try:
                    body = inject(candidate.read_bytes())
                except OSError:
                    self._send_404_page()
                    return
                self._send_bytes(200, 'text/html; charset=utf-8', body)
                return

            if candidate.is_file():
                return super().do_GET()

            # Human-facing routes get the project's custom 404 page. Missing
            # assets keep the normal asset 404 response so CSS/JS problems are
            # obvious in DevTools instead of returning HTML as a stylesheet.
            suffix = Path(path.rstrip('/')).suffix.lower()
            if not suffix or suffix in {'.html', '.htm'} or path.endswith('/'):
                self._send_404_page()
                return
            self.send_error(404, 'File not found')

    return Handler


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', required=True)
    parser.add_argument('--runtime', required=True)
    parser.add_argument('--port', type=int, default=0)
    args = parser.parse_args()

    root = Path(args.root).resolve()
    runtime = Path(args.runtime).resolve()
    runtime.mkdir(parents=True, exist_ok=True)

    stamp = Stamp(root)
    stamp.refresh()
    threading.Thread(target=watch, args=(stamp,), daemon=True).start()

    server = ThreadingHTTPServer(('127.0.0.1', args.port), make_handler(root, stamp))
    port = server.server_address[1]
    (runtime / 'port.txt').write_text(str(port), encoding='utf-8')
    print(f'Staple IT staging: http://127.0.0.1:{port}/', flush=True)
    print(f'Root: {root}', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
