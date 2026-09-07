#!/usr/bin/env python3
"""Assemble uploaded catalog chunks and write data/products.json."""
from __future__ import annotations

import base64
import gzip
import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "products.json"
CATS = ROOT / "data" / "categories.json"
TMP_PARTS = Path("/tmp")
COMBINED_B64 = Path("/tmp/products.json.gz.b64")
COMBINED_GZ = Path("/tmp/products.json.gz")
DECODED_JSON = Path("/tmp/products.json")

JOMA_CDN = "https://v1.joma-sport.net/"


def fail(msg: str) -> None:
    print(f"FAIL {msg}", file=sys.stderr)
    raise SystemExit(1)


def assemble_parts() -> Path:
    parts = sorted(
        TMP_PARTS.glob("products.json.gz.b64.part*"),
        key=lambda p: p.name,
    )
    if parts:
        print(f"Concatenating {len(parts)} base64 parts")
        COMBINED_B64.write_bytes(b"".join(p.read_bytes() for p in parts))
    if COMBINED_B64.is_file():
        raw = COMBINED_B64.read_bytes()
        # tolerate whitespace/newlines in chunked email-style base64
        compact = re.sub(br"\s+", b"", raw)
        COMBINED_GZ.write_bytes(base64.b64decode(compact))
    if COMBINED_GZ.is_file():
        DECODED_JSON.write_bytes(gzip.decompress(COMBINED_GZ.read_bytes()))
        return DECODED_JSON
    if DECODED_JSON.is_file():
        return DECODED_JSON
    fail("no catalog payload at /tmp/products.json.gz.b64.part* or /tmp/products.json")


def as_number(value):
    if value is None or value == "":
        return None
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return float(value)
    try:
        return float(str(value).replace(" ", "").replace(",", ""))
    except ValueError:
        return None


def is_unavailable(row: dict) -> bool:
    if row.get("available") is False:
        return True
    flags = " ".join(
        str(row.get(k) or "")
        for k in ("status", "availability", "stock_status", "state")
    ).upper()
    return "UNAVAILABLE" in flags or flags in {"OUT_OF_STOCK", "SOLD_OUT"}


def main() -> None:
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else assemble_parts()
    data = json.loads(src.read_text())
    if not isinstance(data, list):
        fail("catalog JSON is not an array")
    if len(data) < 10000:
        fail(f"refusing to write a short catalog ({len(data)} rows)")

    seen = set()
    unique = []
    for row in data:
        if not isinstance(row, dict):
            continue
        code = str(row.get("code") or row.get("sku") or row.get("id") or "").strip()
        if not code or code in seen:
            continue
        seen.add(code)
        unique.append(row)

    OUT.write_text(json.dumps(unique, ensure_ascii=False, separators=(",", ":")) + "\n")

    priced = 0
    unavailable = 0
    images = 0
    for row in unique:
        if is_unavailable(row):
            unavailable += 1
        price = as_number(
            row.get("price_nad_markup67")
            or row.get("unitPrice")
            or row.get("unit_price")
            or row.get("price")
        )
        if price and price > 0:
            priced += 1
        imgs = row.get("images") or []
        image_url = str(row.get("imageUrl") or row.get("image_url") or "")
        if any(str(src).startswith(JOMA_CDN) for src in ([image_url, *imgs] if isinstance(imgs, list) else [image_url])):
            images += 1

    counts = Counter(str(r.get("category") or r.get("category_slug") or "unknown") for r in unique)
    CATS.write_text(
        json.dumps(
            [
                {
                    "slug": slug,
                    "name": slug.replace("-", " ").title(),
                    "count": n,
                }
                for slug, n in counts.most_common()
            ],
            indent=2,
        )
        + "\n"
    )
    print(f"Wrote {len(unique)} products to {OUT}")
    print(f"priced={priced} unavailable={unavailable} joma_images={images}")
    for slug, n in counts.most_common():
        print(f"  {slug}: {n}")


if __name__ == "__main__":
    main()
