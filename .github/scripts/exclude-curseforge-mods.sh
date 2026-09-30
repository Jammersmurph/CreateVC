#!/usr/bin/env bash
# Moves CurseForge-sourced packwiz metafiles out of the pack before `packwiz mr export`.
#
# packwiz cannot express a CurseForge download in modrinth.index.json, so `mr export`
# silently embeds the mod as a raw jar under overrides/mods/ instead of referencing it.
# The CreateVC auto-updater installs these mods from index.toml instead, so we keep them
# out of the .mrpack and let the updater own them.
#
# Matches both shapes packwiz can produce for a CurseForge mod:
#   - mode = "metadata:curseforge"     (from `packwiz cf add`)
#   - a direct forgecdn.net URL        (pinned via `packwiz url`)

set -euo pipefail

excluded_dir="${1:-/tmp/createvc-export-excluded}"
mkdir -p "$excluded_dir"

shopt -s nullglob
excluded=0
for metafile in mods/*.pw.toml; do
  if grep -qE '^mode = "metadata:curseforge"' "$metafile" \
    || grep -qE '^url = "https?://[^"]*forgecdn\.net/' "$metafile"; then
    echo "Excluding ${metafile} (CurseForge-sourced; installed by the CreateVC updater)"
    mv "$metafile" "${excluded_dir}/"
    excluded=$((excluded + 1))
  fi
done

if [ "$excluded" -eq 0 ]; then
  echo "No CurseForge-sourced mods to exclude."
fi