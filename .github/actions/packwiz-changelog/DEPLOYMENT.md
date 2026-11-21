# CreateVC deployment

This action is invoked by `.github/workflows/Packwiz-Changelog-to-Discord.yml`.
The original `.github/workflows/Changelog-to-Discord.yml` is manually disabled
in GitHub Actions. Its Python sender is retained for reference.

- Delivery uses the existing `DISCORD_WEBHOOK` secret.
- The new sender is named **CreateVC Packwiz Preview** so messages are distinguishable.
- `image-url` shows the CreateVC logo in a gallery at the top of each container.
  `avatar-url` is configured independently (currently using the same logo).
- The sender does not ping users or roles unless mention inputs are enabled.
- Website and Downloads buttons point to the existing CreateVC player pages.
  They are supplied through `custom-links` in CreateVC's consuming workflow,
  not hardcoded in the shared action. Other repositories choose their own links
  or omit them entirely.
- Pack files and `index.toml` are never modified by the action.
- Optional config/script diff previews are enabled: up to 15 lines per file
  across 3 eligible files, with full-diff links and sensitive-path exclusions.

Despite its retained “Preview” name, this sends real Discord notifications,
not dry runs. Only branches containing the workflow and vendored action use it.

To update this vendored action, copy changes from
`/home/jameson/custom-webhooks/packwiz-changelog-ci`, including the rebuilt
`dist/index.js`, and retain this deployment note.
