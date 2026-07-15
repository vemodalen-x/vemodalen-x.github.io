from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


WIDTH = 1200
HEIGHT = 630
BACKGROUND = (248, 246, 242)
GRAPHITE = (38, 47, 49)
SECONDARY = (76, 88, 89)
TEAL = (46, 118, 119)
AMBER = (190, 132, 51)


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(fr"C:\Windows\Fonts\{name}", size=size)


def fit_visual(source: Image.Image) -> Image.Image:
    visual = source.crop((690, 0, source.width, source.height)).convert("RGBA")
    visual.thumbnail((500, 350), Image.Resampling.LANCZOS)

    alpha = Image.new("L", visual.size, 255)
    alpha_draw = ImageDraw.Draw(alpha)
    fade_width = min(130, visual.width // 3)
    for x in range(fade_width):
        opacity = int(255 * (x / fade_width) ** 1.8)
        alpha_draw.line((x, 0, x, visual.height), fill=opacity)
    visual.putalpha(alpha)
    return visual


def render_card(
    visual: Image.Image,
    output: Path,
    eyebrow: str,
    title: tuple[str, str],
    description: str,
    accent: tuple[int, int, int],
) -> None:
    canvas = Image.new("RGB", (WIDTH, HEIGHT), BACKGROUND)
    canvas_rgba = canvas.convert("RGBA")

    visual_layer = Image.new("RGBA", canvas_rgba.size, (0, 0, 0, 0))
    visual_layer.alpha_composite(visual, (WIDTH - visual.width + 12, 150))
    canvas_rgba = Image.alpha_composite(canvas_rgba, visual_layer)

    draw = ImageDraw.Draw(canvas_rgba, "RGBA")
    draw.rectangle((66, 64, 72, 132), fill=accent + (255,))
    draw.text((94, 62), eyebrow, font=font("seguisb.ttf", 17), fill=accent + (255,))

    title_font = font("seguisb.ttf", 48)
    draw.text((66, 155), title[0], font=title_font, fill=GRAPHITE + (255,))
    draw.text((66, 215), title[1], font=title_font, fill=GRAPHITE + (255,))

    description_font = font("segoeui.ttf", 20)
    words = description.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if draw.textlength(candidate, font=description_font) <= 555:
            current = candidate
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)

    for index, line in enumerate(lines[:3]):
        draw.text((68, 313 + index * 29), line, font=description_font, fill=SECONDARY + (255,))

    draw.line((68, 510, 1132, 510), fill=(46, 118, 119, 72), width=2)
    draw.text(
        (68, 536),
        "Agentic AI  |  Multimodal Systems  |  Computer Vision  |  Edge AI",
        font=font("segoeui.ttf", 16),
        fill=TEAL + (255,),
    )
    draw.text((68, 579), "VEMODALEN-X.GITHUB.IO", font=font("seguisb.ttf", 14), fill=GRAPHITE + (180,))

    output.parent.mkdir(parents=True, exist_ok=True)
    canvas_rgba.convert("RGB").save(output, format="PNG", optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output_dir", type=Path)
    args = parser.parse_args()

    source = Image.open(args.source).convert("RGB")
    visual = fit_visual(source)

    cards = [
        (
            "linkedin-featured-agentic-ai.png",
            "AGENTIC & MULTIMODAL AI",
            ("Reliable Agent", "Systems, Not Demos"),
            "Workflow state, local RAG, provider routing, structured outputs, failure handling, traces, and evaluation.",
            TEAL,
        ),
        (
            "linkedin-featured-portfolio.png",
            "JUNXIAN WU / PORTFOLIO",
            ("Computational Photography", "& Deployable Vision AI"),
            "Selected systems across perception, depth, rendering, edge deployment, and evaluation.",
            TEAL,
        ),
        (
            "linkedin-featured-work.png",
            "SELECTED WORK",
            ("Engineering", "Case Studies"),
            "Public-safe case studies from model development and device integration to release-quality evaluation.",
            AMBER,
        ),
        (
            "linkedin-featured-technical-map.png",
            "TECHNICAL MAP",
            ("From Model to", "Runtime & Handoff"),
            "A technical leadership map across vision models, native runtimes, rendering, evaluation, and delivery.",
            TEAL,
        ),
        (
            "linkedin-featured-cv.png",
            "CURRICULUM VITAE",
            ("Junxian Wu", "Senior AI Engineer"),
            "Singapore-based engineer focused on production computer vision, edge AI, and multimodal systems.",
            AMBER,
        ),
    ]

    for filename, eyebrow, title, description, accent in cards:
        render_card(visual, args.output_dir / filename, eyebrow, title, description, accent)


if __name__ == "__main__":
    main()
