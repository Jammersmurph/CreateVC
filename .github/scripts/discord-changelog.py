"""Send CreateVC push changelogs as Discord Components V2 messages."""

import json
import os
import re
import urllib.error
import urllib.parse
import urllib.request


# Discord hard limits for Components V2 messages.
TEXT_LIMIT = 4000           # maximum characters in one text display
MESSAGE_TEXT_LIMIT = 4000   # conservative budget for one webhook post
COMPONENT_OVERHEAD = 11     # container, gallery, summary, divider, footer, button row + 5 buttons
COMPONENT_LIMIT = 40        # maximum components in one message
AUTHOR_LIMIT = 100
MAX_PAGES = 100

LOGO_URL = (
    "https://images-ext-1.discordapp.net/external/"
    "Z9DhR8UCzrNiHK8aOvBeF7xpzRK4rhPWTOn7B7Rf7NI/"
    "https/raw.githubusercontent.com/Jammersmurph/CreateVC-Assets/main/"
    "createvc_smp_logo.png?format=webp&quality=lossless&width=1280&height=720"
)
WEBSITE_URL = "https://www.createvc.org/"
DOWNLOADS_URL = "https://www.createvc.org/pack"

# The release announcement role is the only mention allowed through from commit
# messages. Everything else stays escaped by plain_text().
RELEASE_ROLE_ID = "1447355271830704170"
RELEASE_ROLE_MENTION = f"<@&{RELEASE_ROLE_ID}>"


def plain_text(value):
    """Escape untrusted GitHub metadata without altering its length semantics."""
    text = str(value).replace("@", "@\u200b")
    return re.sub(r"([\\`*_{}\[\]()<>~|])", r"\\\1", text)


def inline_text(value):
    """Collapse whitespace for headings and author names."""
    return plain_text(" ".join(str(value).split()))


def commit_pages(event, revision):
    """Yield changelog pages; no commit text is truncated or omitted."""
    commits = event.get("commits", [])
    if not commits:
        return

    # Kept for caller compatibility; the gallery uses the supplied CreateVC logo URL.
    _ = revision

    repository = event["repository"]["full_name"]
    repo_url = "https://github.com/" + urllib.parse.quote(repository, safe="/")
    branch = event.get("ref", "").removeprefix("refs/heads/")
    count = len(commits)
    before, after = event.get("before", ""), event.get("after", "")
    compare_url = repo_url
    if before and after and set(before) != {"0"} and set(after) != {"0"}:
        compare_url += "/compare/" + urllib.parse.quote(before + "..." + after, safe=".")

    def link_button(label, url):
        return {
            "type": 2,
            "style": 5,
            "label": label,
            "url": url,
        }

    def gallery():
        return {"type": 12, "items": [{
            "media": {"url": LOGO_URL},
            "description": "CreateVC SMP logo",
        }]}

    def text(content):
        return {"type": 10, "content": content}

    def split_text(value, limit=TEXT_LIMIT):
        """Split only on component boundaries; never discard characters."""
        value = str(value)
        while len(value) > limit:
            yield value[:limit]
            value = value[limit:]
        yield value

    page_children = []
    page_text_chars = 0
    page_components = 0
    page_number = 1
    commit_offset = 0
    page_commit_count = 0
    page_latest_commit_url = ""
    page_roles = set()

    def flush_page():
        nonlocal page_children, page_text_chars, page_components
        nonlocal page_number, commit_offset, page_commit_count, page_latest_commit_url
        nonlocal page_roles
        if not page_children:
            return

        summary = (
            f"## 🛠️┃CreateVC Changelog — {page_number}\n"
            f"**{count} {'commit' if count == 1 else 'commits'}** • "
            f"{inline_text(repository)[:150]} • {inline_text(branch)[:100]}\n"
            f"Showing commits {commit_offset + 1}–{commit_offset + page_commit_count} of {count}."
        )
        footer = "### ⚙️┃Keep up with CreateVC"
        branch_url = repo_url
        if branch:
            branch_url += "/tree/" + urllib.parse.quote(branch, safe="/.-_")
        buttons = [
            link_button("View commit", page_latest_commit_url),
            link_button("View branch", branch_url),
            link_button("Full changelog", compare_url),
            link_button("Website", WEBSITE_URL),
            link_button("Downloads", DOWNLOADS_URL),
        ]
        children = (
            [gallery(), text(summary)]
            + page_children
            + [
                {"type": 14, "divider": True, "spacing": 1},
                text(footer),
                {"type": 1, "components": buttons},
            ]
        )

        allowed_mentions = {"parse": []}
        if page_roles:
            allowed_mentions["roles"] = sorted(page_roles)

        yield {
            "username": "CreateVC Changelog",
            "flags": 32768,
            "allowed_mentions": allowed_mentions,
            "components": [{
                "type": 17,
                "accent_color": 0x7DBBE6,
                "components": children,
            }],
        }

        commit_offset += page_commit_count
        page_number += 1
        page_children = []
        page_text_chars = 0
        page_components = 0
        page_commit_count = 0
        page_latest_commit_url = ""
        page_roles = set()

    for index, commit in enumerate(commits, start=1):
        author = commit.get("author") or {}
        username = author.get("username") or author.get("name") or "unknown"
        sha = commit.get("id", "")
        url = repo_url + "/commit/" + urllib.parse.quote(sha, safe="")
        heading = (
            f"**`{plain_text(sha[:6])}`** by **{inline_text(username)[:AUTHOR_LIMIT]}** • "
            f"commit {index} of {count}"
        )
        # Preserve all lines and visible characters while escaping Markdown and
        # mentions. The release role ping is the sole exception: strip it from
        # the escaped text and re-add it verbatim with an allowed_mentions entry.
        raw_message = commit.get("message", "")
        ping_release = RELEASE_ROLE_MENTION in raw_message
        message = plain_text(raw_message.replace(RELEASE_ROLE_MENTION, ""))
        body_chunks = list(split_text(f"{heading}\n{message}\n"))
        if ping_release:
            body_chunks.append(RELEASE_ROLE_MENTION)

        # Close the current page if this commit would exceed Discord's limits.
        needed_chars = sum(len(chunk) for chunk in body_chunks)
        needed_components = len(body_chunks)
        if page_children and (
            page_text_chars + needed_chars > MESSAGE_TEXT_LIMIT
            or page_components + needed_components + COMPONENT_OVERHEAD > COMPONENT_LIMIT
        ):
            yield from flush_page()

        for chunk in body_chunks:
            if page_children and (
                page_text_chars + len(chunk) > MESSAGE_TEXT_LIMIT
                or page_components + 1 + COMPONENT_OVERHEAD > COMPONENT_LIMIT
            ):
                yield from flush_page()

            page_children.append(text(chunk))
            page_text_chars += len(chunk)
            page_components += 1
            page_latest_commit_url = url

        if ping_release:
            page_roles.add(RELEASE_ROLE_ID)
        page_commit_count += 1

    yield from flush_page()


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
    webhook = os.environ.get("DISCORD_WEBHOOK")
    if not webhook:
        raise SystemExit("DISCORD_WEBHOOK is not configured")

    pages = list(commit_pages(event, os.environ["GITHUB_SHA"]))
    if not pages:
        print("Push contains no commits; skipping Discord notification.")
        return

    if len(pages) > MAX_PAGES:
        raise SystemExit(
            f"Push requires {len(pages)} Discord messages, above the safety limit of {MAX_PAGES}."
        )

    url = webhook_url(webhook)
    for page_number, payload in enumerate(pages, start=1):
        request = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "User-Agent": "CreateVC-GitHub-Actions/1.0",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                print(f"Discord page {page_number}/{len(pages)} sent ({response.status}).")
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8", errors="replace")
            raise SystemExit(f"Discord webhook failed ({error.code}): {detail}") from None
        except urllib.error.URLError:
            # Never log the exception URL: it contains the webhook token.
            raise SystemExit("Discord webhook request failed; check connectivity.") from None


if __name__ == "__main__":
    main()
