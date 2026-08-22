#!/usr/bin/env python3
"""Install the audited Staple IT staging Nginx hardening safely.

The installer discovers the live staging server block from `nginx -T` instead
of assuming a sites-available layout or public server_name. It supports the
Cloudflare Tunnel origin pattern used on staging: a loopback-only default vhost
with `server_name _;` and the WordPress document root.

Every changed file is backed up, `nginx -t` is run before reload, and the
previous configuration is restored automatically if validation or reload fails.
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
SNIPPET_DIR = Path("/etc/nginx/snippets")
SERVER_NAME = os.environ.get("STAGING_SERVER_NAME", "staging.stapleitdev.co.uk")
WP_ROOT = os.environ.get("WP_ROOT", "/var/www/stapleit").rstrip("/")
INCLUDE = "include /etc/nginx/snippets/stapleit-hardening.conf;"
SOURCES = {
    SNIPPET_DIR / "stapleit-security-headers.conf": REPO / "ops/nginx/stapleit-security-headers.conf",
    SNIPPET_DIR / "stapleit-hardening.conf": REPO / "ops/nginx/stapleit-hardening.conf",
}
CONFIG_MARKER_RE = re.compile(r"(?m)^# configuration file (?P<path>.+):\s*$")
SERVER_NAME_RE_TEMPLATE = r"(?m)^\s*server_name\s+[^;]*(?<![A-Za-z0-9.-]){server}(?![A-Za-z0-9.-])[^;]*;"
LEGACY_SECURITY_INCLUDE_RE = re.compile(
    r"(?m)^(?P<indent>\s*)include\s+(?:/etc/nginx/)?snippets/security-headers\.conf;\s*$"
)


def fail(message: str) -> NoReturn:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def run(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(args, text=True, capture_output=True)


def matching_server_blocks(text: str) -> list[tuple[int, int]]:
    """Return server block spans using a quote/comment-aware scanner."""
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


def nginx_sections(text: str) -> list[tuple[Path, str]]:
    matches = list(CONFIG_MARKER_RE.finditer(text))
    sections: list[tuple[Path, str]] = []
    for index, match in enumerate(matches):
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        raw_path = match.group("path").strip()
        if raw_path.startswith("/"):
            sections.append((Path(raw_path), text[start:end].lstrip("\n")))
    return sections


def server_name_matches(block: str) -> bool:
    pattern = re.compile(SERVER_NAME_RE_TEMPLATE.format(server=re.escape(SERVER_NAME)))
    return pattern.search(block) is not None


def tunnel_origin_matches(block: str) -> bool:
    """Match Staple IT's private Cloudflare Tunnel origin vhost safely."""
    wildcard_name = re.search(r"(?m)^\s*server_name\s+_\s*;", block) is not None
    root_match = re.search(r"(?m)^\s*root\s+([^;]+);", block)
    root_ok = bool(root_match and root_match.group(1).strip().rstrip("/") == WP_ROOT)
    loopback_default = re.search(
        r"(?m)^\s*listen\s+(?:127\.0\.0\.1:\d+|\[::1\]:\d+)[^;]*\bdefault_server\b[^;]*;",
        block,
        re.I,
    ) is not None
    return wildcard_name and root_ok and loopback_default


def target_matches(block: str) -> bool:
    return server_name_matches(block) or tunnel_origin_matches(block)


def block_score(block: str) -> int:
    """Prefer the application-serving vhost over redirects or unrelated blocks."""
    score = 0
    lower = block.lower()
    if server_name_matches(block):
        score += 200
    if tunnel_origin_matches(block):
        score += 180
    if "fastcgi_pass" in lower:
        score += 120
    if "try_files" in lower:
        score += 50
    if re.search(r"(?m)^\s*location\b", block):
        score += 30
    if re.search(r"(?m)^\s*root\s+[^;]+;", block):
        score += 25
    if re.search(r"(?m)^\s*listen\s+[^;]*(?:443|ssl)[^;]*;", block, re.I):
        score += 20
    if re.search(r"(?m)^\s*return\s+30(?:1|2|7|8)\b", block):
        score -= 80
    return score


def choose_candidate(candidates: list[tuple[Path, int, int, str]]) -> tuple[Path, int, int, str]:
    if not candidates:
        fail(
            f"could not find either {SERVER_NAME} or the Staple IT loopback tunnel origin "
            f"(server_name _; root {WP_ROOT}) in nginx -T. No files were changed."
        )
    if len(candidates) == 1:
        return candidates[0]

    ranked = sorted(candidates, key=lambda item: block_score(item[3]), reverse=True)
    best_score = block_score(ranked[0][3])
    tied = [item for item in ranked if block_score(item[3]) == best_score]
    if len(tied) != 1:
        details = ", ".join(f"{path} (score {block_score(block)})" for path, _, _, block in ranked)
        fail(f"found multiple equally plausible staging Nginx blocks: {details}. No files were changed.")
    return ranked[0]


def find_runtime_candidate() -> tuple[Path, str]:
    dump = run("nginx", "-T")
    combined = dump.stdout + "\n" + dump.stderr
    if dump.returncode != 0:
        print(dump.stdout, end="")
        print(dump.stderr, end="", file=sys.stderr)
        fail("nginx -T failed; cannot safely identify the live staging server block")

    candidates: list[tuple[Path, int, int, str]] = []
    for path, content in nginx_sections(combined):
        for start, end in matching_server_blocks(content):
            block = content[start:end]
            if target_matches(block):
                candidates.append((path, start, end, block))

    path, _, _, runtime_block = choose_candidate(candidates)
    if not path.exists():
        fail(f"Nginx reported source file {path}, but that path does not exist. No files were changed.")
    return path, runtime_block


def choose_source_block(text: str) -> tuple[int, int, str]:
    candidates: list[tuple[Path, int, int, str]] = []
    pseudo = Path("source")
    for start, end in matching_server_blocks(text):
        block = text[start:end]
        if target_matches(block):
            candidates.append((pseudo, start, end, block))
    _, start, end, block = choose_candidate(candidates)
    return start, end, block


def detected_root(block: str) -> str:
    match = re.search(r"(?m)^\s*root\s+([^;]+);", block)
    return match.group(1).strip() if match else "not declared in selected block"


def target_description(block: str) -> str:
    return SERVER_NAME if server_name_matches(block) else "Cloudflare Tunnel loopback origin"


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

    site_path, runtime_block = find_runtime_candidate()
    original = site_path.read_text(encoding="utf-8")
    start, end, source_block = choose_source_block(original)

    stamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    backup_dir = Path(f"/root/stapleit-nginx-backup-{stamp}")
    backup_dir.mkdir(mode=0o700)
    backups: dict[Path, Path | None] = {}

    def back_up(target: Path) -> None:
        if target.exists():
            backup = backup_dir / target.name
            counter = 1
            while backup.exists():
                backup = backup_dir / f"{target.name}.{counter}"
                counter += 1
            shutil.copy2(target, backup)
            backups[target] = backup
        else:
            backups[target] = None

    back_up(site_path)
    SNIPPET_DIR.mkdir(parents=True, exist_ok=True)
    for target, source in SOURCES.items():
        back_up(target)
        shutil.copy2(source, target)
        os.chmod(target, 0o644)
        try:
            os.chown(target, 0, 0)
        except PermissionError:
            pass

    if INCLUDE not in source_block:
        legacy = LEGACY_SECURITY_INCLUDE_RE.search(source_block)
        if legacy:
            indent = legacy.group("indent")
            replacement = (
                f"{indent}# Staple IT audited staging hardening.\n"
                f"{indent}{INCLUDE}"
            )
            updated_block = source_block[:legacy.start()] + replacement + source_block[legacy.end():]
        else:
            closing = source_block.rfind("}")
            if closing < 0:
                restore(backups)
                fail("could not locate the staging server block closing brace")
            insertion = "\n    # Staple IT audited staging hardening.\n    " + INCLUDE + "\n"
            updated_block = source_block[:closing] + insertion + source_block[closing:]
        site_path.write_text(original[:start] + updated_block + original[end:], encoding="utf-8")

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
    print(f"Target: {target_description(runtime_block)}")
    print(f"Site file: {site_path}")
    print(f"Detected root: {detected_root(runtime_block)}")
    print(f"Backup: {backup_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
