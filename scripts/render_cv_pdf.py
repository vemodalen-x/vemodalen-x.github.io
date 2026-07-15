from __future__ import annotations

import argparse
from html import escape
from pathlib import Path

from docx import Document
from docx.oxml.ns import qn
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer


TEAL = HexColor("#0F766E")
GRAPHITE = HexColor("#1F2933")
MUTED = HexColor("#52606D")
LINE = HexColor("#D6DEE2")


def word_flag_enabled(element) -> bool:
    if element is None:
        return False
    value = element.get(qn("w:val"))
    return value is None or value.lower() not in {"0", "false", "off", "no"}


def paragraph_markup(paragraph) -> str:
    fragments: list[str] = []
    for child in paragraph._p:
        texts = "".join(node.text or "" for node in child.iter(qn("w:t")))
        if not texts:
            continue
        content = escape(texts)
        if child.tag == qn("w:hyperlink"):
            relation_id = child.get(qn("r:id"))
            url = paragraph.part.rels[relation_id].target_ref if relation_id else ""
            fragments.append(f'<link href="{escape(url)}" color="#0F766E"><u>{content}</u></link>')
            continue
        properties = child.find(qn("w:rPr"))
        if properties is not None and word_flag_enabled(properties.find(qn("w:i"))):
            content = f"<i>{content}</i>"
        if properties is not None and word_flag_enabled(properties.find(qn("w:b"))):
            content = f"<b>{content}</b>"
        fragments.append(content)
    return "".join(fragments)


def build_styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()["BodyText"]
    return {
        "name": ParagraphStyle("CVName", parent=base, fontName="Helvetica-Bold", fontSize=21, leading=22, textColor=GRAPHITE, alignment=TA_CENTER, spaceAfter=0),
        "title": ParagraphStyle("CVTitle", parent=base, fontName="Helvetica-Bold", fontSize=10.6, leading=12, textColor=TEAL, alignment=TA_CENTER, spaceAfter=1),
        "contact": ParagraphStyle("CVContact", parent=base, fontName="Helvetica", fontSize=7.5, leading=9, textColor=MUTED, alignment=TA_CENTER, spaceAfter=3),
        "section": ParagraphStyle("CVSection", parent=base, fontName="Helvetica-Bold", fontSize=9.5, leading=10.5, textColor=TEAL, spaceBefore=4.5, spaceAfter=1),
        "body": ParagraphStyle("CVBody", parent=base, fontName="Helvetica", fontSize=8.05, leading=9.7, textColor=GRAPHITE, spaceAfter=1.4),
        "job": ParagraphStyle("CVJob", parent=base, fontName="Helvetica-Bold", fontSize=8.45, leading=9.5, textColor=GRAPHITE, spaceBefore=1.5, spaceAfter=0),
        "meta": ParagraphStyle("CVMeta", parent=base, fontName="Helvetica-Bold", fontSize=7.7, leading=8.5, textColor=MUTED, spaceAfter=0.5),
        "bullet": ParagraphStyle("CVBullet", parent=base, fontName="Helvetica", fontSize=7.95, leading=9.4, leftIndent=10, firstLineIndent=-7, textColor=GRAPHITE, spaceAfter=0.8),
    }


def render(input_path: Path, output_path: Path) -> None:
    document = Document(input_path)
    styles = build_styles()
    story = []

    for index, paragraph in enumerate(document.paragraphs):
        markup = paragraph_markup(paragraph)
        if not markup:
            continue
        style_name = paragraph.style.name
        if index == 0:
            story.append(Paragraph(markup, styles["name"]))
        elif index == 1:
            story.append(Paragraph(markup, styles["title"]))
        elif index == 2:
            story.append(Paragraph(markup, styles["contact"]))
            story.append(HRFlowable(width="100%", thickness=0.8, color=TEAL, spaceBefore=1, spaceAfter=1))
        elif style_name == "CV Section":
            story.append(Paragraph(markup, styles["section"]))
            story.append(HRFlowable(width="100%", thickness=0.45, color=LINE, spaceBefore=0, spaceAfter=1.5))
        elif style_name == "CV Job":
            story.append(Paragraph(markup, styles["job"]))
        elif style_name == "CV Meta":
            story.append(Paragraph(markup, styles["meta"]))
        elif style_name == "CV Bullet":
            story.append(Paragraph(markup, styles["bullet"], bulletText="-"))
        else:
            story.append(Paragraph(markup, styles["body"]))

    story.append(Spacer(1, 1))
    output_path.parent.mkdir(parents=True, exist_ok=True)
    pdf = SimpleDocTemplate(
        str(output_path),
        pagesize=letter,
        leftMargin=0.55 * inch,
        rightMargin=0.55 * inch,
        topMargin=0.42 * inch,
        bottomMargin=0.42 * inch,
        title=document.core_properties.title or "Junxian Wu CV",
        author=document.core_properties.author or "Junxian Wu",
        subject=document.core_properties.subject or "Senior AI Engineer CV",
    )
    pdf.build(story)


def main() -> None:
    parser = argparse.ArgumentParser(description="Render the generated CV DOCX as a compact, linked PDF.")
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    render(args.input.resolve(), args.output.resolve())
    print(args.output.resolve())


if __name__ == "__main__":
    main()
