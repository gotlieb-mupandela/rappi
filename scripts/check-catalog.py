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
        if p.get("currency") not in (None, "NAD"):
            fail(f"{p['code']} currency is {p.get('currency')}, expected NAD")
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
    print("OK 184 unique SKUs")
    print("OK required fields + NAD currency")
    print("OK spot-check prices")
    print(f"OK image coverage {len(products)}/184 with 4–5 photos each")


if __name__ == "__main__":
    main()
