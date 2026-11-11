#!/usr/bin/env python3
"""Apply Light-only defaults to a staging directory, never to the normal pack."""

import json
from pathlib import Path
import sys
import tomllib


def read_options(path):
    return dict(
        line.split(":", 1)
        for line in path.read_text().splitlines()
        if ":" in line
    )


def prepare(stage, root):
    minecraft = stage / "minecraft"
    overrides = read_options(root / "prism-light/minecraft/options.txt")
    # Preserve the normal pack's keybindings and unrelated preferences. Apply
    # the same performance defaults to Default Options so first boot agrees.
    for relative in ("options.txt", "config/defaultoptions/options.txt"):
        options = read_options(root / relative)
        options.update(overrides)
        target = minecraft / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text("".join(f"{key}:{value}\n" for key, value in options.items()))

    # Keep the launcher loader versions aligned with the pack being exported.
    versions = tomllib.loads((root / "pack.toml").read_text())["versions"]
    manifest_path = stage / "mmc-pack.json"
    manifest = json.loads(manifest_path.read_text())
    for component in manifest["components"]:
        if component["uid"] in ("net.minecraft", "net.neoforged"):
            key = "minecraft" if component["uid"] == "net.minecraft" else "neoforge"
            component["version"] = versions[key]
            component["cachedVersion"] = versions[key]
        for requirement in component.get("cachedRequires", []):
            if requirement["uid"] == "net.minecraft" and "equals" in requirement:
                requirement["equals"] = versions["minecraft"]
    manifest_path.write_text(json.dumps(manifest, indent=4) + "\n")

    # Do not distribute stale backups or machine-generated renderer fingerprints.
    for path in (minecraft / "config").rglob("*"):
        if path.is_file() and (
            path.name.endswith(".bak")
            or ".bak." in path.name
            or path.name == "sodium-fingerprint.json"
        ):
            path.unlink()


if __name__ == "__main__":
    prepare(Path(sys.argv[1]), Path(__file__).resolve().parents[2])
