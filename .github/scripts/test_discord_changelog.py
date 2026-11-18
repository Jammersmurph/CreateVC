import importlib.util
from pathlib import Path
import unittest
from urllib.parse import parse_qs, urlsplit


spec = importlib.util.spec_from_file_location(
    "changelog", Path(__file__).with_name("discord-changelog.py")
)
changelog = importlib.util.module_from_spec(spec)
spec.loader.exec_module(changelog)

BUTTON_LABELS = [
    "View commit",
    "View branch",
    "Full changelog",
    "Website",
    "Downloads",
]


class ChangelogTests(unittest.TestCase):
    def event(self, count=1, message="Update mods"):
        return {
            "repository": {"full_name": "Jammersmurph/CreateVC"},
            "ref": "refs/heads/dev",
            "before": "a" * 40,
            "after": "b" * 40,
            "commits": [{
                "id": "b" * 40,
                "message": message,
                "author": {"username": "builder"},
            } for _ in range(count)],
        }

    def commit_texts(self, payload):
        return [
            child["content"]
            for child in payload["components"][0]["components"]
            if child["type"] == 10
            and not child["content"].startswith(("## ", "### "))
        ]

    def action_row(self, payload):
        return next(
            child for child in payload["components"][0]["components"]
            if child["type"] == 1
        )

    def test_layout_and_assets(self):
        payload = next(changelog.commit_pages(self.event(), "revision"))
        self.assertEqual(payload["flags"], 32768)
        self.assertEqual(payload["allowed_mentions"], {"parse": []})
        self.assertNotIn("content", payload)
        self.assertNotIn("embeds", payload)
        container = payload["components"][0]
        self.assertEqual(container["type"], 17)
        self.assertEqual(container["accent_color"], 0x7DBBE6)
        children = container["components"]

        self.assertEqual(children[0]["type"], 12)
        self.assertEqual(children[0]["items"][0]["media"]["url"], changelog.LOGO_URL)
        self.assertEqual([i for i, child in enumerate(children) if child["type"] == 12], [0])
        self.assertEqual(children[1]["type"], 10)
        self.assertIn("**1 commit**", children[1]["content"])
        self.assertIn("Update mods", children[2]["content"])
        self.assertEqual(children[-2]["type"], 10)
        self.assertEqual(children[-2]["content"], "### ⚙️┃Keep up with CreateVC")
        self.assertEqual(children[-1]["type"], 1)

    def test_in_embed_link_buttons(self):
        payload = next(changelog.commit_pages(self.event(), "revision"))
        buttons = self.action_row(payload)["components"]
        self.assertEqual(len(buttons), 5)

        self.assertEqual([button["label"] for button in buttons], BUTTON_LABELS)
        self.assertTrue(all(button["type"] == 2 for button in buttons))
        self.assertTrue(all(button["style"] == 5 for button in buttons))
        self.assertEqual([
            button["url"] for button in buttons
        ], [
            "https://github.com/Jammersmurph/CreateVC/commit/" + "b" * 40,
            "https://github.com/Jammersmurph/CreateVC/tree/dev",
            "https://github.com/Jammersmurph/CreateVC/compare/" + "a" * 40 + "..." + "b" * 40,
            "https://www.createvc.org/",
            "https://www.createvc.org/pack",
        ])

        footer = payload["components"][0]["components"][-2]["content"]
        self.assertNotIn("](", footer)

    def test_navigation_buttons_on_every_page(self):
        pages = list(changelog.commit_pages(self.event(50), "revision"))
        self.assertGreater(len(pages), 1)
        for page in pages:
            buttons = self.action_row(page)["components"]
            urls = {button["label"]: button["url"] for button in buttons}
            self.assertEqual(list(urls), BUTTON_LABELS)
            self.assertEqual(urls["View branch"], "https://github.com/Jammersmurph/CreateVC/tree/dev")
            self.assertEqual(urls["Website"], "https://www.createvc.org/")
            self.assertEqual(urls["Downloads"], "https://www.createvc.org/pack")

    def test_full_message_with_newlines_is_preserved(self):
        message = "First line\n" + "x" * 9000 + "\nFinal line"
        pages = changelog.commit_pages(self.event(message=message), "revision")
        reconstructed = "".join(
            text
            for payload in pages
            for text in self.commit_texts(payload)
        )
        self.assertIn("First line", reconstructed)
        self.assertIn("x" * 9000, reconstructed)
        self.assertIn("Final line", reconstructed)
        self.assertNotIn("...", reconstructed)

    def test_discord_limits_are_respected(self):
        message = "line\n" + "y" * 7000
        pages = list(changelog.commit_pages(self.event(message=message), "revision"))
        self.assertGreater(len(pages), 1)
        for page in pages:
            children = page["components"][0]["components"]
            for child in children:
                if child["type"] == 10:
                    self.assertLessEqual(len(child["content"]), changelog.TEXT_LIMIT)
            total = 1 + len(children) + sum(
                len(child["components"])
                for child in children
                if child["type"] == 1
            )
            self.assertLessEqual(total, changelog.COMPONENT_LIMIT)
            self.assertEqual(total, changelog.COMPONENT_OVERHEAD + len(self.commit_texts(page)))

    def test_many_commits_paginate_instead_of_truncating(self):
        pages = list(changelog.commit_pages(self.event(50), "revision"))
        self.assertGreater(len(pages), 1)
        rendered = [text for page in pages for text in self.commit_texts(page)]
        self.assertEqual(sum(text.count("commit ") for text in rendered), 50)
        self.assertIn("Showing commits", pages[0]["components"][0]["components"][1]["content"])

    def test_empty_push(self):
        self.assertEqual(list(changelog.commit_pages(self.event(0), "revision")), [])

    def test_untrusted_text(self):
        text = changelog.plain_text("@everyone **bold** [link](bad)\nnext")
        self.assertNotIn("@everyone", text)
        self.assertIn(r"\*\*bold\*\*", text)
        self.assertIn("\n", text)

    def test_new_branch_buttons(self):
        event = self.event()
        event["before"] = "0" * 40
        payload = next(changelog.commit_pages(event, "revision"))
        buttons = self.action_row(payload)["components"]
        urls = {button["label"]: button["url"] for button in buttons}
        self.assertEqual(urls["Full changelog"], "https://github.com/Jammersmurph/CreateVC")
        self.assertEqual(urls["View branch"], "https://github.com/Jammersmurph/CreateVC/tree/dev")
        for child in payload["components"][0]["components"]:
            if child["type"] == 10:
                self.assertNotIn("](", child["content"])

    def test_webhook_options_preserve_thread(self):
        url = changelog.webhook_url("https://discord.com/api/webhooks/id/token?thread_id=123&wait=false")
        self.assertEqual(parse_qs(urlsplit(url).query), {
            "thread_id": ["123"], "wait": ["true"], "with_components": ["true"],
        })


if __name__ == "__main__":
    unittest.main()
