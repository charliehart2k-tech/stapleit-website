#!/usr/bin/env python3
"""Install the audited Staple IT staging Nginx hardening safely.

The installer finds the active staging server block by its unique server_name,
backs up every file it changes, runs `nginx -t`, and restores the previous
configuration automatically if validation or reload fails.
"""

from __future__ import annotations

import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from typing import NoReturn

REPO = Path(os.environ.get("REPO", "/srv/stapleit/repo"))
EXPLICIT_SITE = os.environ.get("NGINX_SITE", "").strip()
SNIPPET_DIR = Path("/etc/nginx/snippets")
SERVER_NAME = os.environ.get("STAGING_SERVER_NAME", "staging.stapleitdev.co.uk")
INCLUDE = "include /etc/nginx/snippets/stapleit-hardening.conf;"
SOURCES = {
    SNIPPET_DIR / "stapleit-security-headers.conf": REPO / "ops/nginx/stapleit-security-headers.conf",
    SNIPPET_DIR / "stapleit-hardening.conf": REPO / "ops/nginx/stapleit-hardening.conf",
}


def fail(message: str) -> NoReturn:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def run(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(args, text=True, capture_output=True)


def matching_server_blocks(text: str) -> list[tuple[int, int]]:
    """Return top-level server block spans using a quote/comment-aware scanner."""
    spans: list[tuple[int, int]] = []
    for match in re.finditer(r"(?m)^\s*server\s*\{", text):
        open_brace = text.find("{", match.start(), match.end())
        depth = 0
        quote: str | None = None
        escaped = False
        in_comment = False
        for index in range(open_brace, len(text)):
            char = text[index]
            if in_comment:
                if char == "\n":
                    in_comment = False
                continue
            if quote:
                if escaped:
                    escaped = False
                elif char == "\\":
                    escaped = True
                elif char == quote:
                    quote = None
                continue
            if char == "#":
                in_comment = True
                continue
            if char in {"'", '"'}:
                quote = char
                continue
            if char == "{":
                depth += 1
            elif char == "}":
                depth -= 1
                if depth == 0:
                    spans.append((match.start(), index + 1))
                    break
    return spans


def server_name_matches(block: str) -> bool:
    pattern = rf"(?m)^\s*server_name\s+[^;]*(?<![A-Za-z0-9.-]){re.escape(SERVER_NAME)}(?![A-Za-z0-9.-])[^;]*;"
    return re.search(pattern, block) is not None


def candidate_site_files() -> list[Path]:
    if EXPLICIT_SITE:
        return [Path(EXPLICIT_SITE)]

    candidates: dict[Path, Path] = {}
    for directory in (Path("/etc/nginx/sites-enabled"), Path("/etc/nginx/sites-available")):
        if not directory.is_dir():
            continue
        for item in directory.iterdir():
            if not (item.is_file() or item.is_symlink()):
                continue
            try:
                resolved = item.resolve(strict=True)
            except OSError:
                continue
            candidates.setdefault(resolved, resolved)
    return sorted(candidates.values(), key=str)


def find_target() -> tuple[Path, tuple[int, int], str]:
    matches: list[tuple[Path, tuple[int, int], str]] = []
    checked = 0
    for site in candidate_site_files():
        if not site.is_file():
            continue
        checked += 1
        try:
            text = site.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            continue
        for span in matching_server_blocks(text):
            block = text[span[0]:span[1]]
            if server_name_matches(block):
                matches.append((site, span, text))

    if len(matches) != 1:
        locations = ", ".join(str(item[0]) for item in matches) or "none"
        fail(
            f"expected exactly one Nginx server block for {SERVER_NAME}; found {len(matches)} "
            f"across {checked} site file(s) ({locations}). No files were changed."
        )
    return matches[0]


def restore(backups: dict[Path, Path | None]) -> None:
    for target, backup in backups.items():
        try:
            if backup is None:
                target.unlink(missing_ok=True)
            else:
                shutil.copy2(backup, target)
        except OSError as exc:
            print(f"WARNING: could not restore {target}: {exc}", file=sys.stderr)


def main() -> int:
    if os.geteuid() != 0:
        fail("run this installer with sudo")
    for source in SOURCES.values():
        if not source.is_file():
            fail(f"required repository file is missing: {source}")

    site, target_span, original = find_target()
    target_block = original[target_span[0]:target_span[1]]
    root_match = re.search(r"(?m)^\s*root\s+([^;]+);", target_block)
    detected_root = root_match.group(1).strip() if root_match else "inherited/not declared in this block"

    stamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    backup_dir = Path(f"/root/stapleit-nginx-backup-{stamp}")
    backup_dir.mkdir(mode=0o700)
    backups: dict[Path, Path | None] = {}

    def back_up(target: Path) -> None:
        if target.exists():
            backup = backup_dir / target.name
            shutil.copy2(target, backup)
            backups[target] = backup
        else:
            backups[target] = None

    back_up(site)
    SNIPPET_DIR.mkdir(parents=True, exist_ok=True)
    for target, source in SOURCES.items():
        back_up(target)
        shutil.copy2(source, target)
        os.chmod(target, 0o644)
        try:
            os.chown(target, 0, 0)
        except PermissionError:
            pass

    if INCLUDE not in target_block:
        start, end = target_span
        block = original[start:end]
        closing = block.rfind("}")
        if closing < 0:
            restore(backups)
            fail("could not locate the staging server block closing brace")
        insertion = "\n    # Staple IT audited staging hardening.\n    " + INCLUDE + "\n"
        updated_block = block[:closing] + insertion + block[closing:]
        site.write_text(original[:start] + updated_block + original[end:], encoding="utf-8")

    test = run("nginx", "-t")
    if test.returncode != 0:
        restore(backups)
        print(test.stdout, end="")
        print(test.stderr, end="", file=sys.stderr)
        fail("nginx -t failed; previous configuration was restored")

    reload_result = run("systemctl", "reload", "nginx")
    if reload_result.returncode != 0:
        restore(backups)
        run("nginx", "-t")
        run("systemctl", "reload", "nginx")
        print(reload_result.stdout, end="")
        print(reload_result.stderr, end="", file=sys.stderr)
        fail("Nginx reload failed; previous configuration was restored")

    print("PASS: Staple IT staging Nginx hardening is installed and Nginx reloaded.")
    print(f"Server name: {SERVER_NAME}")
    print(f"Site file: {site}")
    print(f"Detected root: {detected_root}")
    print(f"Backup: {backup_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
