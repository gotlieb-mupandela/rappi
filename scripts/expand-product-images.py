#!/usr/bin/env python3
"""Build 5 unique photoreal catalog shots per SKU from family base photos."""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageEnhance, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "data" / "products.json"
BASES = ROOT / "data" / "catalog-bases"
OUT = ROOT / "public" / "products"

PALETTES = [
    (18, 28, 48),      # navy
    (28, 28, 28),      # charcoal
    (210, 40, 40),     # red
    (30, 70, 160),     # royal
    (70, 90, 70),      # olive
    (120, 40, 50),     # maroon
    (20, 90, 90),      # teal
    (200, 90, 20),     # amber
    (80, 80, 90),      # slate
    (40, 50, 90),      # indigo
    (90, 30, 70),      # plum
    (40, 90, 50),      # forest
    (180, 180, 185),   # silver
    (240, 240, 238),   # off-white
    (50, 110, 180),    # sky
    (160, 30, 40),     # crimson
]


def family_for(item: str) -> str:
    u = item.upper()
    if "BOOT" in u:
        return "boot"
    if "SHOE" in u:
        return "shoe"
    if "SOCK" in u:
        return "socks"
    if "GLOVE" in u:
        return "glove"
    if "GOOGEL" in u or "GOGGLE" in u:
        return "goggle"
    if "SCRUM" in u or "CAP" in u:
        return "cap"
    if "SHIN" in u or "SHOULDER" in u or "PROTECTION" in u:
        return "shin"
    if "MAT" in u or "TOWEL" in u:
        return "mat"
    if "SWIM" in u:
        return "swim"
    if "BAG" in u:
        return "bag"
    if "FOOTBALLS" in u or "RUGBY BALL" in u or "VOLLEY" in u:
        return "ball"
    if "DRESS" in u or "SKIRT" in u:
        return "dress"
    if "BRA" in u:
        return "bra"
    if "TRACK" in u or "HOOD" in u or "JACKET" in u:
        return "outer"
    if "LEGGING" in u or "TIGHT" in u or "SWEAT" in u:
        return "bottom"
    if "SET" in u:
        return "kit"
    if "SHORT" in u:
        return "shorts"
    return "tee"


def digest(code: str) -> int:
    return int(hashlib.sha256(code.encode()).hexdigest()[:8], 16)


def load_base(family: str, index: int) -> Image.Image:
    folder = BASES / family
    for ext in (".png", ".jpg", ".jpeg", ".webp"):
        path = folder / f"{index:02d}{ext}"
        if path.is_file():
            return Image.open(path).convert("RGB")
    raise FileNotFoundError(f"missing base {folder}/{index:02d}.*")


def unique_shot(src: Image.Image, code: str, index: int) -> Image.Image:
    h = digest(f"{code}:{index}")
    w, ht = src.size
    # Distinct crop window per SKU/angle so files are not byte-identical.
    inset = 0.03 + (h % 18) / 400
    left = int(w * ((h >> 3) % 9) / 220)
    top = int(ht * ((h >> 7) % 9) / 220)
    right = w - int(w * inset) - ((h >> 11) % 12)
    bottom = ht - int(ht * inset) - ((h >> 15) % 12)
    if right - left < w * 0.82:
        left, right = 0, w
    if bottom - top < ht * 0.82:
        top, bottom = 0, ht
    im = src.crop((left, top, right, bottom))
    im = im.resize((900, 1200), Image.Resampling.LANCZOS)

    palette = PALETTES[h % len(PALETTES)]
    strength = 0.10 + (h % 14) / 100
    if index == 3:
        strength += 0.04
    overlay = Image.new("RGB", im.size, palette)
    im = Image.blend(im, ImageChops.multiply(im, overlay), strength)

    contrast = 0.92 + (h % 20) / 80
    im = ImageEnhance.Contrast(im).enhance(contrast)
    color = 0.88 + (h % 16) / 70
    im = ImageEnhance.Color(im).enhance(color)
    bright = 0.94 + (h % 12) / 80
    im = ImageEnhance.Brightness(im).enhance(bright)
    if index == 3:
        im = im.filter(ImageFilter.UnsharpMask(radius=1.4, percent=90, threshold=3))
    if (h >> 5) % 4 == 0:
        im = ImageOps.autocontrast(im, cutoff=1)
    return im


def main() -> None:
    products = json.loads(DB.read_text())
    missing_families = set()
    for p in products:
        fam = family_for(p["item"])
        dest = OUT / p["id"]
        dest.mkdir(parents=True, exist_ok=True)
        urls: list[str] = []
        for i in range(1, 6):
            try:
                base = load_base(fam, i)
            except FileNotFoundError as exc:
                missing_families.add(str(exc))
                continue
            shot = unique_shot(base, p["code"], i)
            name = f"{i:02d}.webp"
            shot.save(dest / name, "WEBP", quality=86, method=6)
            urls.append(f"/products/{p['id']}/{name}")
        if len(urls) < 4:
            print(f"WARN {p['code']} only {len(urls)} images (family {fam})", file=sys.stderr)
        p["currency"] = "NAD"
        p["images"] = urls
        p["imageUrl"] = urls[0] if urls else ""
    if missing_families:
        print("Missing family bases:", file=sys.stderr)
        for m in sorted(missing_families):
            print(f"  {m}", file=sys.stderr)
        raise SystemExit(1)
    DB.write_text(json.dumps(products, indent=2) + "\n")
    covered = sum(1 for p in products if len(p.get("images") or []) >= 4)
    print(f"Wrote images for {covered}/{len(products)} SKUs")


if __name__ == "__main__":
    main()
