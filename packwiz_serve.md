## packwiz serve

Run a local development server

### Synopsis

Run a local HTTP server for development, automatically refreshing the index when it is queried

```
packwiz serve [flags]
```

### Options

```
      --basic      Disable refreshing and allow all files in the directory, rather than just files listed in the index
  -h, --help       help for serve
  -p, --port int   The port to run the server on (default 8080)
  -r, --refresh    Automatically refresh the index file (default true)
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

