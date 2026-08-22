#!/usr/bin/env python3
"""Fail when governing documentation drifts from active repository contracts."""

from __future__ import annotations

import argparse
from pathlib import Path
import sys


REQUIRED = {
    "README.md": (
        "self-hosted Manrope",
        "1260px",
        "knowledge-guide",
        "tools/audit-repository.py",
        "tools/build-css.py",
    ),
    "AGENTS.md": (
        "tools/audit-repository.py",
        "tools/build-css.py",
        "tests/php/cora-safety-test.php",
        "browser-supplied AI/chat context",
    ),
    "STANDARDS-INDEX.md": (
        "browser calculates and shows the deterministic",
        "knowledge-guide",
        "only prior visitor turns are accepted",
        "1.36 MB",
    ),
    "DESIGN-SYSTEM.md": (
        "self-hosted from `site/assets/fonts/manrope-latin.woff2`",
        "target below 1.5 MB",
        "font-src 'self'",
        "about 1.36 MB",
    ),
    "DEPLOYMENT-NOTES.md": (
        '"mode":"knowledge-guide"',
        "Browser-supplied chat history is untrusted",
        "127.0.0.1:11434",
        "qwen2.5:1.5b-instruct-q5_0",
    ),
}

FORBIDDEN = {
    "README.md": (
        "Current staging loads Manrope from Google Fonts",
        "desktop navigation switches to the mobile menu at `1080px`",
        "staging-safe only",
        "approximately 1.81 MiB",
        "Google Fonts requires",
    ),
    "STANDARDS-INDEX.md": (
        "calculated deterministically on the server, shown immediately",
        "approximately `1.81 MiB`",
        "catalogue-match",
    ),
    "DESIGN-SYSTEM.md": (
        "Current staging loads Manrope through a direct Google Fonts",
        "fonts.googleapis.com",
        "fonts.gstatic.com",
        "decorative hero video: aim below 2.5 MB",
        "expected to appear as a warning in the audit",
    ),
    "DEPLOYMENT-NOTES.md": (
        '"mode":"catalogue-match"',
        "catalogue fallback",
        "catalogue match",
    ),
}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".")
    args = parser.parse_args()
    root = Path(args.root).resolve()
    failures: list[str] = []

    for relative, snippets in REQUIRED.items():
        path = root / relative
        if not path.is_file():
            failures.append(f"missing governing document: {relative}")
            continue
        text = path.read_text(encoding="utf-8")
        for snippet in snippets:
            if snippet not in text:
                failures.append(f"{relative}: missing current contract text: {snippet!r}")

    for relative, snippets in FORBIDDEN.items():
        path = root / relative
        if not path.is_file():
            continue
        text = path.read_text(encoding="utf-8")
        for snippet in snippets:
            if snippet in text:
                failures.append(f"{relative}: stale/contradictory contract remains: {snippet!r}")

    retired_media = root / "site/assets/media/it-support-liquid.mp4"
    if retired_media.exists():
        failures.append("retired IT Support hero video is tracked again")

    if failures:
        print("Standards consistency failures:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        return 1

    print("Standards consistency audit: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
