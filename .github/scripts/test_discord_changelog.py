import importlib.util
from pathlib import Path
import unittest
from urllib.parse import parse_qs, urlsplit


spec = importlib.util.spec_from_file_location(
    "changelog", Path(__file__).with_name("discord-changelog.py")
)
changelog = importlib.util.module_from_spec(spec)
spec.loader.exec_module(changelog)


class ChangelogTests(unittest.TestCase):
    def event(self, count=1):
        return {
            "repository": {"full_name": "Jammersmurph/CreateVC"},
            "ref": "refs/heads/dev",
            "before": "a" * 40,
            "after": "b" * 40,
            "commits": [{
                "id": "b" * 40,
                "message": "Update mods\nMore details",
                "author": {"username": "builder"},
            } for _ in range(count)],
        }

    def test_layout_and_assets(self):
        payload = changelog.build_payload(self.event(), "b" * 40)
        self.assertEqual(payload["flags"], 32768)
        self.assertEqual(payload["allowed_mentions"], {"parse": []})
        self.assertNotIn("embeds", payload)
        self.assertNotIn("content", payload)
        components = payload["components"][0]["components"]
        self.assertEqual([c["type"] for c in components], [10, 14, 10, 12])
        for component in (components[-1],):
            url = component["items"][0]["media"]["url"]
            self.assertIn("/" + "b" * 40 + "/.github/assets/discord/", url)
            asset = Path(__file__).parents[1] / "assets/discord" / url.split("/")[-1]
            self.assertTrue(asset.is_file())
        self.assertIn("**1 commit**", components[0]["content"])
        self.assertIn("Update mods More details", components[0]["content"])
        self.assertIn(
            "[Modpack downloads](https://www.createvc.org/pack)",
            components[2]["content"],
        )

    def test_truncation_and_missing_author(self):
        event = self.event(6)
        for commit in event["commits"]:
            commit["author"] = None
            commit["message"] = "x" * 5000
        payload = changelog.build_payload(event, "revision")
        text = payload["components"][0]["components"][0]["content"]
        self.assertIn("**6 commits**", text)
        self.assertIn("+ 2 more commits", text)
        self.assertEqual(text.count("by **unknown**"), 4)
        self.assertLess(len(text), 4000)

    def test_empty_push(self):
        self.assertIsNone(changelog.build_payload(self.event(0), "revision"))

    def test_untrusted_text(self):
        text = changelog.plain_text("@everyone **bold** [link](bad)\nnext", 128)
        self.assertNotIn("@everyone", text)
        self.assertIn(r"\*\*bold\*\*", text)
        self.assertNotIn("\n", text)

    def test_new_branch_links_to_repository(self):
        event = self.event()
        event["before"] = "0" * 40
        payload = changelog.build_payload(event, "revision")
        links = payload["components"][0]["components"][2]["content"]
        self.assertIn("[Full changelog](https://github.com/Jammersmurph/CreateVC)", links)

    def test_webhook_options_preserve_thread(self):
        url = changelog.webhook_url("https://discord.com/api/webhooks/id/token?thread_id=123&wait=false")
        self.assertEqual(parse_qs(urlsplit(url).query), {
            "thread_id": ["123"], "wait": ["true"], "with_components": ["true"],
        })


if __name__ == "__main__":
    unittest.main()
