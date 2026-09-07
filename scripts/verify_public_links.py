"""Check local navigation and assets used by the public portfolio pages."""
from html.parser import HTMLParser
from pathlib import Path
import subprocess
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_ORIGIN = "https://vemodalen-x.github.io"
PUBLIC_PAGES = [
    "index.html", "work.html", "agentic-systems.html",
    "writing.html", "resume.html", "technical-lines.html",
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
        attribute = {"a": "href", "link": "href", "img": "src",
                     "script": "src", "source": "src"}.get(tag)
        if attribute and attribute in attributes:
            self.hrefs.append(attributes[attribute])
        if tag == "meta" and (attributes.get("property") == "og:image"
                              or attributes.get("name") == "twitter:image"):
            self.hrefs.append(attributes.get("content", ""))


def parse_page(path):
    parser = PageParser()
    parser.feed(path.read_text(encoding="utf-8"))
    return parser


def tracked_paths(root):
    result = subprocess.run(["git", "ls-files", "-z"], cwd=root, check=True, capture_output=True)
    return {name.decode("utf-8") for name in result.stdout.split(b"\0") if name}


def verify_links(root, pages=PUBLIC_PAGES, tracked=None):
    root = root.resolve()
    tracked = tracked_paths(root) if tracked is None else tracked
    parsed = {}
    errors = []
    checked = 0
    for source_name in pages:
        source_path = root / source_name
        if not source_path.is_file() or source_name not in tracked:
            errors.append(f"{source_name}: page missing from release")
            continue
        page = parsed.setdefault(source_path, parse_page(source_path))
        for href in page.hrefs:
            split = urlsplit(href)
            if split.netloc:
                if split.netloc != urlsplit(PUBLIC_ORIGIN).netloc:
                    continue
            elif split.scheme:
                continue
            if split.path.startswith("/"):
                target = root / unquote(split.path).lstrip("/")
            elif split.path:
                target = source_path.parent / unquote(split.path)
            else:
                target = source_path
            target = target.resolve()
            checked += 1
            if not target.is_relative_to(root):
                errors.append(f"{source_name}: target outside repository for {href}")
                continue
            if target.is_dir():
                target /= "index.html"
            relative = target.relative_to(root).as_posix()
            if not target.is_file() or relative not in tracked:
                errors.append(f"{source_name}: missing release file for {href}")
                continue
            if split.fragment and target.suffix.lower() == ".html":
                if target not in parsed:
                    parsed[target] = parse_page(target)
                if unquote(split.fragment) not in parsed[target].anchors:
                    errors.append(f"{source_name}: missing anchor for {href}")
    return checked, errors


def main():
    checked, errors = verify_links(ROOT)
    if errors:
        print("\n".join(errors))
        raise SystemExit(1)
    print(f"Verified {checked} local links and assets across {len(PUBLIC_PAGES)} public pages.")


if __name__ == "__main__":
    main()
