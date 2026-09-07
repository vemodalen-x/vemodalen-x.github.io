from __future__ import annotations

import tempfile
import subprocess
import unittest
from pathlib import Path
from unittest.mock import patch

from scripts.check_public_release import scan_file, scan_index


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

    def test_missing_file_fails_closed(self) -> None:
        self.assertTrue(scan_file("missing-public-file.md"))

    def test_rejects_traversal_and_credentials(self) -> None:
        for path in ("../private.md", "/outside.md", "A:/outside.md", ".env", "config/.env.production", "secret.pem"):
            with self.subTest(path=path):
                self.assertTrue(scan_file(path, content=b"sensitive"))

    def test_scans_yaml_toml_and_forward_slash_paths(self) -> None:
        private_path = ("G:/" + "/".join(("Users", "Example", "private"))).encode()
        for extension in ("yaml", "toml", "cjs", "webmanifest"):
            with self.subTest(extension=extension):
                self.assertTrue(scan_file(f"config.{extension}", content=private_path))

    def test_index_snapshot_cannot_be_masked_by_clean_working_copy(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            subprocess.run(["git", "init", "--quiet", str(root)], check=True, capture_output=True)
            # An escaped non-ASCII filename also exercises Git's NUL-delimited output.
            sample = root / "profile \u4e2d\u6587.md"
            sample.write_text("sk-" + "x" * 24, encoding="utf-8")
            subprocess.run(["git", "add", "--", sample.name], cwd=root, check=True, capture_output=True)
            sample.write_text("Clean working copy", encoding="utf-8")
            with patch("scripts.check_public_release.ROOT", root):
                for staged in (False, True):
                    count, findings = scan_index(staged)
                    self.assertEqual(count, 1)
                    self.assertTrue(any("secret" in finding.reason for finding in findings))
                sample.unlink()
                self.assertTrue(scan_index(True)[1])

    def test_working_tree_secret_does_not_change_index_snapshot(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            subprocess.run(["git", "init", "--quiet", str(root)], check=True, capture_output=True)
            sample = root / "profile.md"
            sample.write_text("Reviewed public content", encoding="utf-8")
            subprocess.run(["git", "add", "profile.md"], cwd=root, check=True, capture_output=True)
            sample.write_text("sk-" + "x" * 24, encoding="utf-8")
            with patch("scripts.check_public_release.ROOT", root):
                self.assertEqual(scan_index(True), (1, []))

    def test_rejects_nonregular_or_unmerged_index_entries(self) -> None:
        for mode, stage in (("120000", "0"), ("160000", "0"), ("100644", "2")):
            entry = f"{mode} {'0' * 40} {stage}\tentry\0".encode()
            with self.subTest(mode=mode, stage=stage), patch(
                "scripts.check_public_release.git_output", return_value=entry
            ):
                self.assertTrue(scan_index()[1])

    def test_env_example_is_scanned_for_secrets(self) -> None:
        self.assertTrue(scan_file(".env.example", content=("sk-" + "x" * 24).encode()))


if __name__ == "__main__":
    unittest.main()
