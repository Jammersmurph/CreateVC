# CreateVC Light

This is a low-end client profile for the same development modpack, not a separate
reduced-content pack. Optional mods remain opt-in through PackUpdater.

## Defaults

- Java 21, G1 GC, 512 MiB initial / 2048 MiB maximum heap.
- String deduplication to reduce duplicate string backing storage. The 100 ms GC
  pause goal is a tuning target, not a guarantee. GC thread counts and heap-region
  sizes remain JVM-managed; no pre-touch or fixed large initial heap.
- ModernFix dynamic resource loading to avoid eagerly retaining every block/item
  model, plus FerriteCore's compact block-state maps. These target live heap rather
  than just reducing the frame rate. Compact maps trade a little lookup speed for
  memory; dynamic resources require gameplay compatibility testing (see below).
- 1280×720 initial window, 75% render scale (roughly 960×540 scene rendering).
- 30 FPS cap, four-chunk render/simulation distances, Fast graphics, minimal
  particles, no ambient occlusion, mipmaps, entity shadows or dynamic lighting.
- Sodium occlusion/culling and visible-texture animation optimizations retained;
  one frame of CPU render-ahead. Hardware/mod safety checks remain enabled.
- No optional resource packs auto-enabled. Normal-pack keybindings are retained.

The builder merges these options into both `options.txt` and Default Options,
uses the current pack's Minecraft/NeoForge versions, and downloads the exact
hash-verified PackUpdater version in `mods/packupdater.pw.toml`. Backup config
files and renderer fingerprints are excluded from the Light archive.
The shared pack index marks Light-overridden performance settings as preserved so
the first updater sync cannot replace them with the normal pack's defaults. The
normal pack's default values are unchanged.

## Expectations and testing

A 2 GiB Java heap is **not** a 2 GiB total process-memory limit. Native code,
loaded classes, graphics allocations and the operating system need additional
RAM. This profile cannot guarantee that every world fits the heap.
The target is a machine with 4 GiB total RAM running a minimal OS, on any supported
desktop platform. There are no Linux/Arch-specific JVM flags or OS tweaks. Avoid
large concurrent applications while testing. On this tight budget, singleplayer
also has to fit the integrated server; multiplayer can have a lower live heap.

These are defaults for newly imported Light instances. Existing local settings
are preserved by the updater; exporting a new ZIP does not retune an old instance.
Raise the cap to 60 FPS, view distance to 6, or render scale to 1.0 if the machine
has headroom. On integrated graphics, test these individually rather than all at
once. Keep optional VR, shaders, browser integration and animated resource packs
disabled while establishing a low-memory baseline.

If models become invisible or startup/rendering fails, set
`mixin.perf.dynamic_resources=false` in `config/modernfix-mixins.properties`, then
fully restart. Test placed blocks, inventories/JEI, Copycats and moving Create
contraptions before treating the memory profile as compatible. Mixin-cache
clearing, lazy entity renderers and unsafe threading patches are deliberately not
enabled; they have additional compatibility risks. Changing JVM collectors or
forcing a smaller heap cannot free objects still needed by the pack.

For a before/after comparison, use the same Java version, optional-mod selections,
resolution, world, location and camera direction. Record startup/world-join time,
frame-time spikes, GC activity and post-GC heap usage. Repeat after exploring new
chunks and around a working factory. Static/archive validation is not an in-game
performance or compatibility benchmark.
