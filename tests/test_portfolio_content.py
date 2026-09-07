from contextlib import redirect_stdout
from html.parser import HTMLParser
from io import StringIO
import json
from pathlib import Path
import unittest

from examples.run_agentic_workflow import main

ROOT = Path(__file__).resolve().parents[1]


class TraceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_trace = False
        self.text = ""

    def handle_starttag(self, tag, attrs):
        if tag == "pre" and dict(attrs).get("class") == "trace-visual":
            self.in_trace = True

    def handle_endtag(self, tag):
        if tag == "pre":
            self.in_trace = False

    def handle_data(self, data):
        if self.in_trace:
            self.text += data


class PortfolioContentTests(unittest.TestCase):
    def test_homepage_trace_matches_executable_example(self):
        output = StringIO()
        with redirect_stdout(output):
            main()
        run = json.loads(output.getvalue())
        parser = TraceParser()
        parser.feed((ROOT / "index.html").read_text(encoding="utf-8"))
        rows = [line.split() for line in parser.text.strip().splitlines()]
        expected = [[f"{event['sequence']:02d}", event["stage"], event["provider"], event["status"]]
                    for event in run["trace"]]
        self.assertEqual(rows, expected)

    def test_production_work_precedes_independent_projects(self):
        text = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertLess(text.index('id="production-heading"'), text.index('id="public-heading"'))
        self.assertIn('class="cv-action" href="assets/junxian-wu-cv.pdf"', text)
        self.assertIn("Scripted providers; no live LLM integration.", text)


if __name__ == "__main__":
    unittest.main()
