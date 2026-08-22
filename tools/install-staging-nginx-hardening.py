#!/usr/bin/env python3
"""Install the audited Staple IT staging Nginx hardening safely.

The script is deliberately conservative: it only edits the configured staging
site when exactly one server block contains both the expected server_name and
WordPress document root. It backs up everything it changes, runs `nginx -t`,
and restores the previous configuration automatically if validation fails.
"""

from __future__ import annotations

import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone

REPO = Path(os.environ.get("REPO", "/srv/stapleit/repo"))
SITE = Path(os.environ.get("NGINX_SITE", "/etc/nginx/sites-available/stapleit-dev"))
SNIPPET_DIR = Path("/etc/nginx/snippets")
SERVER_NAME = os.environ.get("STAGING_SERVER_NAME", "staging.stapleitdev.co.uk")
WP_ROOT = os.environ.get("WP_ROOT", "/var/www/stapleit")
INCLUDE = "include /etc/nginx/snippets/stapleit-hardening.conf;"
SOURCES = {
    SNIPPET_DIR / "stapleit-security-headers.conf": REPO / "ops/nginx/stapleit-security-headers.conf",
    SNIPPET_DIR / "stapleit-hardening.conf": REPO / "ops/nginx/stapleit-hardening.conf",
}


def fail(message: str) -> "NoReturn":
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def run(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(args, text=True, capture_output=True)


def matching_server_blocks(text: str) -> list[tuple[int, int]]:
    """Return server block spans using a small quote/comment-aware scanner."""
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
    if not SITE.is_file():
        fail(f"staging Nginx site not found: {SITE}")
    for source in SOURCES.values():
        if not source.is_file():
            fail(f"required repository file is missing: {source}")

    original = SITE.read_text(encoding="utf-8")
    spans = matching_server_blocks(original)
    candidates: list[tuple[int, int]] = []
    for start, end in spans:
        block = original[start:end]
        if re.search(rf"(?m)^\s*server_name\s+[^;]*\b{re.escape(SERVER_NAME)}\b[^;]*;", block) and re.search(
            rf"(?m)^\s*root\s+{re.escape(WP_ROOT.rstrip('/'))}/?\s*;", block
        ):
            candidates.append((start, end))

    if len(candidates) != 1:
        fail(
            f"expected exactly one server block for {SERVER_NAME} with root {WP_ROOT}; "
            f"found {len(candidates)}. No files were changed."
        )

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

    back_up(SITE)
    SNIPPET_DIR.mkdir(parents=True, exist_ok=True)
    for target, source in SOURCES.items():
        back_up(target)
        shutil.copy2(source, target)
        os.chmod(target, 0o644)
        try:
            os.chown(target, 0, 0)
        except PermissionError:
            pass

    if INCLUDE not in original:
        start, end = candidates[0]
        block = original[start:end]
        closing = block.rfind("}")
        if closing < 0:
            restore(backups)
            fail("could not locate the staging server block closing brace")
        insertion = "\n    # Staple IT audited staging hardening.\n    " + INCLUDE + "\n"
        updated_block = block[:closing] + insertion + block[closing:]
        updated = original[:start] + updated_block + original[end:]
        SITE.write_text(updated, encoding="utf-8")

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
    print(f"Backup: {backup_dir}")
    print(f"Site: {SITE}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
