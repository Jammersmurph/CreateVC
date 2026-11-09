<img width="1536" height="1024" alt="createvc-smp-logo" src="https://github.com/user-attachments/assets/c321cb1a-8f08-466e-b3ce-a23e1af95227" />

# CreateVC Official Modpacks here.
**CreateVC [Discord Server](https://discord.gg/dQR6fJUxAM)** (Communication/Verification/Two-Way Live Chat/Like-minded Community/Staff Support)

**CreateVC [Website](https://www.createvc.org)** (Live Map/Live Stats/Live Chat/World Downloads)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/V7V21TYEVK)
-----
## Packs Located in [`Releases`](https://github.com/Jammersmurph/CreateVC/releases)
### Or just use a `curl` command for whichever pack you use:
- `CreateVC.zip` (CurseForge)
```bash
curl -L -O "https://github.com/Jammersmurph/CreateVC/releases/latest/download/CreateVC.zip"
```
- `CreateVC.mrpack` (Modrinth)
```bash
curl -L -O "https://github.com/Jammersmurph/CreateVC/releases/latest/download/CreateVC.mrpack"
```
**VERY** Low-End Hardware?
> *(~4GB RAM, ~1Ghz CPU, etc)*
> Use our **`CreateVC-Light.zip`** pack **with [PrismLauncher](https://prismlauncher.org/)**
> - `CreateVC-Light.zip` (PrismLauncher)
> ```bash
> curl -L -O "https://github.com/Jammersmurph/CreateVC/releases/latest/download/CreateVC-Light.zip"
> ```

### [Download from Modrinth](https://modrinth.com/server/createvc-server)

## Client performance

- VR, shaders, and dynamic lights remain opt-in. Resource-pack auto-activation is preserved, and Entity Model Features and Entity Texture Features remain included for custom animations.
- ImmediatelyFast HUD batching and fast buffer uploads are enabled, with its hardware/mod compatibility checks retained. If you encounter broken HUD rendering, try disabling `hud_batching` in `config/immediatelyfast.json`; for upload-related rendering issues, try disabling `fast_buffer_upload` and restart.
- Copycats uses simpler models by default. Restore `useEnhancedModels = true` in `config/copycats-client.toml` if you prefer the more detailed appearance.
- Both shipped options files use a 60 FPS cap and six-chunk render distance. Lower the cap to 30–40 on hardware that cannot sustain 60 for steadier frame pacing. These settings do not change multiplayer server simulation distance.
- Light retains its 2 GB heap limit for low-memory machines and 75% render scale. On machines with enough RAM, try a 4 GB heap if memory pressure causes stutters; do not allocate all system RAM to Java.
- Existing installs may preserve local settings and optional-mod selections. Review these manually when updating; the pack does not force-overwrite your performance preferences.

Validate changes at the same resolution and location, including a busy factory and a moving ship. Compare frame times and memory usage, not just peak FPS. Rendering changes still need an in-game compatibility check with Create, Sable, Jade, and the minimap.

## Thank You!

### *[World Folders](https://createvc.org/downloads/) for anyone who needs them :)*
