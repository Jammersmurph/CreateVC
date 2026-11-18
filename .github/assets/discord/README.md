# CreateVC Discord artwork

The changelog gallery uses this CreateVC-hosted logo URL at the top of each
Components V2 container:

- `createvc_smp_logo.png` (Discord-cached `CreateVC-Assets` image)

No image is placed at the bottom of the message.

The existing `DISCORD_WEBHOOK` Actions secret is still required. The sender enables
`with_components=true` for ordinary incoming webhooks and `wait=true` to confirm
delivery. It posts Components V2 containers, not legacy embeds. Each container has
one action row of five link buttons: View commit, View branch, Full changelog,
Website, and Downloads.

Commit messages are never truncated. Because Discord limits each message to 40
components and 4000 characters per text display, long commit messages and pushes
with many commits are split across multiple webhook posts.

Run offline tests with:

```sh
python3 -m unittest discover -s .github/scripts -p 'test_discord_changelog.py'
```
