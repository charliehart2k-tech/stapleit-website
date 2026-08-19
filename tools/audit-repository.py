#!/usr/bin/env python3
"""High-confidence repository hygiene and secret-leak gate."""

from __future__ import annotations

import argparse
from pathlib import Path
import re
import subprocess
import sys


SECRET_PATTERNS = {
    "private key material": re.compile(rb"-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----"),
    "GitHub token": re.compile(rb"(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,})"),
    "AWS access key": re.compile(rb"\bAKIA[0-9A-Z]{16}\b"),
    "Slack token": re.compile(rb"\bxox[baprs]-[A-Za-z0-9-]{20,}\b"),
    "OpenAI API key": re.compile(rb"\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b"),
}

FORBIDDEN_NAMES = {".env", "wp-config.php"}
FORBIDDEN_SUFFIXES = {".key", ".pem", ".p12", ".pfx", ".sql", ".sqlite", ".sqlite3"}
SKIP_BINARY_SUFFIXES = {
    ".gif", ".ico", ".jpeg", ".jpg", ".mp4", ".png", ".webp", ".woff", ".woff2",
}


def tracked_files(root: Path) -> list[Path]:
    result = subprocess.run(
        ["git", "-C", str(root), "ls-files", "-z"],
        check=True,
        capture_output=True,
    )
    return [root / raw.decode("utf-8") for raw in result.stdout.split(b"\0") if raw]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=Path(__file__).resolve().parents[1], type=Path)
    args = parser.parse_args()
    root = args.root.resolve()
    failures: list[str] = []
    checked = 0

    try:
        files = tracked_files(root)
    except (subprocess.CalledProcessError, FileNotFoundError) as exc:
        print(f"ERROR: cannot enumerate tracked repository files: {exc}", file=sys.stderr)
        return 2

    for path in files:
        rel = path.relative_to(root)
        if path.is_symlink():
            try:
                path.resolve().relative_to(root)
            except ValueError:
                failures.append(f"{rel}: symbolic link escapes repository root")
            continue
        if not path.is_file():
            continue
        if path.name in FORBIDDEN_NAMES or path.suffix.lower() in FORBIDDEN_SUFFIXES:
            failures.append(f"{rel}: sensitive configuration/key/database file type is tracked")
        if path.suffix.lower() in SKIP_BINARY_SUFFIXES or path.stat().st_size > 1_000_000:
            continue
        data = path.read_bytes()
        checked += 1
        for label, pattern in SECRET_PATTERNS.items():
            if pattern.search(data):
                failures.append(f"{rel}: possible {label} detected (value suppressed)")

    print(f"Staple IT repository audit: {len(files)} tracked files, {checked} text files scanned")
    if failures:
        for failure in failures:
            print(f"ERROR: {failure}", file=sys.stderr)
        return 1
    print("PASS: no high-confidence secret or sensitive-file leaks detected.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
