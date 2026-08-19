from __future__ import annotations

from pathlib import Path
import argparse
import sys
import zlib

RASTER_FORMATS = {".png", ".webp", ".jpg", ".jpeg", ".gif"}
VIDEO_FORMATS = {".mp4"}
SUPPORTED = RASTER_FORMATS | VIDEO_FORMATS


def validate_png(path: Path, data: bytes) -> str | None:
    signature = b"\x89PNG\r\n\x1a\n"
    if not data.startswith(signature):
        return "PNG signature does not match file extension"
    offset = len(signature)
    chunk_index = 0
    saw_ihdr = False
    saw_iend = False

    while offset < len(data):
        if offset + 12 > len(data):
            return "PNG has a truncated chunk header"
        length = int.from_bytes(data[offset:offset + 4], "big")
        chunk_type = data[offset + 4:offset + 8]
        chunk_data_start = offset + 8
        chunk_data_end = chunk_data_start + length
        chunk_end = chunk_data_end + 4
        if chunk_end > len(data):
            return f"PNG chunk {chunk_type.decode('ascii', 'replace')} is truncated"

        stored_crc = int.from_bytes(data[chunk_data_end:chunk_end], "big")
        calculated_crc = zlib.crc32(chunk_type)
        calculated_crc = zlib.crc32(data[chunk_data_start:chunk_data_end], calculated_crc) & 0xFFFFFFFF
        if stored_crc != calculated_crc:
            return f"PNG chunk {chunk_type.decode('ascii', 'replace')} failed CRC validation"

        if chunk_index == 0:
            if chunk_type != b"IHDR" or length != 13:
                return "PNG first chunk must be a 13-byte IHDR"
            saw_ihdr = True

        if chunk_type == b"IEND":
            if length != 0:
                return "PNG IEND chunk must be empty"
            saw_iend = True
            if chunk_end != len(data):
                return "PNG contains trailing bytes after IEND"
            break

        offset = chunk_end
        chunk_index += 1

    if not saw_ihdr:
        return "PNG is missing IHDR"
    if not saw_iend:
        return "PNG is missing IEND"
    return None


def validate_webp(path: Path, data: bytes) -> str | None:
    if len(data) < 12 or data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        return "WebP RIFF/WEBP signature does not match file extension"
    declared_size = int.from_bytes(data[4:8], "little") + 8
    if declared_size != len(data):
        return f"WebP RIFF size mismatch (declared {declared_size} bytes, actual {len(data)} bytes)"

    offset = 12
    while offset < len(data):
        if offset + 8 > len(data):
            return "WebP has a truncated chunk header"
        chunk_size = int.from_bytes(data[offset + 4:offset + 8], "little")
        offset += 8 + chunk_size + (chunk_size & 1)
    if offset != len(data):
        return "WebP chunk structure is truncated"
    return None


def validate_jpeg(path: Path, data: bytes) -> str | None:
    if len(data) < 4 or not data.startswith(b"\xff\xd8\xff"):
        return "JPEG signature does not match file extension"
    if not data.endswith(b"\xff\xd9"):
        return "JPEG is missing end-of-image marker"
    return None


def validate_gif(path: Path, data: bytes) -> str | None:
    if len(data) < 7 or data[:6] not in {b"GIF87a", b"GIF89a"}:
        return "GIF signature does not match file extension"
    if data[-1:] != b";":
        return "GIF is missing trailer byte"
    return None


def validate_mp4(path: Path, data: bytes) -> str | None:
    if len(data) < 24:
        return "MP4 is too small to contain a valid ISO base media container"
    if data[4:8] != b"ftyp":
        return "MP4 is missing the leading ftyp box"

    offset = 0
    boxes: list[bytes] = []

    while offset < len(data):
        if offset + 8 > len(data):
            return "MP4 has a truncated top-level box header"

        size_32 = int.from_bytes(data[offset:offset + 4], "big")
        box_type = data[offset + 4:offset + 8]
        header_size = 8

        if size_32 == 1:
            if offset + 16 > len(data):
                return f"MP4 box {box_type.decode('ascii', 'replace')} has a truncated extended-size header"
            box_size = int.from_bytes(data[offset + 8:offset + 16], "big")
            header_size = 16
        elif size_32 == 0:
            box_size = len(data) - offset
        else:
            box_size = size_32

        if box_size < header_size:
            return f"MP4 box {box_type.decode('ascii', 'replace')} has an invalid size"

        box_end = offset + box_size
        if box_end > len(data):
            return f"MP4 box {box_type.decode('ascii', 'replace')} is truncated"

        boxes.append(box_type)
        offset = box_end

        if size_32 == 0:
            break

    if offset != len(data):
        return "MP4 top-level box structure does not consume the complete file"
    if not boxes or boxes[0] != b"ftyp":
        return "MP4 is missing the leading ftyp box"
    for required in (b"moov", b"mdat"):
        if required not in boxes:
            return f"MP4 is missing the required {required.decode('ascii')} box"
    if boxes.index(b"moov") > boxes.index(b"mdat"):
        return "MP4 moov box follows mdat; web video must be fast-start optimised"
    return None


VALIDATORS = {
    ".png": validate_png,
    ".webp": validate_webp,
    ".jpg": validate_jpeg,
    ".jpeg": validate_jpeg,
    ".gif": validate_gif,
    ".mp4": validate_mp4,
}


def audit(root: Path) -> int:
    root = root.resolve()
    if not root.is_dir():
        print(f"ERROR: asset root not found: {root}", file=sys.stderr)
        return 2

    raster_checked = 0
    video_checked = 0
    errors: list[str] = []

    for path in sorted(root.rglob("*")):
        if not path.is_file():
            continue
        suffix = path.suffix.lower()
        if suffix not in SUPPORTED:
            continue

        if suffix in RASTER_FORMATS:
            raster_checked += 1
        else:
            video_checked += 1
        rel = path.relative_to(root)
        try:
            data = path.read_bytes()
        except OSError as exc:
            errors.append(f"{rel}: cannot read asset ({exc})")
            continue

        if not data:
            errors.append(f"{rel}: file is empty")
            continue

        problem = VALIDATORS[suffix](path, data)
        if problem:
            errors.append(f"{rel}: {problem}")

    print(
        "Staple IT asset audit: "
        f"{raster_checked} raster image(s) and {video_checked} MP4 video(s) checked"
    )
    if errors:
        print(f"\nErrors ({len(errors)}):")
        for item in errors:
            print(f"  ERROR {item}")
        return 1

    print("\nPASS: raster image and MP4 container integrity validated.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate image and MP4 integrity for the Staple IT repository.")
    parser.add_argument("--root", default=None)
    args = parser.parse_args()
    root = Path(args.root).resolve() if args.root else Path(__file__).resolve().parents[1] / "site" / "assets"
    return audit(root)


if __name__ == "__main__":
    raise SystemExit(main())
