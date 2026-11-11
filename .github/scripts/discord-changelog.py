"""Send a CreateVC-themed Components V2 push notification to Discord."""

import json
import os
import re
import urllib.error
import urllib.parse
import urllib.request


def plain_text(value, limit):
    """Keep push metadata on one line and escape Markdown and mentions."""
    text = " ".join(str(value).split())
    if len(text) > limit:
        text = text[:limit] + "…"
    text = text.replace("@", "@\u200b")
    return re.sub(r"([\\`*_{}\[\]()<>~|])", r"\\\1", text)


def build_payload(event, revision):
    commits = event.get("commits", [])
    if not commits:
        return None

    repository = event["repository"]["full_name"]
    repo_url = "https://github.com/" + urllib.parse.quote(repository, safe="/")
    asset_base = (
        "https://raw.githubusercontent.com/"
        + urllib.parse.quote(repository, safe="/")
        + "/" + urllib.parse.quote(revision, safe="")
        + "/.github/assets/discord/"
    )
    branch = event.get("ref", "").removeprefix("refs/heads/")
    count = len(commits)
    summary = (
        "## 🛠️┃CreateVC Changelog\n"
        f"**{count} {'commit' if count == 1 else 'commits'}** • "
        f"{plain_text(repository, 150)} • {plain_text(branch, 100)}\n\n"
    )
    lines = []
    for commit in commits[:4]:
        author = commit.get("author") or {}
        username = author.get("username") or author.get("name") or "unknown"
        sha = commit.get("id", "")
        url = repo_url + "/commit/" + urllib.parse.quote(sha, safe="")
        lines.append(
            f"[`{plain_text(sha[:6], 6)}`]({url}) "
            f"{plain_text(commit.get('message', ''), 128)} "
            f"by **{plain_text(username, 60)}**"
        )
    if count > 4:
        lines.append(f"-# + {count - 4} more commits — view the full changelog below.")

    before, after = event.get("before", ""), event.get("after", "")
    compare_url = repo_url
    if before and after and set(before) != {"0"} and set(after) != {"0"}:
        compare_url += "/compare/" + urllib.parse.quote(before + "..." + after, safe=".")

    def gallery(filename, description):
        return {"type": 12, "items": [{
            "media": {"url": asset_base + filename},
            "description": description,
        }]}

    return {
        "username": "CreateVC Changelog",
        "flags": 32768,
        "allowed_mentions": {"parse": []},
        "components": [{
            "type": 17,
            "accent_color": 0x7DBBE6,
            "components": [
                {"type": 10, "content": summary + "\n".join(lines)},
                {"type": 14, "divider": True, "spacing": 1},
                {"type": 10, "content": (
                    "### ⚙️┃Keep up with CreateVC\n"
                    f"[Full changelog]({compare_url}) • "
                    "[Website](https://www.createvc.org/) • "
                    "[Modpack downloads](https://www.createvc.org/pack)"
                )},
                gallery("createvc-banner.png", "CreateVC blue wrench banner"),
            ],
        }],
    }


def webhook_url(url):
    parts = urllib.parse.urlsplit(url)
    query = urllib.parse.parse_qs(parts.query)
    query.update({"wait": ["true"], "with_components": ["true"]})
    return urllib.parse.urlunsplit(parts._replace(
        query=urllib.parse.urlencode(query, doseq=True)
    ))


def main():
    with open(os.environ["GITHUB_EVENT_PATH"], encoding="utf-8") as handle:
        event = json.load(handle)
    payload = build_payload(event, os.environ["GITHUB_SHA"])
    if payload is None:
        print("Push contains no commits; skipping Discord notification.")
        return
    webhook = os.environ.get("DISCORD_WEBHOOK")
    if not webhook:
        raise SystemExit("DISCORD_WEBHOOK is not configured")
    request = urllib.request.Request(
        webhook_url(webhook),
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "User-Agent": "CreateVC-GitHub-Actions/1.0",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            print(f"Discord webhook sent successfully ({response.status}).")
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise SystemExit(f"Discord webhook failed ({error.code}): {detail}") from None
    except urllib.error.URLError:
        # Avoid logging exception URLs containing the webhook token.
        raise SystemExit("Discord webhook request failed; check connectivity.") from None


if __name__ == "__main__":
    main()
