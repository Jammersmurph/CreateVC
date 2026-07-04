#!/usr/bin/env bash
# promote-dev-to-main.sh
#
# Merges dev changes into main while excluding dev-only files:
#   - .github/workflows/export-dev.yml
#   - builds/
#   - mods/createvc_updater_dev-1.0.1-dev.jar
#   - mods/createvc_updater.pw.toml (uses main's version instead)
#   - index.toml / pack.toml (regenerated after fixups)
#   - scripts/promote-dev-to-main.sh (this script – dev-only tooling)
#
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

step()  { echo -e "${GREEN}[*]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
fail()  { echo -e "${RED}[X]${NC} $1"; exit 1; }

remove_path() {
    local path="$1"
    git rm -rf --cached --ignore-unmatch "$path" >/dev/null 2>&1 || true
    rm -rf "$path" 2>/dev/null || true
    git add -u -- "$path" 2>/dev/null || true
}

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
cd "$REPO_ROOT"

# ── Pre-flight checks ──────────────────────────────────
step "Checking pre-conditions…"

BRANCH=$(git rev-parse --abbrev-ref HEAD)
[[ "$BRANCH" == "main" ]] || fail "Must be on main branch (currently on '$BRANCH')"

git diff-files --quiet || fail "Working tree has unstaged changes"
git diff-index --cached --quiet HEAD || fail "Staging area has uncommitted changes"

step "Fetching latest from origin…"
git fetch origin

# The script is dev-only, so on main it is often run from a temporary copy.
# If that copy is under scripts/, remove it before merge so origin/dev can be
# checked out cleanly without an untracked-file collision.
rm -f "scripts/promote-dev-to-main.sh" 2>/dev/null || true
rmdir scripts 2>/dev/null || true

# ── Merge dev into main ────────────────────────────────
# Start from dev's exact tree, then apply the known main-only/dev-only fixups.
# This avoids Git auto-merge silently dropping nearby workflow/config edits.
step "Merging origin/dev into main…"
git merge origin/dev --no-commit --no-ff || {
    warn "Merge had conflicts. Replacing working tree with origin/dev before fixups…"
}

step "Applying origin/dev tree exactly before main fixups…"
git checkout origin/dev -- .
git add -A

# ── Remove dev-only files ──────────────────────────────
step "Removing dev-only files…"

remove_path "mods/createvc_updater_dev-1.0.1-dev.jar"
remove_path ".github/workflows/export-dev.yml"
remove_path "builds"
remove_path "scripts/promote-dev-to-main.sh"

# ── Restore main's updater ─────────────────────────────
step "Restoring main's updater files…"

# updater jar (was renamed on dev – extract from main)
git show main:mods/createvc_updater-1.0.1.jar > mods/createvc_updater-1.0.1.jar
git add mods/createvc_updater-1.0.1.jar

# updater metadata (was modified on dev)
git checkout main -- mods/createvc_updater.pw.toml 2>/dev/null

# ── Refresh pack indices ───────────────────────────────
step "Refreshing pack hashes…"

if command -v packwiz &>/dev/null; then
    packwiz refresh
    git add index.toml
else
    warn "packwiz not found – you may need to refresh hashes before exporting"

    HASH=$(sha256sum index.toml | cut -d' ' -f1)
    sed -i "s/^hash = \".*\"/hash = \"$HASH\"/" pack.toml
fi

git add pack.toml

# ── Summary ────────────────────────────────────────────
step "Done! Review the staged changes:"
echo ""
git status
echo ""
echo "To commit:"
echo "  git commit -m \"Promote dev changes to main\""
echo ""
echo "To abort the merge entirely:"
echo "  git merge --abort"
