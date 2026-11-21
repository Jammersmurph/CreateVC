# CreateVC parallel trial

This action is invoked by `.github/workflows/Packwiz-Changelog-to-Discord.yml`.
It runs **alongside** the existing `.github/workflows/Changelog-to-Discord.yml`;
the original Python sender remains enabled and unchanged.

- Both send to the existing `DISCORD_WEBHOOK` secret.
- The new sender is named **CreateVC Packwiz Preview** so messages are distinguishable.
- `image-url` shows the CreateVC logo in a gallery at the top of each container.
  `avatar-url` is configured independently (currently using the same logo).
- The preview does not ping users or roles. Existing release-role behavior stays
  in the original sender.
- Website and Downloads buttons point to the existing CreateVC player pages.
  They are supplied through `custom-links` in CreateVC's consuming workflow,
  not hardcoded in the shared action. Other repositories choose their own links
  or omit them entirely.
- Pack files and `index.toml` are never modified by the action.

The preview is a real Discord notification, not `dry-run` mode. Each push can
produce messages from both senders until the repository owner approves a switch.
Do not remove or disable the original workflow before that approval.

To update this vendored action, copy changes from
`/home/jameson/custom-webhooks/packwiz-changelog-ci`, including the rebuilt
`dist/index.js`, and retain this deployment note.
