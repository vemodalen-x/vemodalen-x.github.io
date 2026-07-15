from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


WIDTH = 1584
HEIGHT = 396


def load_font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size=size)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    image = Image.open(args.source).convert("RGB")
    crop_height = round(image.width / 4)
    top = max(0, (image.height - crop_height) // 2)
    image = image.crop((0, top, image.width, top + crop_height))
    image = image.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)

    draw = ImageDraw.Draw(image, "RGBA")
    title_font = load_font(r"C:\Windows\Fonts\seguisb.ttf", 34)
    flow_font = load_font(r"C:\Windows\Fonts\segoeui.ttf", 17)
    stack_font = load_font(r"C:\Windows\Fonts\segoeui.ttf", 15)

    graphite = (38, 47, 49, 255)
    teal = (46, 118, 119, 255)
    secondary = (70, 83, 84, 255)

    x = 72
    draw.rounded_rectangle((x, 73, x + 6, 181), radius=3, fill=teal)
    draw.text((x + 24, 68), "COMPUTATIONAL PHOTOGRAPHY", font=title_font, fill=graphite)
    draw.text(
        (x + 25, 122),
        "Capture  >  Perception  >  Depth  >  Rendering  >  Image Quality",
        font=flow_font,
        fill=secondary,
    )
    draw.text(
        (x + 25, 159),
        "Computer Vision  |  Agentic AI  |  Multimodal Systems",
        font=stack_font,
        fill=teal,
    )

    args.output.parent.mkdir(parents=True, exist_ok=True)
    image.save(args.output, format="PNG", optimize=True)


if __name__ == "__main__":
    main()
