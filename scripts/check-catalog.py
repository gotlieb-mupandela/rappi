#!/usr/bin/env python3
"""Treat data/products.json as the catalog DB and assert integrity."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "data" / "products.json"

REQUIRED = (
    "id",
    "code",
    "name",
    "category",
    "subcategory",
    "sizes",
    "unitPrice",
    "stockQty",
    "imageUrl",
    "images",
)

NAV = (
    "sportswear",
    "football",
    "basketball",
    "netball",
    "swimming",
    "rugby",
    "cricket",
    "boxing",
    "hockey",
    "running-fitness",
    "shoes",
    "balls-bags",
)

JOMA_CDN = "https://v1.joma-sport.net/"


def fail(msg: str) -> None:
    print(f"FAIL {msg}", file=sys.stderr)
    raise SystemExit(1)


def is_unavailable(p: dict) -> bool:
    if p.get("available") is False:
        return True
    sizes = p.get("sizes") or []
    stock = sum(int(s.get("stock") or 0) for s in sizes if isinstance(s, dict))
    return stock <= 0 and int(p.get("stockQty") or 0) <= 0


def is_priced(p: dict) -> bool:
    price = p.get("unitPrice", p.get("price", p.get("price_nad_markup67")))
    try:
        return float(price) > 0
    except (TypeError, ValueError):
        return False


def image_list(p: dict) -> list[str]:
    images = p.get("images") or []
    if not isinstance(images, list):
        return []
    return [str(src) for src in images if src]


def main() -> None:
    products = json.loads(DB.read_text())
    if not isinstance(products, list):
        fail("products.json is not an array")
    count = len(products)
    if count < 10000:
        fail(f"expected the full Joma catalog (~11104 SKUs), got {count}")
    if count > 13000:
        fail(f"catalog looks too large: {count}")
    codes = [p.get("code") for p in products]
    if any(not c for c in codes):
        fail("blank product codes")
    if len(codes) != len(set(codes)):
        fail("duplicate codes")

    priced = 0
    unavailable = 0
    joma_images = 0
    local_or_placeholder = 0
    missing_images = 0

    for p in products:
        for key in REQUIRED:
            if key not in p:
                fail(f"{p.get('code')} missing {key}")
        if p.get("currency") not in (None, "NAD"):
            fail(f"{p['code']} currency is {p.get('currency')}, expected NAD")
        if not isinstance(p.get("sizes"), list) or len(p["sizes"]) == 0:
            fail(f"{p['code']} missing sizes[]")
        images = image_list(p)
        if not images and not p.get("imageUrl"):
            missing_images += 1
        cdn = [src for src in ([p.get("imageUrl"), *images]) if str(src).startswith(JOMA_CDN)]
        if cdn:
            joma_images += 1
        elif any(str(src).startswith("/products/") for src in images):
            local_or_placeholder += 1
        if is_unavailable(p):
            unavailable += 1
            if is_priced(p) is False:
                continue
        elif not is_priced(p):
            fail(f"{p['code']} is available but has no N$ sell price")
        else:
            priced += 1
        if is_priced(p) and float(p.get("unitPrice") or p.get("price") or 0) <= 0:
            fail(f"{p['code']} sell price must be a positive N$ amount")

    if local_or_placeholder:
        fail(f"{local_or_placeholder} SKUs still use dummy /products/… images")
    if joma_images < count * 0.95:
        fail(f"Joma CDN image coverage too low: {joma_images}/{count}")

    print(f"OK {count} unique SKUs")
    print(f"OK priced {priced}")
    print(f"OK unavailable {unavailable}")
    print(f"OK image coverage {joma_images}/{count} on {JOMA_CDN}")
    print("OK NAD currency + N$ markup prices (unavailable rows may be unpriced)")
    nav_hits = {slug: 0 for slug in NAV}
    extra = 0
    for p in products:
        slug = p.get("category")
        if slug in nav_hits:
            nav_hits[slug] += 1
        else:
            extra += 1
    for slug, n in nav_hits.items():
        print(f"  {slug}: {n}")
    if extra:
        print(f"  other categories: {extra}")


if __name__ == "__main__":
    main()
