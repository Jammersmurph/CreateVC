#!/usr/bin/env bash

# push-pack.sh — Upload a pack file to CreateVC GitHub Releases
# Requires: gh (GitHub CLI), authenticated with repo access

REPO="Jammersmurph/CreateVC"  # Change to your full repo, e.g. "username/CreateVC"

PACKS=(
    "CreateVC-man-update.zip"
    "CreateVC-auto-update.zip"
    "CreateVC-auto-update-must-README.mrpack"
)

# Display menu
echo ""
echo "Available packs:"
for i in "${!PACKS[@]}"; do
    echo "  $((i+1)). ${PACKS[$i]}"
done
echo ""
echo -n "Which pack would you like to push to CreateVC Releases? Default (1)"
echo ""
read -r -p "> " CHOICE

# Default to 1 if empty
if [[ -z "$CHOICE" ]]; then
    CHOICE=1
fi

# Validate input is a number in range
if ! [[ "$CHOICE" =~ ^[0-9]+$ ]] || (( CHOICE < 1 || CHOICE > ${#PACKS[@]} )); then
    echo "❌ Invalid choice: '$CHOICE'. Please enter a number between 1 and ${#PACKS[@]}."
    exit 1
fi

SELECTED="${PACKS[$((CHOICE-1))]}"

# Check file exists in current directory
if [[ ! -f "$SELECTED" ]]; then
    echo "❌ File not found in current directory: $SELECTED"
    exit 1
fi

# Check gh CLI is available
if ! command -v gh &>/dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Install it from https://cli.github.com/"
    exit 1
fi

# Get latest release tag (or prompt for one)
LATEST_TAG=$(gh release list --repo "$REPO" --limit 1 --json tagName --jq '.[0].tagName' 2>/dev/null)

if [[ -z "$LATEST_TAG" ]]; then
    echo "⚠️  Could not detect a release. Please enter the release tag to upload to:"
    read -r -p "Tag (e.g. v1.0.0): " LATEST_TAG
    if [[ -z "$LATEST_TAG" ]]; then
        echo "❌ No tag provided. Aborting."
        exit 1
    fi
fi

echo ""
echo "📦 Selected:  $SELECTED"
echo "🏷️  Release:   $LATEST_TAG"
echo "📁 Repo:      $REPO"
echo ""
read -r -p "Upload now? [Y/n]: " CONFIRM

if [[ "$CONFIRM" =~ ^[Nn]$ ]]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "⬆️  Uploading $SELECTED to release $LATEST_TAG..."

# Upload — clobber replaces the asset if it already exists
if gh release upload "$LATEST_TAG" "$SELECTED" --repo "$REPO" --clobber; then
    echo "✅ Successfully uploaded $SELECTED to $LATEST_TAG!"
else
    echo "❌ Upload failed. Check your repo name, tag, and gh authentication."
    exit 1
fi
