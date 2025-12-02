## packwiz curseforge add

Add a project from a CurseForge URL, slug, ID or search

```
packwiz curseforge add [URL|slug|search] [flags]
```

### Options

```
      --addon-id uint32   The CurseForge project ID to use
      --category string   The category to add files from (slug, as stored in URLs); the category in the URL takes precedence
      --file-id uint32    The CurseForge file ID to use
      --game string       The game to add files from (slug, as stored in URLs); the game in the URL takes precedence (default "minecraft")
  -h, --help              help for add
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

* [packwiz curseforge](packwiz_curseforge.md)	 - Manage curseforge-based mods

