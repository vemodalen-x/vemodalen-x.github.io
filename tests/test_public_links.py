import tempfile
import unittest
from pathlib import Path

from scripts.verify_public_links import verify_links


class PublicLinkTests(unittest.TestCase):
    def check_site(self, files, tracked=None):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for name, content in files.items():
                path = root / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(content, encoding="utf-8")
            return verify_links(root, ["index.html"], set(files) if tracked is None else tracked)

    def test_missing_images_styles_scripts_and_social_previews_are_rejected(self):
        for markup in ('<img src="absent.png">', '<link href="absent.css">',
                       '<script src="absent.js"></script>',
                       '<meta property="og:image" content="https://vemodalen-x.github.io/absent.png">'):
            with self.subTest(markup=markup):
                self.assertTrue(self.check_site({"index.html": markup})[1])

    def test_untracked_asset_is_not_a_release_file(self):
        self.assertTrue(self.check_site(
            {"index.html": '<img src="local.png">', "local.png": "local"},
            {"index.html"})[1])

    def test_nested_same_name_pages_use_their_own_anchors(self):
        files = {"index.html": '<a href="nested/index.html#child">Nested</a>',
                 "nested/index.html": '<h1 id="child">Child</h1>'}
        self.assertEqual(self.check_site(files)[1], [])

    def test_root_relative_directory_and_encoded_paths_work(self):
        files = {"index.html": '<a href="/nested/#child">Nested</a><img src="my%20photo.png">',
                 "nested/index.html": '<h1 id="child">Child</h1>', "my photo.png": "image"}
        self.assertEqual(self.check_site(files), (2, []))

    def test_missing_anchor_and_path_traversal_are_rejected(self):
        for href in ("#missing", "../private.txt"):
            with self.subTest(href=href):
                self.assertTrue(self.check_site({"index.html": f'<a href="{href}">Link</a>'})[1])

    def test_external_links_are_not_mistaken_for_local_assets(self):
        self.assertEqual(self.check_site({"index.html": '<a href="//example.com/">External</a>'}), (0, []))


if __name__ == "__main__":
    unittest.main()
