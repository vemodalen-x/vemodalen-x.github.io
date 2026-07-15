from pathlib import Path

from docx import Document
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "outputs" / "personal_brand_consolidation_2026_07_14"
OUTPUT_PATH = OUTPUT_DIR / "Junxian_Wu_AI_Systems_CV_2026.docx"

GRAPHITE = "1F2933"
MUTED = "52606D"
TEAL = "0F766E"
LINE = "D6DEE2"


def set_cell_free_page(section):
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Inches(0.52)
    section.bottom_margin = Inches(0.50)
    section.left_margin = Inches(0.58)
    section.right_margin = Inches(0.58)
    section.header_distance = Inches(0.2)
    section.footer_distance = Inches(0.2)


def set_font(run, size, bold=False, color=GRAPHITE, italic=False):
    run.font.name = "Aptos"
    run._element.rPr.rFonts.set(qn("w:eastAsia"), "Aptos")
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = RGBColor.from_string(color)


def set_paragraph_border(paragraph, color=LINE, size="6", space="2"):
    p_pr = paragraph._p.get_or_add_pPr()
    borders = p_pr.find(qn("w:pBdr"))
    if borders is None:
        borders = OxmlElement("w:pBdr")
        p_pr.append(borders)
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), size)
    bottom.set(qn("w:space"), space)
    bottom.set(qn("w:color"), color)
    borders.append(bottom)


def add_hyperlink(paragraph, text, url, color=TEAL):
    part = paragraph.part
    rel_id = part.relate_to(
        url,
        "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink",
        is_external=True,
    )
    hyperlink = OxmlElement("w:hyperlink")
    hyperlink.set(qn("r:id"), rel_id)
    run = OxmlElement("w:r")
    r_pr = OxmlElement("w:rPr")
    r_fonts = OxmlElement("w:rFonts")
    r_fonts.set(qn("w:ascii"), "Aptos")
    r_fonts.set(qn("w:hAnsi"), "Aptos")
    color_el = OxmlElement("w:color")
    color_el.set(qn("w:val"), color)
    underline = OxmlElement("w:u")
    underline.set(qn("w:val"), "single")
    r_pr.extend([r_fonts, color_el, underline])
    text_el = OxmlElement("w:t")
    text_el.text = text
    run.extend([r_pr, text_el])
    hyperlink.append(run)
    paragraph._p.append(hyperlink)


def add_section_heading(doc, text):
    p = doc.add_paragraph(style="CV Section")
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text.upper())
    set_font(run, 10.4, bold=True, color=TEAL)
    set_paragraph_border(p)
    return p


def add_body(doc, text, after=2.5, keep=False):
    p = doc.add_paragraph(style="CV Body")
    p.paragraph_format.space_after = Pt(after)
    p.paragraph_format.keep_with_next = keep
    run = p.add_run(text)
    set_font(run, 9.35)
    return p


def add_bullet(doc, text):
    p = doc.add_paragraph(style="CV Bullet")
    p.paragraph_format.keep_together = True
    run = p.add_run(text)
    set_font(run, 9.15)
    return p


def add_job(doc, title, company, dates, bullets):
    p = doc.add_paragraph(style="CV Job")
    p.paragraph_format.keep_with_next = True
    set_font(p.add_run(title), 9.7, bold=True)
    set_font(p.add_run(f" | {company}"), 9.7, color=MUTED)
    meta = doc.add_paragraph(style="CV Meta")
    meta.paragraph_format.keep_with_next = True
    set_font(meta.add_run(dates), 8.8, bold=True, color=MUTED)
    for bullet in bullets:
        add_bullet(doc, bullet)


def add_compact_entry(doc, title, meta, text=None):
    p = doc.add_paragraph(style="CV Job")
    p.paragraph_format.keep_with_next = True
    set_font(p.add_run(title), 9.6, bold=True)
    set_font(p.add_run(f" | {meta}"), 9.15, color=MUTED)
    if text:
        add_body(doc, text, after=3.0)


def configure_styles(doc):
    normal = doc.styles["Normal"]
    normal.font.name = "Aptos"
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Aptos")
    normal.font.size = Pt(9.35)
    normal.font.color.rgb = RGBColor.from_string(GRAPHITE)
    normal.paragraph_format.space_after = Pt(2.5)
    normal.paragraph_format.line_spacing_rule = WD_LINE_SPACING.SINGLE

    styles = doc.styles
    for name, base in (
        ("CV Body", "Normal"),
        ("CV Section", "Normal"),
        ("CV Job", "Normal"),
        ("CV Meta", "Normal"),
        ("CV Bullet", "List Bullet"),
    ):
        if name not in styles:
            styles.add_style(name, WD_STYLE_TYPE.PARAGRAPH)
        style = styles[name]
        style.base_style = styles[base]
        style.font.name = "Aptos"
        style._element.rPr.rFonts.set(qn("w:eastAsia"), "Aptos")

    styles["CV Body"].paragraph_format.space_after = Pt(2.5)
    styles["CV Body"].paragraph_format.line_spacing = 1.0
    styles["CV Section"].paragraph_format.space_before = Pt(6.5)
    styles["CV Section"].paragraph_format.space_after = Pt(3.0)
    styles["CV Job"].paragraph_format.space_before = Pt(3.2)
    styles["CV Job"].paragraph_format.space_after = Pt(0)
    styles["CV Meta"].paragraph_format.space_after = Pt(1.0)
    bullet = styles["CV Bullet"]
    bullet.paragraph_format.left_indent = Inches(0.18)
    bullet.paragraph_format.first_line_indent = Inches(-0.14)
    bullet.paragraph_format.space_after = Pt(1.35)
    bullet.paragraph_format.line_spacing = 1.0


def build_cv():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    doc = Document()
    set_cell_free_page(doc.sections[0])
    doc.sections[0].different_first_page_header_footer = True
    configure_styles(doc)

    header = doc.sections[0].header.paragraphs[0]
    header.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    header.paragraph_format.space_after = Pt(0)
    set_font(header.add_run("Junxian Wu | Senior AI Engineer"), 8.2, color=MUTED)

    props = doc.core_properties
    props.title = "Junxian Wu - Senior AI Engineer CV"
    props.subject = "Vision, Agentic and Multimodal AI Systems"
    props.author = "Junxian Wu"
    props.keywords = "Senior AI Engineer, Computer Vision, Agentic AI, Multimodal AI, Edge AI"

    name = doc.add_paragraph()
    name.alignment = WD_ALIGN_PARAGRAPH.CENTER
    name.paragraph_format.space_after = Pt(0)
    set_font(name.add_run("JUNXIAN WU"), 23.5, bold=True)

    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title.paragraph_format.space_after = Pt(1.5)
    set_font(title.add_run("Senior AI Engineer | Vision, Agentic & Multimodal Systems"), 11.4, bold=True, color=TEAL)

    contact = doc.add_paragraph()
    contact.alignment = WD_ALIGN_PARAGRAPH.CENTER
    contact.paragraph_format.space_after = Pt(3.5)
    set_font(contact.add_run("Singapore  |  "), 8.7, color=MUTED)
    add_hyperlink(contact, "vemodalenx@gmail.com", "mailto:vemodalenx@gmail.com")
    set_font(contact.add_run("  |  "), 8.7, color=MUTED)
    add_hyperlink(contact, "LinkedIn", "https://www.linkedin.com/in/junxian-wu-085aa11b4/")
    set_font(contact.add_run("  |  "), 8.7, color=MUTED)
    add_hyperlink(contact, "GitHub", "https://github.com/vemodalen-x")
    set_font(contact.add_run("  |  "), 8.7, color=MUTED)
    add_hyperlink(contact, "Portfolio", "https://vemodalen-x.github.io/")
    set_paragraph_border(contact, color=TEAL, size="8", space="4")

    add_section_heading(doc, "Profile")
    add_body(
        doc,
        "Senior AI Engineer with 4+ years turning computer-vision and multimodal models into deployable, measurable, and maintainable systems. Production depth in camera AI, computational photography, edge deployment, C++/Android integration, and visual-quality evaluation; extending the same systems discipline into agentic workflows, local RAG, structured outputs, provider routing, failure handling, and evaluation. Strong fit for Applied AI and Forward Deployed Engineer roles that bridge model capability, runtime constraints, and product delivery.",
        after=3.0,
    )

    add_section_heading(doc, "System Spine")
    spine = doc.add_paragraph(style="CV Body")
    spine.paragraph_format.space_after = Pt(3)
    for index, (label, value) in enumerate(
        [
            ("Perception", "visual and multimodal signals"),
            ("Reasoning", "rules, state, prompts, schemas"),
            ("Runtime", "native, edge, services, APIs"),
            ("Evaluation", "hard cases, traces, release gates"),
            ("Handoff", "interfaces, debug paths, operating knowledge"),
        ]
    ):
        if index:
            set_font(spine.add_run("  |  "), 8.9, color=MUTED)
        set_font(spine.add_run(f"{label}: "), 8.9, bold=True, color=TEAL)
        set_font(spine.add_run(value), 8.9)

    add_section_heading(doc, "Professional Experience")
    add_job(
        doc,
        "Senior AI Engineer",
        "Black Sesame Technologies (Singapore)",
        "Jan 2025 - Present",
        [
            "Own end-to-end delivery for camera and image AI features, translating product requirements and field feedback into technical scope, prototypes, evaluation gates, and production handoff.",
            "Lead real-time composition and portrait-imaging systems combining detection, optical-flow tracking, segmentation and matting, monocular depth, GPU rendering, and application state behavior.",
            "Drive model-to-device delivery across PyTorch, quantization, TFLite/ONNX, C++/Android integration, GPU pipelines, and on-device debugging.",
            "Build multimodal evaluation workflows with provider routing, structured outputs, retry and fallback behavior, hard-case suites, reproducible traces, and release criteria.",
        ],
    )
    add_job(
        doc,
        "AI Engineer",
        "Black Sesame Technologies (Singapore)",
        "Aug 2022 - Jan 2025",
        [
            "Productized vision models for portrait segmentation and matting, monocular depth, object detection, and camera-oriented image processing.",
            "Built repeatable training-to-deployment workflows spanning data preparation, training, quantization, export validation, runtime assumptions, and model replacement checks.",
            "Integrated models into native C++ and Android camera pipelines with simulation, cross-platform builds, device deployment, and visual debugging.",
            "Developed depth-aware bokeh and portrait-rendering workflows with hard-case datasets, batch comparison, golden cases, and release-review tooling.",
        ],
    )

    doc.add_page_break()

    add_section_heading(doc, "Research Experience")
    add_job(
        doc,
        "Research Intern",
        "National University of Singapore",
        "Dec 2021 - Jul 2022",
        [
            "Conducted computer-vision research for construction-site safety, including dataset preparation, image-classification experiments, and spatial risk analysis.",
            "Co-authored a peer-reviewed Automation in Construction paper on supervised and self-supervised feature representation learning.",
        ],
    )

    add_job(
        doc,
        "Research Assistant",
        "Shandong University",
        "Sep 2019 - Jun 2021",
        [
            "Applied computer vision and machine learning to interdisciplinary psychology research, supporting dataset development, experiments, visualization, and reporting."
        ],
    )

    add_section_heading(doc, "Selected Systems")
    for label, text_value in [
        (
            "Production foundation - Vision & Edge AI",
            "Training-to-deployment workflows, quantization and export validation, native C++/Android integration, on-device debugging, and release checks.",
        ),
        (
            "Differentiated domain - Computational Photography",
            "Real-time composition, portrait segmentation and matting, monocular depth, depth-aware bokeh, GPU rendering, and visual-quality evaluation.",
        ),
        (
            "Growth vector - Agentic & Multimodal AI",
            "Public work in local RAG, multimodal workflow design, structured outputs, provider routing, retries and fallbacks, traces, and evaluation.",
        ),
    ]:
        p = doc.add_paragraph(style="CV Body")
        p.paragraph_format.space_after = Pt(2.2)
        set_font(p.add_run(f"{label}: "), 9.25, bold=True, color=TEAL)
        set_font(p.add_run(text_value), 9.25)

    add_section_heading(doc, "Delivery & Technical Leadership")
    for item in [
        "Translate ambiguous product and image-quality issues into scoped work, hard cases, interfaces, and acceptance gates.",
        "Coordinate with product, QA, camera tuning, runtime, and customer-facing teams through integration and release.",
        "Build reproducible handoff assets around assumptions, deployment checks, debugging paths, and review criteria.",
    ]:
        add_bullet(doc, item)

    add_section_heading(doc, "Technical Stack")
    stack_items = [
        (
            "AI and vision",
            "PyTorch, TensorFlow, OpenCV, segmentation, matting, monocular depth, detection, optical flow, VLM/LLM workflows, RAG",
        ),
        (
            "Runtime and deployment",
            "Python, C++, Android/NDK, TFLite, ONNX, ONNX Runtime, TensorRT, OpenGL/GLSL, Docker, FastAPI/Flask",
        ),
        (
            "System quality",
            "quantization, export validation, structured outputs, provider routing, failure handling, hard-case suites, traces, release gates",
        ),
    ]
    for label, value in stack_items:
        p = doc.add_paragraph(style="CV Bullet")
        set_font(p.add_run(f"{label}: "), 9.15, bold=True)
        set_font(p.add_run(value), 9.15)

    add_section_heading(doc, "Education")
    add_compact_entry(doc, "Master of Technology, Intelligent Systems", "NUS-ISS | 2021 - 2022 | GPA 4.33 / 5.00")
    add_compact_entry(doc, "Bachelor of Engineering, Software Engineering", "Shandong University | 2017 - 2021 | GPA 86.86 / 100 | Outstanding Graduate")

    add_section_heading(doc, "Publication")
    pub = doc.add_paragraph(style="CV Body")
    set_font(pub.add_run("Co-author, "), 9.15, bold=True)
    set_font(pub.add_run("\"Automated classification of 'cluttered' construction housekeeping images through supervised and self-supervised feature representation learning,\" "), 9.15)
    set_font(pub.add_run("Automation in Construction"), 9.15, italic=True)
    set_font(pub.add_run(", 2023. "), 9.15)
    add_hyperlink(pub, "DOI: 10.1016/j.autcon.2023.105095", "https://doi.org/10.1016/j.autcon.2023.105095")

    add_section_heading(doc, "Public Evidence")
    proof = doc.add_paragraph(style="CV Body")
    add_hyperlink(proof, "Selected Work", "https://vemodalen-x.github.io/work.html")
    set_font(proof.add_run("  |  "), 9.0, color=MUTED)
    add_hyperlink(proof, "Agentic Systems", "https://vemodalen-x.github.io/agentic-systems.html")
    set_font(proof.add_run("  |  "), 9.0, color=MUTED)
    add_hyperlink(proof, "Technical Map", "https://vemodalen-x.github.io/technical-lines.html")

    doc.save(OUTPUT_PATH)
    print(OUTPUT_PATH)


if __name__ == "__main__":
    build_cv()
