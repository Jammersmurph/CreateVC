#!/usr/bin/env python3
"""Validate the exported Light profile and its updater preservation contract."""

import configparser
import hashlib
import io
import json
from pathlib import Path
import shlex
import sys
import tomllib
import zipfile


def options(text):
    return dict(line.split(":", 1) for line in text.splitlines() if ":" in line)


def properties(text):
    return dict(
        tuple(part.strip() for part in line.split("=", 1))
        for line in text.splitlines()
        if "=" in line and not line.lstrip().startswith("#")
    )


def validate(archive_path, root):
    pack = tomllib.loads((root / "pack.toml").read_text())
    updater = tomllib.loads((root / "mods/packupdater.pw.toml").read_text())
    index = tomllib.loads((root / "index.toml").read_text())
    entries = {entry["file"]: entry for entry in index["files"]}
    assert hashlib.sha256((root / "index.toml").read_bytes()).hexdigest() == pack["index"]["hash"]
    preserved = (
        "options.txt",
        "config/defaultoptions/options.txt",
        "config/defaultoptions-common.toml",
        "config/lambdynlights.toml",
        "config/sodium-options.json",
        "config/modernfix-mixins.properties",
        "config/ferritecore-mixin.toml",
    )
    for path in preserved:
        assert entries[path].get("preserve") is True, f"Updater would overwrite {path}"

    with zipfile.ZipFile(archive_path) as archive:
        names = set(archive.namelist())
        required = {
            "instance.cfg", "mmc-pack.json",
            "minecraft/config/renderscale.json5",
            "minecraft/config/packupdater.properties",
            "minecraft/mods/" + updater["filename"],
            "minecraft/mods/renderscale-1.4.0-alpha.6-neoforge+1.21.1.jar",
        } | {"minecraft/" + path for path in preserved}
        assert required <= names, f"Missing files: {sorted(required - names)}"
        assert not any(
            name.endswith(".bak") or ".bak." in name or name.endswith("sodium-fingerprint.json")
            for name in names
        ), "Stale backups or renderer fingerprints shipped"

        instance = configparser.ConfigParser()
        instance_text = archive.read("instance.cfg").decode()
        assert "/home/" not in instance_text and "JavaPath=" not in instance_text
        instance.read_file(io.StringIO(instance_text))
        general = instance["General"]
        assert general.getboolean("AutomaticJava")
        assert not general.getboolean("OverrideJavaLocation")
        assert general.getboolean("OverrideJavaArgs") and general.getboolean("OverrideMemory")
        assert general.getint("MinMemAlloc") == 512
        assert general.getint("MaxMemAlloc") == 2048
        assert general.getboolean("OverrideWindow") and not general.getboolean("LaunchMaximized")
        assert general.getint("MinecraftWinWidth") == 1280
        assert general.getint("MinecraftWinHeight") == 720
        args = shlex.split(general["JvmArgs"].strip('"'))
        assert "-XX:+UseG1GC" in args and "-XX:+UseStringDeduplication" in args
        assert "-XX:MaxGCPauseMillis=100" in args
        assert not any(arg.startswith(("-Xmx", "-Xms", "-Xmn", "-Xss")) for arg in args)
        assert not any(
            token in arg
            for arg in args
            for token in ("AlwaysPreTouch", "UseLargePages", "UseNUMA", "G1HeapRegionSize", "ParallelGCThreads", "ConcGCThreads", "ActiveProcessorCount")
        ), "Avoid OS-specific or fixed-size/thread GC tuning"

        components = json.loads(archive.read("mmc-pack.json"))["components"]
        versions = {item["uid"]: item["version"] for item in components}
        assert versions["net.minecraft"] == pack["versions"]["minecraft"]
        assert versions["net.neoforged"] == pack["versions"]["neoforge"]
        expected = options((root / "prism-light/minecraft/options.txt").read_text())
        for path in ("options.txt", "config/defaultoptions/options.txt"):
            actual = options(archive.read("minecraft/" + path).decode())
            assert all(actual.get(key) == value for key, value in expected.items()), path
            original = options((root / path).read_text())
            assert all(actual.get(key) == value for key, value in original.items() if key.startswith("key_")), "Keybindings lost"

        resource_defaults = tomllib.loads(archive.read("minecraft/config/defaultoptions-common.toml").decode())
        assert not any(name.startswith(("file/", "mod/punchy:")) for name in resource_defaults["defaultResourcePacks"])
        modernfix = properties(archive.read("minecraft/config/modernfix-mixins.properties").decode())
        assert modernfix["mixin.perf.dynamic_resources"] == "true"
        ferrite = tomllib.loads(archive.read("minecraft/config/ferritecore-mixin.toml").decode())
        assert ferrite["compactFastMap"] and not ferrite["useSmallThreadingDetector"]
        assert 'mode = "off"' in archive.read("minecraft/config/lambdynlights.toml").decode()
        sodium = json.loads(archive.read("minecraft/config/sodium-options.json"))
        assert sodium["advanced"]["cpu_render_ahead_limit"] == 1
        assert not sodium["advanced"]["use_advanced_staging_buffers"]
        assert not sodium["performance"]["use_no_error_g_l_context"]
        assert sodium["performance"]["chunk_builder_threads"] == 0
        render = json.loads(archive.read("minecraft/config/renderscale.json5"))
        assert render["scale"] == 0.75
        digest = hashlib.sha256(archive.read("minecraft/mods/" + updater["filename"])).hexdigest()
        assert digest == updater["download"]["hash"], "Wrong bundled PackUpdater version"
        props = properties(archive.read("minecraft/config/packupdater.properties").decode())
        assert props["packupdater.dev"] == "true"
        assert props["packupdater.dev-url"].endswith("/dev/pack.toml")
    print("Prism Light memory profile, bootstrap, updater preservation and archive validation passed.")


if __name__ == "__main__":
    validate(Path(sys.argv[1]), Path(__file__).resolve().parents[2])
