#!/usr/bin/env python3
"""Compile audited static HTML into revisioned WordPress theme templates."""

from __future__ import annotations

import argparse
from pathlib import Path
import re


STATIC_PAGES = [
    ("it-services/index.html", "static-it-services.php"),
    ("it-services/it-support/index.html", "static-it-support.php"),
    ("it-services/it-solutions/index.html", "static-it-solutions.php"),
    ("it-services/it-consultancy/index.html", "static-it-consultancy.php"),
    ("it-services/cybersecurity/index.html", "static-cybersecurity.php"),
    ("it-services/ai-integrations/index.html", "static-ai-integrations.php"),
    ("about-us/index.html", "static-about-us.php"),
    ("about-us/who-we-support/index.html", "static-who-we-support.php"),
    ("about-us/our-partners/index.html", "static-our-partners.php"),
    ("about-us/privacy-policy/index.html", "static-privacy-policy.php"),
    ("about-us/legal/index.html", "static-legal.php"),
    ("get-in-touch/index.html", "static-get-in-touch.php"),
    ("get-in-touch/it-audit/index.html", "static-it-audit.php"),
    ("client-portal/index.html", "static-client-portal.php"),
    ("remote-support/index.html", "static-remote-support.php"),
    ("the-staple-blog/index.html", "static-the-staple-blog.php"),
]

THEME_URI = "<?php echo esc_url( get_template_directory_uri() ); ?>"


def build(source: Path, target: Path, version: str, inject_wp_hooks: bool) -> None:
    html = source.read_text(encoding="utf-8")
    replacements = {
        'href="/favicon.ico"': f'href="{THEME_URI}/favicon.ico"',
        'href="/apple-touch-icon.png"': f'href="{THEME_URI}/apple-touch-icon.png"',
        'href="assets/': f'href="{THEME_URI}/assets/',
        'src="assets/': f'src="{THEME_URI}/assets/',
        'href="/assets/': f'href="{THEME_URI}/assets/',
        'src="/assets/': f'src="{THEME_URI}/assets/',
    }
    for old, new in replacements.items():
        html = html.replace(old, new)

    html = re.sub(r'(href="[^"]+\.css)(")', rf"\1?v={version}\2", html)
    html = re.sub(r'(src="[^"]+\.(?:js|mp4))(")', rf"\1?v={version}\2", html)

    if inject_wp_hooks:
        if "<?php wp_head(); ?>" not in html:
            html = html.replace("</head>", "<?php wp_head(); ?>\n</head>", 1)
        if "<?php wp_footer(); ?>" not in html:
            html = html.replace("</body>", "<?php wp_footer(); ?>\n</body>", 1)

    target.write_text(html, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-root", required=True, type=Path)
    parser.add_argument("--theme-root", required=True, type=Path)
    parser.add_argument("--version", required=True)
    args = parser.parse_args()

    source_root = args.source_root.resolve()
    theme_root = args.theme_root.resolve()
    if not source_root.is_dir():
        parser.error(f"source root does not exist: {source_root}")
    theme_root.mkdir(parents=True, exist_ok=True)

    build(source_root / "index.html", theme_root / "front-page.php", args.version, True)
    build(source_root / "404.html", theme_root / "404.php", args.version, False)
    for relative_source, target_name in STATIC_PAGES:
        build(source_root / relative_source, theme_root / target_name, args.version, False)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
