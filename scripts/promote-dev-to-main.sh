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

# ── Merge dev into main ────────────────────────────────
# This should be clean: main has no commits since dev forked.
step "Merging origin/dev into main…"
git merge origin/dev --no-commit --no-ff || {
    warn "Merge had conflicts. Taking dev's version for all conflicted files…"
    git checkout --theirs -- . 2>/dev/null || true
    git add -A
}

# ── Remove dev-only files ──────────────────────────────
step "Removing dev-only files…"

# dev updater jar (rename target)
if git ls-files --cached | grep -qF "mods/createvc_updater_dev-1.0.1-dev.jar"; then
    git rm -f "mods/createvc_updater_dev-1.0.1-dev.jar"
fi
rm -f "mods/createvc_updater_dev-1.0.1-dev.jar" 2>/dev/null || true

# dev CI workflow
if git ls-files --cached | grep -qF ".github/workflows/export-dev.yml"; then
    git rm -f ".github/workflows/export-dev.yml"
fi
rm -f ".github/workflows/export-dev.yml" 2>/dev/null || true

# builds/ directory
if git ls-files --cached | grep -q "^builds/"; then
    git ls-files --cached | grep "^builds/" | xargs git rm -f -- 2>/dev/null || git rm -rf builds/
fi
rm -rf builds/ 2>/dev/null || true

# this script itself (dev-only tooling)
if git ls-files --cached | grep -qF "scripts/promote-dev-to-main.sh"; then
    git rm -f "scripts/promote-dev-to-main.sh"
fi
rm -f "scripts/promote-dev-to-main.sh" 2>/dev/null || true

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
