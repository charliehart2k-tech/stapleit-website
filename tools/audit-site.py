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
REPO_ROOT = Path(__file__).resolve().parents[1]
DESIGN_BASELINES_PATH = REPO_ROOT / "DESIGN-BASELINES.json"
ALLOWED_EXTERNAL_HOSTS = {"stapleit.co.uk", "www.google.com"}
RESOURCE_TAGS = {"link", "img", "source", "video", "audio", "iframe"}
RUNTIME_ENDPOINTS = {"/wp-admin/admin-ajax.php"}
WARN_ASSET_BYTES = 1_500_000
ERROR_ASSET_BYTES = 5_000_000
WARN_CSS_BYTES = 50_000
WARN_JS_BYTES = 30_000
CSS_URL_RE = re.compile(r"url\(\s*(['\"]?)(.*?)\1\s*\)", re.I)
CSS_IMPORT_RE = re.compile(r"@import\s+(?:url\()?\s*['\"]([^'\"]+)['\"]", re.I)
FONT_WEIGHT_RE = re.compile(r"font-weight\s*:\s*([1-9]00|[1-9][0-9]{2})\b", re.I)
JS_INLINE_STYLE_RE = re.compile(
    r"(?:createElement\(\s*['\"]style['\"]\s*\)|\.style(?:\.|\[)|setAttribute\(\s*['\"]style['\"])",
    re.I,
)
JS_DYNAMIC_CODE_RE = re.compile(r"(?:\beval\s*\(|\bnew\s+Function\s*\()", re.I)
IMPORTANT_RE = re.compile(r"!important\b", re.I)
TYPE_TOKEN_ALIAS_RE = re.compile(
    r"--(?:home-(?:chapter|card-title|copy)|support-(?:chapter|card-title|copy|lead))\b",
    re.I,
)
CSS_NUMBER = r"(?:\d+(?:\.\d+)?|\.\d+)"
CANONICAL_TOKEN_DECL_RE = re.compile(r"(?P<name>--(?:type|space)-[a-z0-9-]+)\s*:", re.I)
TYPE_TOKEN_LITERAL_RE = re.compile(
    rf"(?P<name>--type-role-(?:small|ui|body|lead|card|feature|section|hero))\s*:\s*"
    rf"(?:clamp\(\s*)?(?P<value>{CSS_NUMBER})(?P<unit>px|rem)\b",
    re.I,
)
CSS_RULE_RE = re.compile(r"(?P<selectors>[^{}]+)\{(?P<declarations>[^{}]*)\}", re.S)
FONT_SIZE_LITERAL_RE = re.compile(rf"font-size\s*:\s*(?P<value>{CSS_NUMBER})(?P<unit>px|rem)\b", re.I)
MIN_HEIGHT_LITERAL_RE = re.compile(rf"min-height\s*:\s*(?P<value>{CSS_NUMBER})(?P<unit>px|rem)\b", re.I)
MEDIA_PRELUDE_RE = re.compile(r"@media(?P<conditions>[^{}]+)\{", re.I)
MEDIA_WIDTH_RE = re.compile(r"\((?:min|max)-width\s*:\s*(?P<value>\d+)px\)", re.I)
READABLE_TYPE_MIN_PX = {
    ".service-slide p": 15.5,
    ".service-points li": 15.0,
    ".audience-item p": 15.5,
    ".trust-proof p": 15.5,
    ".audit-consent": 14.0,
    ".menu-toggle": 13.0,
    ".mobile-menu-primary>.nav-pill": 13.0,
    ".mobile-nav-group>summary": 13.0,
    ".mobile-nav-grid .nav-pill": 13.0,
    ".mobile-menu-utility a": 13.0,
    ".hero-actions .button": 15.0,
    ".service-cta": 15.0,
    ".audit-field>span": 14.0,
    ".audit-form-status": 14.0,
    ".contact-whatsapp": 15.0,
    ".footer-legal-bar p": 12.0,
    ".status-hours span": 12.0,
    ".audit-explainer-toggle": 14.0,
    ".audit-explainer-copy>p": 14.0,
    ".audit-coverage li": 13.0,
}


def css_pixels(value: str, unit: str) -> float:
    numeric = float(value)
    return numeric * 16 if unit.lower() == "rem" else numeric


def selector_contains_element(selectors: str, target: str) -> bool:
    for selector in selectors.split(","):
        offset = selector.find(target)
        while offset >= 0:
            suffix = selector[offset + len(target):]
            is_longer_name = bool(suffix) and (suffix[0].isalnum() or suffix[0] in {"-", "_"})
            if not suffix.startswith("::") and not is_longer_name:
                return True
            offset = selector.find(target, offset + len(target))
    return False


def readable_type_issues(text: str) -> list[str]:
    issues: set[str] = set()
    for rule in CSS_RULE_RE.finditer(text):
        selectors = rule.group("selectors")
        declarations = rule.group("declarations")
        sizes = [
            css_pixels(match.group("value"), match.group("unit"))
            for match in FONT_SIZE_LITERAL_RE.finditer(declarations)
        ]
        if not sizes:
            continue
        for selector, minimum in READABLE_TYPE_MIN_PX.items():
            if not selector_contains_element(selectors, selector):
                continue
            for size in sizes:
                if size < minimum:
                    issues.add(f"{selector} resolves from a {size:g}px literal; minimum is {minimum:g}px")
    return sorted(issues)


def interactive_height_issues(text: str, floors: dict[str, float]) -> list[str]:
    issues: set[str] = set()
    for rule in CSS_RULE_RE.finditer(text):
        selectors = rule.group("selectors")
        declarations = rule.group("declarations")
        heights = [
            css_pixels(match.group("value"), match.group("unit"))
            for match in MIN_HEIGHT_LITERAL_RE.finditer(declarations)
        ]
        if not heights:
            continue
        for selector, minimum in floors.items():
            if not selector_contains_element(selectors, selector):
                continue
            for height in heights:
                if height < minimum:
                    issues.add(
                        f"{selector} resolves from a {height:g}px min-height literal; "
                        f"minimum is {minimum:g}px"
                    )
    return sorted(issues)


def load_design_baselines(errors: list[str]) -> dict:
    try:
        data = json.loads(DESIGN_BASELINES_PATH.read_text(encoding="utf-8"))
    except FileNotFoundError:
        errors.append(f"{DESIGN_BASELINES_PATH.name}: required design baseline is missing")
        return {}
    except (OSError, json.JSONDecodeError) as exc:
        errors.append(f"{DESIGN_BASELINES_PATH.name}: invalid design baseline ({exc})")
        return {}

    required = {
        "type_token_floor_px": dict,
        "interactive_min_height_px": dict,
        "approved_home_media_widths_px": list,
        "home_bundle_sources": list,
        "important_max_by_source": dict,
        "source_css_important_max": (int, float),
    }
    if not isinstance(data, dict) or data.get("version") != 1:
        errors.append(f"{DESIGN_BASELINES_PATH.name}: expected a version 1 JSON object")
        return {}
    for key, expected_type in required.items():
        if not isinstance(data.get(key), expected_type):
            errors.append(f"{DESIGN_BASELINES_PATH.name}: {key} has the wrong type")
            return {}
    numeric_maps = ("type_token_floor_px", "interactive_min_height_px")
    for key in numeric_maps:
        if not all(
            isinstance(name, str) and isinstance(value, (int, float)) and value >= 0
            for name, value in data[key].items()
        ):
            errors.append(f"{DESIGN_BASELINES_PATH.name}: {key} contains an invalid entry")
            return {}
    if not all(
        isinstance(name, str) and isinstance(value, int) and value >= 0
        for name, value in data["important_max_by_source"].items()
    ):
        errors.append(
            f"{DESIGN_BASELINES_PATH.name}: important_max_by_source contains an invalid entry"
        )
        return {}
    if not isinstance(data["source_css_important_max"], int) or data["source_css_important_max"] < 0:
        errors.append(
            f"{DESIGN_BASELINES_PATH.name}: source_css_important_max must be a non-negative integer"
        )
        return {}
    if sum(data["important_max_by_source"].values()) != data["source_css_important_max"]:
        errors.append(
            f"{DESIGN_BASELINES_PATH.name}: per-source specificity ceilings do not match the total"
        )
        return {}
    if not all(isinstance(value, int) and value > 0 for value in data["approved_home_media_widths_px"]):
        errors.append(
            f"{DESIGN_BASELINES_PATH.name}: approved_home_media_widths_px contains an invalid width"
        )
        return {}
    if not all(isinstance(value, str) and value.endswith(".css") for value in data["home_bundle_sources"]):
        errors.append(f"{DESIGN_BASELINES_PATH.name}: home_bundle_sources contains an invalid file")
        return {}
    if len(set(data["home_bundle_sources"])) != len(data["home_bundle_sources"]):
        errors.append(f"{DESIGN_BASELINES_PATH.name}: home_bundle_sources contains a duplicate")
        return {}
    return data


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
        self.stylesheets: list[str] = []
        self.images_missing_alt = 0
        self.images_missing_dimensions = 0
        self.video_issues: list[str] = []
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

        if tag == "link" and "stylesheet" in data.get("rel", "").lower().split():
            self.stylesheets.append(data.get("href", "").strip())
        if tag == "img":
            if "alt" not in data:
                self.images_missing_alt += 1
            if not data.get("width") or not data.get("height"):
                self.images_missing_dimensions += 1
        if tag == "video":
            if "autoplay" in data and ("muted" not in data or "playsinline" not in data):
                self.video_issues.append("autoplay video must be muted and playsinline")
            if data.get("preload", "").lower() not in {"none", "metadata"}:
                self.video_issues.append("video preload must be none or metadata")

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
    baselines = load_design_baselines(errors)
    type_token_floors = {
        str(name): float(value)
        for name, value in baselines.get("type_token_floor_px", {}).items()
    }
    interactive_height_floors = {
        str(selector): float(value)
        for selector, value in baselines.get("interactive_min_height_px", {}).items()
    }
    approved_home_media_widths = {
        int(value) for value in baselines.get("approved_home_media_widths_px", [])
    }
    important_max_by_source = {
        str(name): int(value)
        for name, value in baselines.get("important_max_by_source", {}).items()
    }
    source_css_important_max = int(baselines.get("source_css_important_max", 0))
    html_files = sorted(root.rglob("*.html"))
    checked_refs = 0
    json_ld_count = 0
    indexable: dict[str, tuple[Path, HtmlAuditParser]] = {}
    titles: dict[str, Path] = {}
    descriptions: dict[str, Path] = {}
    important_total = 0

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
        elif parser.title in titles:
            errors.append(f"{rel}: duplicate title also used by {titles[parser.title]}")
        else:
            titles[parser.title] = rel
        if len(parser.h1_texts) != 1 or not parser.h1_texts[0]:
            errors.append(f"{rel}: expected exactly one non-empty H1 in main, found {len(parser.h1_texts)}")
        for previous, current in zip(parser.heading_levels, parser.heading_levels[1:]):
            if current > previous + 1:
                warnings.append(f"{rel}: main heading level jumps from H{previous} to H{current}")
                break
        for duplicate in sorted(parser.duplicate_ids):
            errors.append(f"{rel}: duplicate id #{duplicate}")
        if parser.images_missing_alt:
            errors.append(f"{rel}: {parser.images_missing_alt} image(s) are missing alt attributes")
        if parser.images_missing_dimensions:
            errors.append(f"{rel}: {parser.images_missing_dimensions} image(s) are missing width/height")
        for issue in parser.video_issues:
            errors.append(f"{rel}: {issue}")
        if len(parser.stylesheets) != 1:
            errors.append(f"{rel}: expected exactly one compiled stylesheet, found {len(parser.stylesheets)}")
        elif not parser.stylesheets[0].endswith(".bundle.css"):
            errors.append(f"{rel}: stylesheet must be a generated route bundle: {parser.stylesheets[0]}")
        if parser.inline_script:
            errors.append(f"{rel}: executable inline <script> found")
        if parser.inline_style_block:
            errors.append(f"{rel}: inline <style> block found")
        if parser.style_attributes:
            errors.append(f"{rel}: {parser.style_attributes} inline style attribute(s) found")
        for handler in parser.inline_handlers:
            errors.append(f"{rel}: inline event handler found: {handler}")

        if rel.as_posix() == "it-services/it-support/index.html":
            required_support_copy = (
                'class="support-package-minimum">Recommended for teams of five or more',
                "Requires Microsoft 365 Business Premium or equivalent licensing",
                "LastPass password management included",
                "Exclaimer email signature management included",
                "Microsoft 365 Business Premium included",
                "Huntress endpoint protection",
                "additional Microsoft licensing required to enable those features is charged separately",
                "Everything is confirmed in a written proposal and service agreement before you commit to anything",
            )
            for fragment in required_support_copy:
                if fragment not in text:
                    errors.append(f"{rel}: required package qualifier is missing: {fragment}")

            retired_support_claims = (
                "Microsoft Defender Suite — included in your monthly price",
                "Microsoft Purview Suite — included in your monthly price",
                "No unexpected support or call-out charges",
                "licensing is billed separately at cost",
            )
            for fragment in retired_support_claims:
                if fragment in text:
                    errors.append(f"{rel}: retired or unsafe package claim is present: {fragment}")

            retired_support_ui = (
                'class="support-package-icon"',
                'class="support-extra-price"',
            )
            for fragment in retired_support_ui:
                if fragment in text:
                    errors.append(f"{rel}: retired package UI is still present: {fragment}")

            expected_addon_keys = {
                "server",
                "azure",
                "network",
                "security",
                "governance",
                "cyber-essentials",
                "ai",
                "strategy",
                "disaster-recovery",
            }
            pack_showcase_patterns = {
                "reel item": r'<a\b[^>]*\bdata-pack-reel-item="([^"]+)"',
                "catalogue card": r'<article\b[^>]*\bdata-pack-card="([^"]+)"',
            }
            for role, pattern in pack_showcase_patterns.items():
                matches = re.findall(pattern, text, re.I)
                if len(matches) != len(expected_addon_keys) or set(matches) != expected_addon_keys:
                    errors.append(
                        f"{rel}: add-on {role} keys must map exactly to the nine add-on packs"
                    )

            required_addon_markers = (
                'data-pack-reel',
                'support-pack-reel-features',
                'data-support-addon-planner',
                'Ask Cora which add-on fits',
                'View all add-ons',
            )
            for required_marker in required_addon_markers:
                if required_marker not in text:
                    errors.append(f"{rel}: add-on showcase marker is missing: {required_marker}")

            for retired_marker in (
                'data-pack-finder',
                'data-pack-question',
                'data-pack-gateway',
                'Quick fit check',
                'Show suggestions now',
                'Optional specialist cover',
                'Available add-on packs',
            ):
                if retired_marker in text:
                    errors.append(f"{rel}: retired add-on questionnaire marker is still present: {retired_marker}")

        if parser.canonical and parser.canonical != expected_canonical(root, html):
            errors.append(f"{rel}: canonical mismatch; expected {expected_canonical(root, html)}")
        if parser.meta_description and len(parser.meta_description) < 70:
            warnings.append(f"{rel}: meta description is unusually short ({len(parser.meta_description)} chars)")
        if parser.meta_description:
            if parser.meta_description in descriptions:
                errors.append(f"{rel}: duplicate meta description also used by {descriptions[parser.meta_description]}")
            else:
                descriptions[parser.meta_description] = rel

        if not parser.noindex:
            if not parser.meta_description:
                errors.append(f"{rel}: indexable page missing meta description")
            if not parser.canonical:
                errors.append(f"{rel}: indexable page missing canonical link")
            elif not parser.canonical.startswith(f"{PRODUCTION_ORIGIN}/"):
                errors.append(f"{rel}: canonical must use production HTTPS origin: {parser.canonical}")
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
            if tag == "form" and attr == "action" and urlsplit(raw.strip()).path in RUNTIME_ENDPOINTS:
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
        if not css.name.endswith(".bundle.css"):
            important_count = len(IMPORTANT_RE.findall(text))
            important_total += important_count
            important_limit = important_max_by_source.get(css.name, 0)
            if important_count > important_limit:
                errors.append(
                    f"{rel}: specificity debt increased to {important_count} !important declarations; "
                    f"source ceiling is {important_limit}"
                )
            if css.name.startswith("it-support") and important_count:
                errors.append(f"{rel}: IT Support CSS must not introduce !important")
            aliases = sorted(set(TYPE_TOKEN_ALIAS_RE.findall(text)))
            if aliases:
                errors.append(f"{rel}: duplicate route type token alias found: {', '.join(aliases)}")
            token_declarations = sorted(
                {match.group("name") for match in CANONICAL_TOKEN_DECL_RE.finditer(text)}
            )
            if token_declarations and css.name != "tokens.css":
                errors.append(
                    f"{rel}: canonical type/space tokens may only be declared in tokens.css: "
                    f"{', '.join(token_declarations)}"
                )
            if css.name == "tokens.css":
                declared_type_tokens: set[str] = set()
                for match in TYPE_TOKEN_LITERAL_RE.finditer(text):
                    name = match.group("name").lower()
                    declared_type_tokens.add(name)
                    size = css_pixels(match.group("value"), match.group("unit"))
                    minimum = type_token_floors.get(name)
                    if minimum is not None and size < minimum:
                        errors.append(
                            f"{rel}: {name} falls to {size:g}px; minimum is {minimum:g}px"
                        )
                missing_type_tokens = sorted(set(type_token_floors) - declared_type_tokens)
                if missing_type_tokens:
                    errors.append(
                        f"{rel}: canonical type token declaration missing: "
                        f"{', '.join(missing_type_tokens)}"
                    )
            if css.name.startswith("home-"):
                for media in MEDIA_PRELUDE_RE.finditer(text):
                    for match in MEDIA_WIDTH_RE.finditer(media.group("conditions")):
                        width = int(match.group("value"))
                        if width not in approved_home_media_widths:
                            errors.append(
                                f"{rel}: unregistered homepage media-query width {width}px"
                            )
            for issue in readable_type_issues(text):
                errors.append(f"{rel}: {issue}")
            for issue in interactive_height_issues(text, interactive_height_floors):
                errors.append(f"{rel}: {issue}")
        imports = [m.group(1) for m in CSS_IMPORT_RE.finditer(text)]
        refs = [m.group(2) for m in CSS_URL_RE.finditer(text)] + imports
        if css.stat().st_size > WARN_CSS_BYTES and not css.name.endswith(".bundle.css"):
            warnings.append(f"{rel}: CSS exceeds working 50 KiB budget")
        if imports:
            errors.append(f"{rel}: CSS @import creates a render-blocking request chain")
        if "backdrop-filter:" in text and "-webkit-backdrop-filter:" not in text:
            errors.append(f"{rel}: backdrop-filter is missing its WebKit compatibility declaration")
        weights = sorted({int(m.group(1)) for m in FONT_WEIGHT_RE.finditer(text) if int(m.group(1)) not in {400, 600, 700}})
        if weights:
            errors.append(f"{rel}: non-canonical Manrope weights detected: {', '.join(map(str, weights))}")
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

    if important_total > source_css_important_max:
        errors.append(
            f"CSS specificity debt increased to {important_total} !important declarations; "
            f"source ceiling is {source_css_important_max}"
        )

    for js in sorted(root.rglob("*.js")):
        rel = js.relative_to(root)
        text = js.read_text(encoding="utf-8-sig")
        if js.stat().st_size > WARN_JS_BYTES:
            warnings.append(f"{rel}: JavaScript exceeds working 30 KiB budget")
        if JS_INLINE_STYLE_RE.search(text):
            errors.append(f"{rel}: runtime inline style injection/mutation found")
        if JS_DYNAMIC_CODE_RE.search(text):
            errors.append(f"{rel}: dynamic code execution found")

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

    security_txt = root / ".well-known" / "security.txt"
    if not security_txt.is_file():
        errors.append(".well-known/security.txt: missing")
    else:
        security_text = security_txt.read_text(encoding="utf-8-sig")
        if "Contact: mailto:hello@stapleit.co.uk" not in security_text:
            errors.append(".well-known/security.txt: missing security contact")
        if f"Canonical: {PRODUCTION_ORIGIN}/.well-known/security.txt" not in security_text:
            errors.append(".well-known/security.txt: missing production canonical")

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
