from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
from xml.etree import ElementTree
import argparse
import json
import re
import sys

PRODUCTION_ORIGIN = "https://stapleit.co.uk"
ALLOWED_EXTERNAL_HOSTS = {"stapleit.co.uk", "fonts.googleapis.com", "fonts.gstatic.com", "www.google.com"}
RESOURCE_TAGS = {"link", "img", "source", "video", "audio", "iframe"}
WARN_ASSET_BYTES = 1_500_000
ERROR_ASSET_BYTES = 5_000_000
CSS_URL_RE = re.compile(r"url\(\s*(['\"]?)(.*?)\1\s*\)", re.I)
CSS_IMPORT_RE = re.compile(r"@import\s+(?:url\()?\s*['\"]([^'\"]+)['\"]", re.I)
FONT_WEIGHT_RE = re.compile(r"font-weight\s*:\s*([1-9]00|[1-9][0-9]{2})\b", re.I)


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
        self.json_ld_blocks: list[str] = []
        self.title_parts: list[str] = []
        self.h1_parts: list[list[str]] = []
        self.heading_levels: list[int] = []
        self.meta_description = ""
        self.robots = ""
        self.canonical = ""
        self.lang = ""
        self._capture_title = False
        self._current_h1: list[str] | None = None
        self._script_without_src = False
        self._script_is_json_ld = False
        self._script_parts: list[str] = []
        self._style_depth = 0
        self._style_has_content = False
        self._main_depth = 0

    def handle_starttag(self, tag: str, attrs):
        data = {k.lower(): (v or "") for k, v in attrs}
        tag = tag.lower()
        if tag == "main":
            self._main_depth += 1
        if tag == "html":
            self.lang = data.get("lang", "").strip()
        elif tag == "title":
            self._capture_title = True
        elif tag == "meta":
            name = data.get("name", "").strip().lower()
            if name == "description":
                self.meta_description = data.get("content", "").strip()
            elif name == "robots":
                self.robots = data.get("content", "").strip().lower()
        elif tag == "link" and "canonical" in data.get("rel", "").lower().split():
            self.canonical = data.get("href", "").strip()

        if self._main_depth and tag in {"h1", "h2", "h3", "h4", "h5", "h6"}:
            self.heading_levels.append(int(tag[1]))
        if self._main_depth and tag == "h1":
            self._current_h1 = []
            self.h1_parts.append(self._current_h1)

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
            if data.get(attr):
                self.refs.append((tag, attr, data[attr]))
        for candidate in data.get("srcset", "").split(","):
            url = candidate.strip().split()[0] if candidate.strip() else ""
            if url:
                self.refs.append((tag, "srcset", url))

        if tag == "script" and not data.get("src"):
            self._script_without_src = True
            self._script_is_json_ld = data.get("type", "").lower() == "application/ld+json"
            self._script_parts = []
        if tag == "style":
            self._style_depth += 1
            self._style_has_content = False

    def handle_endtag(self, tag: str):
        tag = tag.lower()
        if tag == "title":
            self._capture_title = False
        if tag == "h1":
            self._current_h1 = None
        if tag == "script" and self._script_without_src:
            content = "".join(self._script_parts).strip()
            if content:
                if self._script_is_json_ld:
                    self.json_ld_blocks.append(content)
                else:
                    self.inline_script = True
            self._script_without_src = False
            self._script_is_json_ld = False
            self._script_parts = []
        if tag == "style" and self._style_depth:
            if self._style_has_content:
                self.inline_style_block = True
            self._style_depth -= 1
            self._style_has_content = False
        if tag == "main" and self._main_depth:
            self._main_depth -= 1

    def handle_data(self, data: str):
        if self._capture_title:
            self.title_parts.append(data)
        if self._current_h1 is not None:
            self._current_h1.append(data)
        if self._script_without_src:
            self._script_parts.append(data)
        if self._style_depth and data.strip():
            self._style_has_content = True

    @property
    def title(self) -> str:
        return " ".join("".join(self.title_parts).split())

    @property
    def h1_texts(self) -> list[str]:
        return [" ".join("".join(parts).split()) for parts in self.h1_parts]

    @property
    def noindex(self) -> bool:
        return "noindex" in {token.strip() for token in self.robots.split(",")}


def local_target(root: Path, source: Path, raw_url: str) -> Path | None:
    parsed = urlsplit(raw_url.strip())
    if parsed.scheme.lower() in {"http", "https", "mailto", "tel", "data", "blob"} or parsed.scheme:
        return None
    path_text = unquote(parsed.path)
    if not path_text:
        return None
    target = root / path_text.lstrip("/") if path_text.startswith("/") else source.parent / path_text
    if path_text.endswith("/") or target.is_dir():
        target = target / "index.html"
    return target.resolve()


def external_host(raw_url: str) -> str | None:
    parsed = urlsplit(raw_url.strip())
    return (parsed.hostname or "").lower() if parsed.scheme.lower() in {"http", "https"} else None


def expected_canonical(root: Path, html: Path) -> str:
    rel = html.relative_to(root).as_posix()
    if rel == "index.html":
        return f"{PRODUCTION_ORIGIN}/"
    if rel.endswith("/index.html"):
        return f"{PRODUCTION_ORIGIN}/{rel[:-10]}"
    return f"{PRODUCTION_ORIGIN}/{rel}"


def json_ld_types(blocks: list[str], errors: list[str], rel: Path) -> set[str]:
    types: set[str] = set()
    def visit(value):
        if isinstance(value, dict):
            raw = value.get("@type")
            if isinstance(raw, str):
                types.add(raw)
            elif isinstance(raw, list):
                types.update(item for item in raw if isinstance(item, str))
            for child in value.values():
                visit(child)
        elif isinstance(value, list):
            for child in value:
                visit(child)
    for block in blocks:
        try:
            visit(json.loads(block))
        except json.JSONDecodeError as exc:
            errors.append(f"{rel}: invalid JSON-LD ({exc})")
    return types


def audit(root: Path) -> int:
    root = root.resolve()
    errors: list[str] = []
    warnings: list[str] = []
    html_files = sorted(root.rglob("*.html"))
    checked_refs = 0
    json_ld_count = 0
    indexable: dict[str, tuple[Path, HtmlAuditParser]] = {}
    titles: dict[str, Path] = {}
    descriptions: dict[str, Path] = {}

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

        json_ld_count += len(parser.json_ld_blocks)
        types = json_ld_types(parser.json_ld_blocks, errors, rel)
        if parser.lang.lower() != "en-gb":
            errors.append(f"{rel}: html lang must be en-GB")
        if not parser.title:
            errors.append(f"{rel}: missing non-empty <title>")
        if len(parser.h1_texts) != 1 or not parser.h1_texts[0]:
            errors.append(f"{rel}: expected exactly one non-empty H1 in main, found {len(parser.h1_texts)}")
        for previous, current in zip(parser.heading_levels, parser.heading_levels[1:]):
            if current > previous + 1:
                warnings.append(f"{rel}: main heading level jumps from H{previous} to H{current}")
                break
        for duplicate in sorted(parser.duplicate_ids):
            errors.append(f"{rel}: duplicate id #{duplicate}")
        if parser.inline_script:
            errors.append(f"{rel}: executable inline <script> found")
        if parser.inline_style_block:
            errors.append(f"{rel}: inline <style> block found")
        if parser.style_attributes:
            errors.append(f"{rel}: {parser.style_attributes} inline style attribute(s) found")
        for handler in parser.inline_handlers:
            errors.append(f"{rel}: inline event handler found: {handler}")

        if not parser.noindex:
            if not parser.meta_description:
                errors.append(f"{rel}: indexable page missing meta description")
            elif len(parser.meta_description) < 70:
                warnings.append(f"{rel}: meta description is unusually short ({len(parser.meta_description)} chars)")
            if not parser.canonical:
                errors.append(f"{rel}: indexable page missing canonical link")
            elif not parser.canonical.startswith(f"{PRODUCTION_ORIGIN}/"):
                errors.append(f"{rel}: canonical must use production HTTPS origin: {parser.canonical}")
            elif parser.canonical != expected_canonical(root, html):
                errors.append(f"{rel}: canonical mismatch; expected {expected_canonical(root, html)}")
            if parser.title in titles:
                errors.append(f"{rel}: duplicate indexable title also used by {titles[parser.title]}")
            titles[parser.title] = rel
            if parser.meta_description in descriptions:
                errors.append(f"{rel}: duplicate indexable meta description also used by {descriptions[parser.meta_description]}")
            descriptions[parser.meta_description] = rel
            indexable[parser.canonical] = (rel, parser)
            if rel.as_posix() == "index.html":
                if "Organization" not in types:
                    errors.append("index.html: homepage JSON-LD must include Organization")
                if "WebSite" not in types:
                    errors.append("index.html: homepage JSON-LD must include WebSite")

        for tag, attr, raw in parser.refs:
            checked_refs += 1
            if raw.strip().lower().startswith("javascript:"):
                errors.append(f"{rel}: javascript: URL found in {tag}[{attr}]")
                continue
            host = external_host(raw)
            if host:
                if tag == "script":
                    errors.append(f"{rel}: external runtime script: {raw}")
                elif tag in RESOURCE_TAGS and host not in ALLOWED_EXTERNAL_HOSTS:
                    warnings.append(f"{rel}: external resource host: {host}")
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
        imports = [m.group(1) for m in CSS_IMPORT_RE.finditer(text)]
        refs = [m.group(2) for m in CSS_URL_RE.finditer(text)] + imports
        if imports:
            warnings.append(f"{rel}: CSS @import creates a request chain; prefer <link> in HTML")
        weights = sorted({int(m.group(1)) for m in FONT_WEIGHT_RE.finditer(text) if int(m.group(1)) not in {400, 600, 700}})
        if weights:
            warnings.append(f"{rel}: non-canonical Manrope weights detected: {', '.join(map(str, weights))}")
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

    for asset in sorted((root / "assets").rglob("*")) if (root / "assets").exists() else []:
        if not asset.is_file():
            continue
        size = asset.stat().st_size
        rel = asset.relative_to(root)
        if size >= ERROR_ASSET_BYTES:
            errors.append(f"{rel}: oversized asset ({size / 1024 / 1024:.2f} MiB)")
        elif size >= WARN_ASSET_BYTES:
            warnings.append(f"{rel}: large asset ({size / 1024 / 1024:.2f} MiB)")

    robots = root / "robots.txt"
    if not robots.exists():
        errors.append("robots.txt: missing")
    elif f"Sitemap: {PRODUCTION_ORIGIN}/sitemap.xml" not in robots.read_text(encoding="utf-8-sig"):
        errors.append("robots.txt: missing canonical sitemap directive")

    sitemap_urls: set[str] = set()
    sitemap = root / "sitemap.xml"
    if not sitemap.exists():
        errors.append("sitemap.xml: missing")
    else:
        try:
            tree = ElementTree.parse(sitemap)
            ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
            sitemap_urls = {node.text.strip() for node in tree.findall(".//sm:loc", ns) if node.text}
        except ElementTree.ParseError as exc:
            errors.append(f"sitemap.xml: invalid XML ({exc})")
    for canonical in indexable:
        if canonical not in sitemap_urls:
            errors.append(f"sitemap.xml: missing indexable canonical {canonical}")
    for listed in sitemap_urls:
        if listed not in indexable:
            errors.append(f"sitemap.xml: URL is not an indexable canonical page: {listed}")

    print(f"Staple IT site audit: {len(html_files)} HTML files, {checked_refs} references checked, {json_ld_count} JSON-LD block(s), {len(indexable)} indexable page(s)")
    if warnings:
        print(f"\nWarnings ({len(warnings)}):")
        for item in warnings:
            print(f"  WARN  {item}")
    if errors:
        print(f"\nErrors ({len(errors)}):")
        for item in errors:
            print(f"  ERROR {item}")
        return 1
    print("\nPASS: content, security, reference and SEO/AEO static gates passed.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit Staple IT content, security, references and SEO/AEO release gates.")
    parser.add_argument("--root", default=None)
    args = parser.parse_args()
    root = Path(args.root).resolve() if args.root else Path(__file__).resolve().parents[1] / "site"
    if not root.is_dir():
        print(f"ERROR: site root not found: {root}", file=sys.stderr)
        return 2
    return audit(root)

if __name__ == "__main__":
    raise SystemExit(main())
