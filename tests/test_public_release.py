from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from scripts.check_public_release import scan_file


class PublicReleaseAuditTests(unittest.TestCase):
    def test_rejects_private_path(self) -> None:
        findings = scan_file("knowledge/personal-kb-index.js")
        self.assertTrue(findings)

    def test_rejects_absolute_user_path(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            sample = root / "sample.md"
            windows_path = "C:" + r"\Users\Example\private\note.md"
            sample.write_text(f"Source: {windows_path}", encoding="utf-8")
            with patch("scripts.check_public_release.ROOT", root):
                findings = scan_file("sample.md")
        self.assertTrue(any("absolute Windows" in finding.reason for finding in findings))

    def test_accepts_public_safe_text(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            sample = root / "sample.md"
            sample.write_text("Public engineering note with no local paths.", encoding="utf-8")
            with patch("scripts.check_public_release.ROOT", root):
                findings = scan_file("sample.md")
        self.assertEqual(findings, [])


if __name__ == "__main__":
    unittest.main()
