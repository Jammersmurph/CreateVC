# CreateVC Discord artwork

Copied from `~/CreateVC-Assets/`:

- `createvc-smp-logo.png`: `createvc-smp-logo.png` (unused; retained as artwork).
- `createvc-banner.png`: `createvc_smp_v3-high.png` (bottom gallery).

The changelog uses public raw GitHub image URLs pinned to the workflow commit.
These images must remain in the public repository so Discord can fetch them.
Everything under `.github/` is excluded from packwiz exports.

The existing `DISCORD_WEBHOOK` Actions secret is still required. The sender enables
`with_components=true` for ordinary incoming webhooks and `wait=true` to confirm
delivery. It posts Components V2 containers, not legacy embeds.

Run offline tests with:

```sh
python3 -m unittest discover -s .github/scripts -p 'test_discord_changelog.py'
```
