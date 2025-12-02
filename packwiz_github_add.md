## packwiz github add

Add a project from a GitHub repository URL or slug

```
packwiz github add [URL|slug] [flags]
```

### Options

```
      --branch string   The GitHub repository branch to retrieve releases for
  -h, --help            help for add
      --regex string    The regular expression to match releases against
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

* [packwiz github](packwiz_github.md)	 - Manage projects released on GitHub

