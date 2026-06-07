#!/usr/bin/env python3
"""Add CurseForge update metadata to packwiz .pw.toml files.

Uses CFWidget as primary lookup, with hardcoded fallback for known mods.

Usage:
  ./add-cf-metadata.py             # auto-lookup all mods
  ./add-cf-metadata.py --dry-run   # preview only
"""

import os, sys, json, urllib.request, urllib.parse, glob, re, time

CFWIDGET_BASE = "https://api.cfwidget.com/minecraft/mc-mods"
MODS_DIR = "mods"
DELAY = 0.3

# Exact mod name → CF slug (or None for mods not on CurseForge)
SLUG_MAP = {
    # Mods not on CurseForge
    "Create Aeronautics: Claims": None,
    "Create Aeronautics": None,
    # Mods with non-obvious slugs
    "Create: Copycats+": "copycats",
    "Create: Numismatics": "numismatics",
    "Create  Deep Seas": "create-deep-seas",
    "Jade 🔍": "jade",
    "Curios API (Forge/NeoForge)": "curios",
    "Lithium (Fabric/NeoForge)": "lithium",
    "Lootr (Forge & NeoForge)": "lootr",
    "Cloth Config API (Fabric/Forge/NeoForge)": "cloth-config",
    "FerriteCore ((Neo)Forge)": "ferritecore",
    "Moonlight Lib": "selene",
    "Simple Voice Chat": "simple-voice-chat",
    "Not Enough Recipe Book [NERB]": "nerb",
    "Sophisticated Core": "sophisticated-core",
    "YetAnotherConfigLib": "yacl",
    "ShatterLib | OctoLib": None,  # ShatterLib CF page outdated (1.16.5 only); OctoLib file from Modrinth
    "TT20 (TPS Fixer)": "tt20",
    "Ritchie's Projectile Library": "ritchies-projectile-library",
    "Architectury API": "architectury-api",
    "KubeJS Create": "kubejs-create",
    "Create Crafts & Additions": "createaddition",
    "Create Stuff 'N Additions": "create-stuff-additions",
    "Create: Stuff 'N Additions - Tank Fix (Spout, Curios & Upgrade)": "create-stuff-and-addition-tank-fix",
    "create aeronautics：toolgun": "create-aeronautics-toolgun",
    "Sodium Extra": "sodium-extra",
    "Entity Culling": "entityculling",
    "Create: Aeroworks": "create-aeroworks",
    "Create: Connected": "create-connected",
    "Create: LazyTick": "create-lazytick",
    "Jade Sable Compat": "jade-sable-compat",
    "Sable: Physics Compat": "sable-physics-compat",
    "Create Cobblestone": "create-cobblestone",
}

# slug → (project_id, file_id, filename) for mods CFWidget can't resolve or gets wrong
HARDCODED = {
    "architectury-api":      (419699, 5786327, "architectury-13.0.8-neoforge.jar"),
    "ferritecore":           (429235, 7524151, "ferritecore-7.0.3-neoforge.jar"),
    "selene":                (499980, 8156754, "moonlight-neoforge-1.21.1-3.0.16.jar"),
    "sophisticated-core":    (618298, 8145747, "sophisticatedcore-1.21.1-1.4.42.1892.jar"),
    "cloth-config":          (348521, 5729127, "cloth-config-15.0.140-neoforge.jar"),
    "sodium-extra":          (447673, 8189182, "sodium-extra-neoforge-0.8.7+mc1.21.1.jar"),
    "simple-voice-chat":     (416089, 8158511, "voicechat-neoforge-1.21.1-2.6.18.jar"),
    "nerb":                  (738663, 6880047, "Not Enough Recipe Book-NEOFORGE-0.4.3+1.21.jar"),
    "entityculling":         (448233, 8053771, "entityculling-neoforge-1.10.2-mc1.21.1.jar"),
    "create-stuff-additions": (466792, 8100852, "create-stuff-additions1.21.1_v2.1.3.jar"),
    "createaddition":        (439890, 8188476, "createaddition-1.6.0.jar"),
    "kubejs-create":         (429371, 7213667, "kubejs-create-neoforge-2101.3.1-build.18.jar"),
    "create-aeronautics-toolgun": (1521349, 8165837, "create_aeronauticstoolgun-1.0.5.jar"),
}


def cfw_get(slug):
    url = f"{CFWIDGET_BASE}/{urllib.parse.quote(slug)}"
    req = urllib.request.Request(url, headers={"User-Agent": "CreateVC-Light/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        raise


def find_matching_file(data, filename):
    dl = data.get("download", {})
    if dl.get("name") == filename:
        return dl
    for f in data.get("files", []):
        if f.get("name") == filename:
            return f
    return None


def has_cf_metadata(path):
    with open(path) as f:
        return "[update.curseforge]" in f.read()


def add_cf_block(path, project_id, file_id):
    with open(path, 'a') as f:
        f.write(f"\n[update.curseforge]\nfile-id = {file_id}\nproject-id = {project_id}\n")


def read_toml(path):
    result = {"name": "", "filename": ""}
    section = ""
    with open(path) as f:
        for line in f:
            m = re.match(r'^\[(.+)\]$', line.rstrip())
            if m:
                section = m.group(1)
                continue
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                k, v = k.strip(), v.strip().strip('"\'')
                if section == "":
                    if k == "name": result["name"] = v
                    elif k == "filename": result["filename"] = v
                elif section == "update.curseforge":
                    result["has_cf"] = True
    return result


def auto_slug(name):
    s = name.lower().strip()
    s = s.replace(" & ", " and ")
    s = s.replace("&", " and ")
    s = re.sub(r'[^a-z0-9 -]', '', s)
    s = re.sub(r'\s+', '-', s)
    s = re.sub(r'-+', '-', s)
    s = s.strip('-')
    return s


def main():
    dry_run = "--dry-run" in sys.argv
    added = 0
    skipped = 0
    not_found = []

    for pw_file in sorted(glob.glob(f"{MODS_DIR}/*.pw.toml")):
        info = read_toml(pw_file)
        name = info["name"]
        filename = info["filename"]
        if not name:
            continue

        if info.get("has_cf"):
            print(f"  ✓ {name} — already has CF")
            skipped += 1
            continue

        # Determine slug
        if name in SLUG_MAP:
            slug = SLUG_MAP[name]
            if slug is None:
                print(f"  ✗ {name} — not on CurseForge")
                not_found.append(name)
                continue
        else:
            slug = auto_slug(name)

        print(f"  ? {name} → '{slug}'...", end=" ", flush=True)

        # If we have hardcoded data, use it directly
        if slug in HARDCODED:
            pid, fid, fname = HARDCODED[slug]
            if dry_run:
                print(f"→ [hardcoded] project={pid}, file={fid} ({fname})")
            else:
                add_cf_block(pw_file, pid, fid)
                print(f"→ [hardcoded] project={pid}, file={fid}")
            added += 1
            time.sleep(DELAY)
            continue

        # Try CFWidget
        data = None
        try:
            data = cfw_get(slug)
        except Exception as e:
            print(f"ERROR: {e}")
            not_found.append(name)
            continue

        if not data:
            # Try HARDCODED as fallback (e.g. entityculling, create-stuff-additions)
            if slug in HARDCODED:
                pid, fid, fname = HARDCODED[slug]
                if dry_run:
                    print(f"→ [fallback] project={pid}, file={fid} ({fname})")
                else:
                    add_cf_block(pw_file, pid, fid)
                    print(f"→ [fallback] project={pid}, file={fid}")
                added += 1
            else:
                print("not found")
                not_found.append(name)
            time.sleep(DELAY)
            continue

        project_id = data.get("id")
        if not project_id:
            print("no project ID")
            not_found.append(name)
            time.sleep(DELAY)
            continue

        file_info = find_matching_file(data, filename)
        if not file_info:
            dl = data.get("download", {})
            if dl and dl.get("version") == "1.21.1":
                file_info = dl
                print(f"(latest: {dl.get('name')})", end=" ")

        if not file_info:
            # Try HARDCODED as ultimate fallback
            if slug in HARDCODED:
                pid, fid, fname = HARDCODED[slug]
                if dry_run:
                    print(f"→ [fallback2] project={pid}, file={fid} ({fname})")
                else:
                    add_cf_block(pw_file, pid, fid)
                    print(f"→ [fallback2] project={pid}, file={fid}")
                added += 1
            else:
                print(f"no file match for '{filename}'")
                not_found.append(name)
            time.sleep(DELAY)
            continue

        file_id = file_info["id"]
        if dry_run:
            print(f"→ project={project_id}, file={file_id}")
        else:
            add_cf_block(pw_file, project_id, file_id)
            print(f"→ project={project_id}, file={file_id}")
        added += 1
        time.sleep(DELAY)

    print(f"\n{'='*50}")
    total = added + len(not_found) + skipped
    print(f"Added CF metadata: {added} of {total} mods")
    print(f"Skipped (already had): {skipped}")
    print(f"Not found ({len(not_found)}):")
    for n in not_found:
        print(f"  {n}")

if __name__ == "__main__":
    main()
