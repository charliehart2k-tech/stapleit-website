from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import argparse
import re
import sys


ALLOWED_EXTERNAL_HOSTS = {"fonts.googleapis.com", "fonts.gstatic.com"}
RESOURCE_TAGS = {"link", "img", "source", "video", "audio", "iframe"}
WARN_ASSET_BYTES = 1_500_000
ERROR_ASSET_BYTES = 5_000_000
CSS_URL_RE = re.compile(r"url\(\s*(['\"]?)(.*?)\1\s*\)", re.IGNORECASE)
CSS_IMPORT_RE = re.compile(r"@import\s+(?:url\()?\s*['\"]([^'\"]+)['\"]", re.IGNORECASE)


class HtmlAuditParser(HTMLParser):
    def __init__(self, source: Path):
        super().__init__(convert_charrefs=True)
        self.source = source
        self.refs: list[tuple[str, str, str]] = []
        self.ids: set[str] = set()
        self.duplicate_ids: set[str] = set()
        self.inline_script = False
        self.inline_style_block = False
        self.inline_handlers: list[str] = []
        self.style_attributes = 0
        self.json_ld_blocks = 0
        self._script_without_src = False
        self._script_is_json_ld = False
        self._script_has_content = False
        self._style_depth = 0
        self._style_has_content = False

    def handle_starttag(self, tag: str, attrs):
        data = {k.lower(): (v or "") for k, v in attrs}
        tag = tag.lower()

        element_id = data.get("id")
        if element_id:
            if element_id in self.ids:
                self.duplicate_ids.add(element_id)
            self.ids.add(element_id)

        for name in data:
            if name.startswith("on"):
                self.inline_handlers.append(f"<{tag} {name}=...>")
        if "style" in data:
            self.style_attributes += 1

        for attr in ("href", "src", "poster", "action"):
            value = data.get(attr)
            if value:
                self.refs.append((tag, attr, value))

        srcset = data.get("srcset")
        if srcset:
            for candidate in srcset.split(","):
                url = candidate.strip().split()[0] if candidate.strip() else ""
                if url:
                    self.refs.append((tag, "srcset", url))

        if tag == "script" and not data.get("src"):
            self._script_without_src = True
            self._script_is_json_ld = data.get("type", "").lower() == "application/ld+json"
            self._script_has_content = False

        if tag == "style":
            self._style_depth += 1
            self._style_has_content = False

    def handle_endtag(self, tag: str):
        tag = tag.lower()
        if tag == "script" and self._script_without_src:
            if self._script_has_content:
                if self._script_is_json_ld:
                    self.json_ld_blocks += 1
                else:
                    self.inline_script = True
            self._script_without_src = False
            self._script_is_json_ld = False
            self._script_has_content = False

        if tag == "style" and self._style_depth:
            if self._style_has_content:
                self.inline_style_block = True
            self._style_depth -= 1
            self._style_has_content = False

    def handle_data(self, data: str):
        if self._script_without_src and data.strip():
            self._script_has_content = True
        if self._style_depth and data.strip():
            self._style_has_content = True


def local_target(root: Path, source: Path, raw_url: str) -> Path | None:
    parsed = urlsplit(raw_url.strip())
    scheme = parsed.scheme.lower()
    if scheme in {"http", "https", "mailto", "tel", "data", "blob"}:
        return None
    if scheme:
        return None

    path_text = unquote(parsed.path)
    if not path_text:
        return None

    target = root / path_text.lstrip("/") if path_text.startswith("/") else source.parent / path_text
    if path_text.endswith("/"):
        target = target / "index.html"
    elif target.is_dir():
        target = target / "index.html"
    return target.resolve()


def external_host(raw_url: str) -> str | None:
    parsed = urlsplit(raw_url.strip())
    if parsed.scheme.lower() in {"http", "https"}:
        return (parsed.hostname or "").lower()
    return None


def audit(root: Path) -> int:
    root = root.resolve()
    errors: list[str] = []
    warnings: list[str] = []
    html_files = sorted(root.rglob("*.html"))
    checked_refs = 0
    json_ld_blocks = 0

    for html in html_files:
        rel = html.relative_to(root)
        try:
            text = html.read_text(encoding="utf-8-sig")
        except UnicodeDecodeError as exc:
            errors.append(f"{rel}: cannot decode as UTF-8 ({exc})")
            continue

        parser = HtmlAuditParser(html)
        try:
            parser.feed(text)
        except Exception as exc:
            errors.append(f"{rel}: HTML parser error: {exc}")
            continue

        json_ld_blocks += parser.json_ld_blocks
        for duplicate in sorted(parser.duplicate_ids):
            errors.append(f"{rel}: duplicate id #{duplicate}")
        if parser.inline_script:
            errors.append(f"{rel}: executable inline <script> found (CSP expects script-src 'self')")
        if parser.inline_style_block:
            errors.append(f"{rel}: inline <style> block found (CSP expects style-src 'self')")
        if parser.style_attributes:
            errors.append(f"{rel}: {parser.style_attributes} inline style attribute(s) found")
        for handler in parser.inline_handlers:
            errors.append(f"{rel}: inline event handler found: {handler}")

        for tag, attr, raw in parser.refs:
            checked_refs += 1
            lowered = raw.strip().lower()
            if lowered.startswith("javascript:"):
                errors.append(f"{rel}: javascript: URL found in {tag}[{attr}]")
                continue

            host = external_host(raw)
            if host:
                if tag == "script":
                    errors.append(f"{rel}: external runtime script: {raw}")
                elif tag in RESOURCE_TAGS and host not in ALLOWED_EXTERNAL_HOSTS:
                    warnings.append(f"{rel}: external resource host: {host}")
                elif tag == "form" and host not in ALLOWED_EXTERNAL_HOSTS:
                    warnings.append(f"{rel}: external form target: {host}")
                continue

            target = local_target(root, html, raw)
            if target is None:
                continue
            try:
                target.relative_to(root)
            except ValueError:
                errors.append(f"{rel}: local reference escapes site root: {raw}")
                continue
            if not target.exists():
                errors.append(f"{rel}: missing local target for {tag}[{attr}] -> {raw}")

    for css in sorted(root.rglob("*.css")):
        rel = css.relative_to(root)
        text = css.read_text(encoding="utf-8-sig")
        refs = [match.group(2) for match in CSS_URL_RE.finditer(text)]
        refs += [match.group(1) for match in CSS_IMPORT_RE.finditer(text)]
        for raw in refs:
            checked_refs += 1
            if not raw or raw.startswith("#"):
                continue
            host = external_host(raw)
            if host:
                if host not in ALLOWED_EXTERNAL_HOSTS:
                    warnings.append(f"{rel}: external CSS resource host: {host}")
                continue
            target = local_target(root, css, raw)
            if target is not None and not target.exists():
                errors.append(f"{rel}: missing CSS asset -> {raw}")

    assets_root = root / "assets"
    assets = sorted(assets_root.rglob("*")) if assets_root.exists() else []
    for asset in assets:
        if not asset.is_file():
            continue
        size = asset.stat().st_size
        rel = asset.relative_to(root)
        if size >= ERROR_ASSET_BYTES:
            errors.append(f"{rel}: oversized asset ({size / 1024 / 1024:.2f} MiB)")
        elif size >= WARN_ASSET_BYTES:
            warnings.append(f"{rel}: large asset ({size / 1024 / 1024:.2f} MiB)")

    print(
        f"Staple IT site audit: {len(html_files)} HTML files, "
        f"{checked_refs} references checked, {json_ld_blocks} JSON-LD block(s)"
    )
    if warnings:
        print(f"\nWarnings ({len(warnings)}):")
        for item in warnings:
            print(f"  WARN  {item}")
    if errors:
        print(f"\nErrors ({len(errors)}):")
        for item in errors:
            print(f"  ERROR {item}")
        return 1

    print("\nPASS: no blocking site-audit errors found.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit the static Staple IT site without external dependencies.")
    parser.add_argument("--root", default=None, help="Site root. Defaults to ../site relative to this script.")
    args = parser.parse_args()
    default_root = Path(__file__).resolve().parents[1] / "site"
    root = Path(args.root).resolve() if args.root else default_root
    if not root.is_dir():
        print(f"ERROR: site root not found: {root}", file=sys.stderr)
        return 2
    return audit(root)


if __name__ == "__main__":
    raise SystemExit(main())
