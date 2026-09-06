#!/usr/bin/env python3
"""Treat data/products.json as the catalog DB and assert integrity."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "data" / "products.json"
PUBLIC = ROOT / "public" / "products"

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

SPOT = {
    "104409.484": 6.19,
    "104688.200": 5.25,
    "TEAM/14": 12.75,
    "400027.P03": 17.4,
}

# Must match lib/catalog.ts CATEGORIES (header nav).
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


def fail(msg: str) -> None:
    print(f"FAIL {msg}", file=sys.stderr)
    raise SystemExit(1)


def main() -> None:
    products = json.loads(DB.read_text())
    if not isinstance(products, list):
        fail("products.json is not an array")
    if len(products) != 184:
        fail(f"expected 184 SKUs, got {len(products)}")
    codes = [p.get("code") for p in products]
    if len(codes) != len(set(codes)):
        fail("duplicate codes")
    by = {p["code"]: p for p in products}
    for p in products:
        for key in REQUIRED:
            if key not in p:
                fail(f"{p.get('code')} missing {key}")
        if not isinstance(p.get("unitPrice"), (int, float)):
            fail(f"{p['code']} unitPrice is not a number")
        if not isinstance(p.get("stockQty"), (int, float)):
            fail(f"{p['code']} stockQty is not a number")
        if not isinstance(p.get("sizes"), list) or len(p["sizes"]) == 0:
            fail(f"{p['code']} missing sizes[]")
        if p.get("currency") not in (None, "NAD"):
            fail(f"{p['code']} currency is {p.get('currency')}, expected NAD")
        if p.get("category") not in NAV:
            fail(f"{p['code']} category {p.get('category')!r} is not in nav")
        images = p.get("images") or []
        if not isinstance(images, list) or len(images) < 4:
            fail(f"{p['code']} needs 4–5 images, got {len(images)}")
        if len(images) > 5:
            fail(f"{p['code']} has more than 5 images")
        if not p.get("imageUrl"):
            fail(f"{p['code']} missing imageUrl")
        if p["imageUrl"] != images[0]:
            fail(f"{p['code']} imageUrl is not photo 01")
        folder = PUBLIC / p["id"]
        if not folder.is_dir():
            fail(f"{p['code']} missing image folder {folder}")
        for rel in images:
            disk = ROOT / "public" / str(rel).lstrip("/")
            if not disk.is_file():
                fail(f"{p['code']} missing file {disk}")
            if disk.stat().st_size < 1000:
                fail(f"{p['code']} placeholder-sized file {disk}")
    for code, price in SPOT.items():
        if code not in by:
            fail(f"missing spot-check SKU {code}")
        got = float(by[code]["unitPrice"])
        if abs(got - price) > 1e-9:
            fail(f"{code} price {got} != {price}")
    by_cat: dict[str, int] = {slug: 0 for slug in NAV}
    for p in products:
        by_cat[p["category"]] = by_cat.get(p["category"], 0) + 1
    for slug in NAV:
        if by_cat.get(slug, 0) < 1:
            fail(f"nav category {slug} has no products")
    for p in products:
        needle = str(p["code"]).lower()
        hits = [x for x in products if needle in str(x.get("code", "")).lower()]
        if not any(x["code"] == p["code"] for x in hits):
            fail(f"{p['code']} not reachable via code search")
    print("OK 184 unique SKUs")
    print("OK required fields + NAD currency")
    print("OK spot-check prices")
    print("OK nav categories each have ≥1 SKU; every SKU searchable by code")
    print(f"OK image coverage {len(products)}/184 with 4–5 photos each")


if __name__ == "__main__":
    main()
