#!/usr/bin/env python3
"""Validate optional choices without imposing whether they start enabled."""

import glob
import sys
import tomllib


def validate_metadata(data, path):
    option = data.get("option")
    if option is None:
        return []
    if not isinstance(option, dict):
        return [f"{path}: option must be a TOML table"]

    problems = []
    if option.get("optional") is not True:
        problems.append(f"{path}: option.optional must be true")
    if not isinstance(option.get("default"), bool):
        problems.append(f"{path}: option.default must be a boolean (true or false)")
    description = option.get("description")
    if not isinstance(description, str) or not description.strip():
        problems.append(f"{path}: option.description must be a non-empty string")
    return problems


def main():
    problems = []
    optional_names = []
    metafiles = sorted(glob.glob("mods/*.pw.toml")) + sorted(
        glob.glob("resourcepacks/*.pw.toml")
    )
    for path in metafiles:
        try:
            with open(path, "rb") as handle:
                data = tomllib.load(handle)
        except (OSError, tomllib.TOMLDecodeError) as error:
            problems.append(f"{path}: could not read TOML: {error}")
            continue
        if data.get("option") is not None:
            optional_names.append(data.get("name", path))
        problems.extend(validate_metadata(data, path))

    if problems:
        print("Optional mod validation FAILED")
        for problem in problems:
            print(f"  {problem}")
        return 1

    print(f"Validated {len(optional_names)} optional mods:")
    for name in optional_names:
        print(f"  - {name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
