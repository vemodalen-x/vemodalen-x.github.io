from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_PAGES = [
    "index.html",
    "work.html",
    "agentic-systems.html",
    "writing.html",
    "resume.html",
    "technical-lines.html",
]


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.hrefs = []
        self.anchors = set()

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if "id" in attributes:
            self.anchors.add(attributes["id"])
        if tag == "a" and "name" in attributes:
            self.anchors.add(attributes["name"])
        if tag == "a" and "href" in attributes:
            self.hrefs.append(attributes["href"])


def parse_page(path):
    parser = PageParser()
    parser.feed(path.read_text(encoding="utf-8"))
    return parser


def main():
    parsed = {name: parse_page(ROOT / name) for name in PUBLIC_PAGES}
    errors = []
    checked = 0

    for source_name, page in parsed.items():
        source_path = ROOT / source_name
        for href in page.hrefs:
            split = urlsplit(href)
            if split.scheme in {"http", "https", "mailto", "tel"}:
                continue
            target_path = source_path if not split.path else (source_path.parent / unquote(split.path)).resolve()
            checked += 1
            if not target_path.exists():
                errors.append(f"{source_name}: missing file for {href}")
                continue
            if split.fragment and target_path.suffix.lower() == ".html":
                target_name = target_path.name
                target_page = parsed.get(target_name) or parse_page(target_path)
                if unquote(split.fragment) not in target_page.anchors:
                    errors.append(f"{source_name}: missing anchor for {href}")

    if errors:
        print("\n".join(errors))
        raise SystemExit(1)
    print(f"Verified {checked} local links across {len(PUBLIC_PAGES)} public pages.")


if __name__ == "__main__":
    main()
