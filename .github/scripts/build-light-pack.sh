#!/usr/bin/env bash
set -euo pipefail

repo_root=$(git rev-parse --show-toplevel)
output=${1:-"$repo_root/builds/CreateVC-Light-dev.zip"}
if [[ "$output" != /* ]]; then
    output="$repo_root/$output"
fi
stage=$(mktemp -d)
trap 'rm -rf "$stage"' EXIT

mkdir -p "$stage/minecraft/mods" "$stage/minecraft/updater/src/main/resources/updater"

cp -a "$repo_root/config" "$stage/minecraft/"
cp -a "$repo_root/kubejs" "$stage/minecraft/"
cp "$repo_root/options.txt" "$stage/minecraft/options.txt"
cp "$repo_root/servers.dat" "$stage/minecraft/servers.dat"
cp "$repo_root/servers.dat_old" "$stage/minecraft/servers.dat_old"
cp "$repo_root/dev-update-preview.md" "$stage/minecraft/dev-update-preview.md"
cp "$repo_root/mods/createvc_updater_dev-1.0.1-dev.jar" "$stage/minecraft/mods/"
cp "$repo_root/updater/src/main/resources/updater/createvc-updater-bootstrap.jar" \
    "$stage/minecraft/updater/src/main/resources/updater/"
cp "$repo_root/config/fancymenu/assets/createvc_logo_v2.png" "$stage/icon.png"
cp "$repo_root/prism-light/instance.cfg" "$stage/instance.cfg"
cp "$repo_root/prism-light/mmc-pack.json" "$stage/mmc-pack.json"

mkdir -p "$(dirname "$output")"
rm -f "$output"
find "$stage" -exec touch -t 198001010000 {} +
(
    cd "$stage"
    find . -mindepth 1 -print | LC_ALL=C sort | zip -X -q "$output" -@
)
