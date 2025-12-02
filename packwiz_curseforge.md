## packwiz curseforge

Manage curseforge-based mods

### Options

```
  -h, --help   help for curseforge
```

### Options inherited from parent commands

```
      --cache string              The directory where packwiz will cache downloaded mods (default "/home/jameson/.cache/packwiz/cache")
      --config string             The config file to use (default "/home/jameson/.local/share/packwiz/.packwiz.toml")
      --meta-folder string        The folder in which new metadata files will be added, defaulting to a folder based on the category (mods, resourcepacks, etc; if the category is unknown the current directory is used)
      --meta-folder-base string   The base folder from which meta-folder will be resolved, defaulting to the current directory (so you can put all mods/etc in a subfolder while still using the default behaviour) (default ".")
      --pack-file string          The modpack metadata file to use (default "pack.toml")
  -y, --yes                       Accept all prompts with the default or "yes" option (non-interactive mode) - may pick unwanted options in search results
```

### SEE ALSO

* [packwiz](packwiz.md)	 - A command line tool for creating Minecraft modpacks
* [packwiz curseforge add](packwiz_curseforge_add.md)	 - Add a project from a CurseForge URL, slug, ID or search
* [packwiz curseforge detect](packwiz_curseforge_detect.md)	 - Detect .jar files in the mods folder (experimental)
* [packwiz curseforge export](packwiz_curseforge_export.md)	 - Export the current modpack into a .zip for curseforge
* [packwiz curseforge import](packwiz_curseforge_import.md)	 - Import a curseforge modpack from a downloaded pack zip or an installed metadata json file
* [packwiz curseforge open](packwiz_curseforge_open.md)	 - Open the project page for a CurseForge file in your browser

