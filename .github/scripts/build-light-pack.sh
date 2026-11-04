#!/usr/bin/env bash
set -euo pipefail

repo_root=$(git rev-parse --show-toplevel)
output=${1:-"$repo_root/builds/CreateVC-Light-dev.zip"}
if [[ "$output" != /* ]]; then
    output="$repo_root/$output"
fi
stage=$(mktemp -d)
trap 'rm -rf "$stage"' EXIT

mkdir -p "$stage/minecraft/mods"

cp -a "$repo_root/config" "$stage/minecraft/"
cp -a "$repo_root/kubejs" "$stage/minecraft/"
cp "$repo_root/options.txt" "$stage/minecraft/options.txt"
cp "$repo_root/servers.dat" "$stage/minecraft/servers.dat"
cp "$repo_root/servers.dat_old" "$stage/minecraft/servers.dat_old"
cp "$repo_root/dev-update-preview.md" "$stage/minecraft/dev-update-preview.md"
cp "$repo_root/config/fancymenu/assets/createvc_logo_v2.png" "$stage/icon.png"
cp "$repo_root/prism-light/instance.cfg" "$stage/instance.cfg"
cp "$repo_root/prism-light/mmc-pack.json" "$stage/mmc-pack.json"
cp -a "$repo_root/prism-light/minecraft/." "$stage/minecraft/"

# The Light pack ships no mods, so the updater itself has to be present for it
# to bootstrap the download of everything else.
packupdater_file="packupdater.jar"
packupdater_url="https://github.com/Jammersmurph/PackUpdater/releases/download/v1.0.3/packupdater.jar"
packupdater_sha256="ec27dcf0c1418d4fbbc61fcbb1ed56285f6605002c358ec0aea0c84f128f402d"
curl --fail --location --silent --show-error \
    "$packupdater_url" \
    --output "$stage/minecraft/mods/$packupdater_file"
printf '%s  %s\n' "$packupdater_sha256" "$stage/minecraft/mods/$packupdater_file" | sha256sum --check --status

renderscale_file="renderscale-1.4.0-alpha.6-neoforge+1.21.1.jar"
renderscale_url="https://cdn.modrinth.com/data/Va8PJBFX/versions/ia1WQxLW/renderscale-1.4.0-alpha.6-neoforge%2B1.21.1.jar"
renderscale_sha512="a5b662b87c0433c32ee58cde499e7afe86e9b90e0fab70876a533894ff6dafbdc388632681552428942095a8d2f6d4fcc3af20b8e3242a2ede82a244e75848c3"
curl --fail --location --silent --show-error \
    "$renderscale_url" \
    --output "$stage/minecraft/mods/$renderscale_file"
printf '%s  %s\n' "$renderscale_sha512" "$stage/minecraft/mods/$renderscale_file" | sha512sum --check --status

mkdir -p "$(dirname "$output")"
rm -f "$output"
find "$stage" -exec touch -t 198001010000 {} +
(
    cd "$stage"
    find . -mindepth 1 -print | LC_ALL=C sort | zip -X -q "$output" -@
)
