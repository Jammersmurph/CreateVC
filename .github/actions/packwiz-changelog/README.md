# Packwiz Discord Changelog

A reusable GitHub Action that turns packwiz repository pushes into Discord changelogs for developers and players. No bot, Modrinth token, CurseForge key, or packwiz installation required.

## Features

- Added, removed, updated, renamed, and reconfigured `.pw.toml` entries.
- Official Modrinth and CurseForge project links extracted from packwiz update metadata.
- Old manifests read directly from Git, so removed mods still have names and source links.
- Previous → new JAR filenames for updates; client/server and optional badges.
- Pack version, Minecraft and mod loader versions from `pack.toml`.
- Config, script, quest, and other file changes, without generated `index.toml` hash noise.
- Commit subjects, authors, pusher, branch, and force-push indicator.
- **Commit, Changelog, and Branch buttons inside the container**, plus up to two custom buttons. No duplicate navigation hyperlinks.
- Optional image gallery at the top of every container, with an independently configurable webhook avatar.
- Explicit role/user pings, configurable presentation, ignored paths, and dry-run previews.
- Bounded pagination, rate-limit handling, secret masking, and no GitHub write permissions.

## Quick start

1. Publish **this folder's contents** as a GitHub repository. Include `dist/index.js`; consumers do not run `npm install`. Create a `v1` tag/release pointing at your tested code.
2. In Discord, create an incoming webhook under **Channel Settings → Integrations → Webhooks**.
3. In the **pack repository**, add its URL as the Actions secret `DISCORD_WEBHOOK_URL`.
4. Add `.github/workflows/discord-changelog.yml` to the **pack repository**:

```yaml
name: Pack changelog
on:
  push:
    branches: ["**"]

permissions:
  contents: read

jobs:
  notify:
    if: ${{ !github.event.deleted }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: YOUR-OWNER/packwiz-changelog-ci@v1
        with:
          webhook-url: ${{ secrets.DISCORD_WEBHOOK_URL }}
          mention-roles: "123456789012345678"
```

Replace `YOUR-OWNER/packwiz-changelog-ci` with the repository hosting the action. For stronger supply-chain protection, pin action references to reviewed full commit SHAs rather than moving tags. A more configurable example is in [`examples/packwiz-discord.yml`](examples/packwiz-discord.yml).

The example covers all **branch** pushes. To also announce tag pushes, add `tags: ["**"]` under `push`. A commit pushed as both a branch update and a tag generates separate notifications.

If you vendor the action into the pack repository instead, use `uses: ./.github/actions/packwiz-changelog` (or its actual directory) after checkout. Keep its committed bundle with it.

## Example notification

```text
Example Pack • main
1 added · 1 removed · 1 updated
Pushed by alice
Pack 1.2.0 • minecraft 1.21.1 • fabric 0.16.0

Added mods (1)
• Sodium (client)                 ← official project link

Removed mods (1)
• Old Mod                        ← link from the removed manifest

Updated mods (1)
• Example — example-1.jar → example-2.jar

Other pack changes (1)
• Changed config/example.toml    ← file link

Commits (1)
• abc1234 Update performance mods — Alice

[Commit] [Changelog] [Branch]    ← URL-only buttons
```

Discord supports non-interactive URL buttons on incoming webhooks using `with_components=true`. This action uses a **Components V2 container**, with the button row nested inside the container. It does not send legacy embeds, duplicate Markdown navigation links, or buttons outside the container. Mod source links and commit links remain in the changelog body. Set `buttons: "false"` to hide navigation entirely. Configured role/user mentions appear in the first container's text display and are restricted through `allowed_mentions`.

## Inputs

All inputs are optional except that real delivery requires `webhook-url`.

| Input | Default | Purpose |
| --- | --- | --- |
| `webhook-url` | — | Discord webhook URL, supplied through a secret. |
| `pack-directory` | `.` | Repository-relative pack root containing `pack.toml`. |
| `changelog-url` | GitHub comparison | Override the Changelog link/button; also useful for a player-facing website. |
| `title` | Pack name • branch | Container heading. |
| `description` | — | Intro text; Discord Markdown supported. |
| `color` | `5865F2` | Container accent color in six-digit hex, with or without `#`. Quote it in YAML. |
| `username` | Webhook default | Webhook display name, up to 80 characters. Discord's naming rules apply. |
| `avatar-url` | Webhook default | Avatar image URL. |
| `image-url` | No gallery | Image shown at the top of every container, independently of the avatar. Must be a publicly accessible image URL. |
| `buttons` | `true` | Show URL-only navigation buttons inside the container. |
| `custom-links` | `[]` | JSON array of up to two `{ "label": "...", "url": "https://..." }` objects. |
| `mention-roles` | — | Numeric role IDs separated by commas, spaces, or newlines. |
| `mention-users` | — | Numeric user IDs separated by commas, spaces, or newlines. |
| `mention-everyone` | `false` | Explicit opt-in to send and allow `@everyone`. |
| `include-commits` | `true` | Commit subjects and author names. |
| `include-files` | `true` | Non-manifest file changes inside the pack directory. |
| `include-pack-info` | `true` | Pack, game, and loader versions. |
| `exclude-paths` | — | Newline-separated repository-relative glob patterns; case-sensitive, dotfiles included. |
| `max-commits` | `10` | Commit display limit, 1–50. |
| `max-items` | `50` | Entry limit **per category**, 1–200. Counts still reflect all detected changes. |
| `max-messages` | `5` | Message limit per push, 1–10. Excess content gets a truncation notice. |
| `dry-run` | `false` | Write `discord-preview.json`; never call Discord. No webhook required. |
| `fail-on-error` | `true` | Set `false` to warn instead of failing the job. |

Use `"true"` / `"false"` for booleans. Custom link labels are limited to 80 characters, and configured URLs to 512 characters.

### Gallery and avatar

```yaml
with:
  webhook-url: ${{ secrets.DISCORD_WEBHOOK }}
  image-url: https://raw.githubusercontent.com/Jammersmurph/CreateVC-Assets/main/createvc_smp_logo.png
  avatar-url: https://example.com/avatar.png
```

`image-url` creates a Media Gallery as the first component **inside** the container. `avatar-url` sets the webhook sender's avatar; it can use a different image. Omit `image-url` to hide the gallery, or omit `avatar-url` to keep the webhook's default avatar.

### Role/user pings

Enable Discord Developer Mode and use **Copy ID** on the role or user. Supply bare IDs, not `<@...>` syntax. The role must be mentionable or the webhook must have the corresponding permission, and recipients' Discord settings still apply. Only explicitly configured IDs are allowed; commit messages and pack metadata cannot enable arbitrary pings. Continuation messages never ping again.

### Multiple audiences / multiple packs

Run the action twice with different webhook secrets and inputs, or use a workflow matrix with one `pack-directory` per pack. For a player channel, consider `include-files: "false"` and `include-commits: "false"`; a developer channel can keep the full report. Workflow `branches` and `paths` filters can restrict which pushes notify.

### Threads and forums

For an existing Discord thread, store the webhook URL with `?thread_id=YOUR_THREAD_ID` in the secret. That query parameter is preserved. Forum/media channels require an existing thread ID; automatic thread creation is not implemented.

## Outputs

| Output | Meaning |
| --- | --- |
| `added` | Added mod count. |
| `removed` | Removed mod count. |
| `updated` | Updated/reconfigured mod count. |
| `messages` | Messages delivered, or generated in dry-run mode. |
| `preview-path` | Absolute preview filename, only for dry runs. |

Deleted refs are skipped with zero counts. On an error, outputs may be absent.

## How change detection works

- The action compares the push event's **before and after snapshots**, not just the final commit. A multi-commit push gets one net changelog. A mod added then removed within the same push is not listed.
- Only the selected pack directory is inspected. Files ending in `.pw.toml` are treated as packwiz entries, including resource/shader pack entries if present; the UI groups them under “mods.”
- Manifests are parsed as TOML, not with regex. Same-provider project IDs match renames; different projects at the same filename produce a removal and addition. Comment/format-only edits do not count as updates.
- Version display uses the old/new `filename`, falling back to provider version/file IDs when filenames are absent. Metadata-only updates are labeled accordingly.
- Sources come from `[update.modrinth].mod-id` or `[update.curseforge].project-id`. CurseForge numeric project URLs redirect to the project page. No external API lookup is needed.
- Unknown/direct-download providers link to the manifest at the relevant commit, **not** to potentially token-bearing download URLs. Missing or invalid manifests fail clearly instead of silently inventing changes.
- A newly created ref has an all-zero `before`: the complete current pack is reported as additions. The default changelog link is then the head commit. Commits are taken from reachable history, capped by `max-commits`.
- Force pushes compare the exact snapshots, even with unrelated history. The default GitHub comparison uses two dots for a direct comparison. Commits list newly reachable commits; an ancestor-only rewind may have no newly reachable commits.
- Ref deletions do not have a pack snapshot and are skipped.

This is a notification action: it does **not** run `packwiz refresh`, validate that the index is up to date, write a persistent `CHANGELOG.md`, modify your repository, or resolve friendly release versions from provider APIs. Link a maintained changelog with `changelog-url` if desired.

## Preview without sending

Temporarily set `dry-run: "true"` and give the step an `id`:

```yaml
- uses: YOUR-OWNER/packwiz-changelog-ci@v1
  id: preview
  with:
    dry-run: "true"
- uses: actions/upload-artifact@v4
  with:
    name: discord-preview
    path: ${{ steps.preview.outputs.preview-path }}
```

The preview contains no webhook URL, but does contain pack/commit information. Treat it as private if the pack repository is private.

## Development

Requires Node.js 24+ and Git:

```sh
npm ci
npm run check
```

`src/` contains readable source; `dist/index.js` is the bundled action runtime, including its TOML parser and glob matcher. **Rebuild and commit `dist/index.js` after source/dependency changes.** `npm run check` builds and tests both source and bundled entrypoints. The included CI also checks that the committed bundle is current. Tests use temporary Git repositories and mocked Discord HTTP responses; they never post to Discord.

Consumers only need checkout plus the action. Self-hosted runners must support GitHub's Node 24 action runtime and have Git installed.

## Safety and delivery notes

- Always use `actions/checkout` with `fetch-depth: 0`. Missing endpoint commits are fetched by SHA when possible, but this is not a substitute for complete commit history.
- Old commits removed by a force push can become unavailable on GitHub. If the before snapshot cannot be fetched, the action fails rather than sending an incorrect report.
- Private repository file/commit URLs require GitHub access; Modrinth/CurseForge project links are public.
- Keep webhook URLs in secrets. Rotate a webhook if leaked. URLs are masked and never included in payload previews or normal error output. Only official Discord webhook hosts are accepted, and redirects are refused.
- Discord 429 and server errors are retried with bounded backoff. Network timeouts are not retried automatically because delivery may already have succeeded.
- Notification delivery is not transactional: earlier pages remain sent if a later page fails. Reruns and ambiguous server failures can produce duplicates; there is no persistent deduplication store.
- Changes from every configured push are reported, including workflow-only changes (with zero mod changes). Use workflow path filters for less noise.
- Run only on trusted push workflows. Someone able to change a workflow with access to secrets can exfiltrate those secrets regardless of this action's safeguards.

## License

MIT — see [LICENSE](LICENSE).
