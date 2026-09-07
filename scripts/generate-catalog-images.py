#!/usr/bin/env python3
"""Generate unique studio catalog plates for every SKU (no source photos required)."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "data" / "products.json"
OUT = ROOT / "public" / "products"

W, H = 720, 960

PALETTES = [
    (182, 255, 0),
    (30, 108, 255),
    (196, 18, 47),
    (13, 138, 98),
    (255, 106, 0),
    (232, 93, 4),
    (74, 144, 217),
    (200, 40, 40),
    (40, 90, 50),
    (90, 30, 70),
    (20, 90, 90),
    (50, 110, 180),
]


def digest(s: str) -> int:
    return int(hashlib.sha256(s.encode()).hexdigest()[:8], 16)


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


def lerp(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))  # type: ignore[return-value]


def studio(accent: tuple[int, int, int], index: int) -> Image.Image:
    top = (18 + index * 2, 18 + index, 20)
    bot = (8, 8, 10)
    strip = Image.new("RGB", (1, H))
    px = strip.load()
    for y in range(H):
        t = y / (H - 1)
        c = lerp(top, bot, t)
        glow = max(0.0, 1.0 - abs(y - H * 0.28) / (H * 0.45))
        px[0, y] = lerp(c, accent, glow * 0.08)
    return strip.resize((W, H), Image.BILINEAR)


def draw_product(draw: ImageDraw.ImageDraw, family: str, accent: tuple[int, int, int], index: int) -> None:
    cx, cy = W // 2, int(H * 0.46)
    ox = (index - 3) * 10
    oy = (index % 2) * 8

    if family in {"shoe", "boot"}:
        y = cy + 40
        draw.rounded_rectangle((cx - 210 + ox, y - 70 + oy, cx + 220 + ox, y + 70 + oy), 80, fill=accent)
        draw.ellipse((cx + 80 + ox, y - 90 + oy, cx + 230 + ox, y + 40 + oy), fill=lerp(accent, (255, 255, 255), 0.18))
        draw.rectangle((cx - 190 + ox, y + 20 + oy, cx + 160 + ox, y + 58 + oy), fill=(20, 20, 20))
    elif family == "ball":
        r = 168
        draw.ellipse((cx - r + ox, cy - r + oy, cx + r + ox, cy + r + oy), fill=accent)
        draw.arc((cx - r + 18 + ox, cy - r + 18 + oy, cx + r - 18 + ox, cy + r - 18 + oy), 20, 200, fill=(20, 20, 20), width=8)
    elif family == "bag":
        draw.rounded_rectangle((cx - 150 + ox, cy - 40 + oy, cx + 150 + ox, cy + 220 + oy), 28, fill=accent)
        draw.arc((cx - 70 + ox, cy - 120 + oy, cx + 70 + ox, cy + 20 + oy), 200, 340, fill=accent, width=16)
    elif family in {"glove", "shin"}:
        draw.rounded_rectangle((cx - 90 + ox, cy - 160 + oy, cx + 90 + ox, cy + 180 + oy), 40, fill=accent)
        draw.rounded_rectangle((cx + 70 + ox, cy - 140 + oy, cx + 150 + ox, cy - 20 + oy), 24, fill=lerp(accent, (0, 0, 0), 0.15))
    elif family in {"cap", "goggle"}:
        draw.pieslice((cx - 170 + ox, cy - 80 + oy, cx + 170 + ox, cy + 180 + oy), 180, 360, fill=accent)
        draw.rectangle((cx - 190 + ox, cy + 70 + oy, cx + 40 + ox, cy + 100 + oy), fill=lerp(accent, (255, 255, 255), 0.12))
    elif family == "mat":
        draw.rounded_rectangle((cx - 230 + ox, cy - 90 + oy, cx + 230 + ox, cy + 160 + oy), 18, fill=accent)
    elif family == "socks":
        draw.rounded_rectangle((cx - 70 + ox, cy - 200 + oy, cx + 70 + ox, cy + 200 + oy), 36, fill=accent)
        draw.ellipse((cx - 20 + ox, cy + 150 + oy, cx + 110 + ox, cy + 250 + oy), fill=accent)
    elif family in {"dress", "swim", "bra"}:
        draw.polygon(
            [
                (cx - 40 + ox, cy - 180 + oy),
                (cx + 40 + ox, cy - 180 + oy),
                (cx + 150 + ox, cy + 200 + oy),
                (cx - 150 + ox, cy + 200 + oy),
            ],
            fill=accent,
        )
    elif family in {"outer", "kit"}:
        draw.polygon(
            [
                (cx - 200 + ox, cy - 40 + oy),
                (cx - 130 + ox, cy - 170 + oy),
                (cx + 130 + ox, cy - 170 + oy),
                (cx + 200 + ox, cy - 40 + oy),
                (cx + 150 + ox, cy + 210 + oy),
                (cx - 150 + ox, cy + 210 + oy),
            ],
            fill=accent,
        )
    elif family in {"bottom", "shorts"}:
        draw.polygon(
            [
                (cx - 140 + ox, cy - 120 + oy),
                (cx + 140 + ox, cy - 120 + oy),
                (cx + 170 + ox, cy + 200 + oy),
                (cx + 20 + ox, cy + 200 + oy),
                (cx, cy - 20 + oy),
                (cx - 20 + ox, cy + 200 + oy),
                (cx - 170 + ox, cy + 200 + oy),
            ],
            fill=accent,
        )
    elif family == "boot":
        draw.rounded_rectangle((cx - 80 + ox, cy - 200 + oy, cx + 80 + ox, cy + 40 + oy), 30, fill=accent)
        draw.rounded_rectangle((cx - 80 + ox, cy + 10 + oy, cx + 210 + ox, cy + 130 + oy), 50, fill=accent)
    else:
        draw.polygon(
            [
                (cx - 160 + ox, cy - 40 + oy),
                (cx - 210 + ox, cy - 120 + oy),
                (cx - 250 + ox, cy - 40 + oy),
                (cx - 150 + ox, cy + 10 + oy),
                (cx - 150 + ox, cy + 210 + oy),
                (cx + 150 + ox, cy + 210 + oy),
                (cx + 150 + ox, cy + 10 + oy),
                (cx + 250 + ox, cy - 40 + oy),
                (cx + 210 + ox, cy - 120 + oy),
                (cx + 160 + ox, cy - 40 + oy),
                (cx + 90 + ox, cy - 170 + oy),
                (cx - 90 + ox, cy - 170 + oy),
            ],
            fill=accent,
        )


def plate(code: str, item: str, index: int) -> Image.Image:
    h = digest(f"{code}:{index}")
    accent = PALETTES[(h + index) % len(PALETTES)]
    family = family_for(item)
    im = studio(accent, index)
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw_product(draw, family, accent, index)
    im = Image.alpha_composite(im.convert("RGBA"), overlay).convert("RGB")

    contrast = 0.94 + (h % 16) / 90
    im = ImageEnhance.Contrast(im).enhance(contrast)
    im = ImageEnhance.Color(im).enhance(0.9 + (index % 5) / 20)
    if index == 3:
        im = im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=70, threshold=2))
    if index == 5:
        im = ImageEnhance.Brightness(im).enhance(0.92)

    label = ImageDraw.Draw(im)
    font = ImageFont.load_default()
    small = font
    for candidate in (
        "C:/Windows/Fonts/arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "arial.ttf",
    ):
        try:
            font = ImageFont.truetype(candidate, 22)
            small = ImageFont.truetype(candidate, 14)
            break
        except OSError:
            continue
    label.text((36, H - 86), "RAPPI", font=small, fill=(182, 255, 0))
    label.text((36, H - 62), code, font=font, fill=(245, 245, 245))
    return im


def main() -> None:
    products = json.loads(DB.read_text(encoding="utf-8"))
    OUT.mkdir(parents=True, exist_ok=True)
    for i, p in enumerate(products, 1):
        dest = OUT / p["id"]
        dest.mkdir(parents=True, exist_ok=True)
        for n in range(1, 6):
            shot = plate(p["code"], p["item"], n)
            shot.save(dest / f"{n:02d}.webp", "WEBP", quality=82, method=4)
        if i % 20 == 0 or i == len(products):
            print(f"{i}/{len(products)}")
    print(f"Wrote 5 shots each for {len(products)} SKUs")


if __name__ == "__main__":
    main()
