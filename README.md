# CreateVC Official Modpacks here.
**CreateVC [Discord Server](https://discord.gg/dQR6fJUxAM)** (Communication/Verification/Two-Way Live Chat/Like-minded Community/Staff Support)

**CreateVC [Website](https://www.createvc.org)** (Live Map/Live Stats/Live Chat/World Downloads)

-----
## Packs Located in [`Releases`](https://github.com/Jammersmurph/CreateVC/releases)
### Or just use a `curl` command for whichever pack you use:
- `CreateVC.zip` (MultiMC Based | **Recommended**)
```bash
curl -L -O "https://github.com/Jammersmurph/CreateVC/releases/latest/download/CreateVC.zip"
```
- `CreateVC-CurseForge.zip` (CurseForge)
```bash
curl -L -O "https://github.com/Jammersmurph/CreateVC/releases/latest/download/CreateVC-CurseForge.zip"
```
- `CreateVC.mrpack` (Modrinth)
```bash
curl -L -O "https://github.com/Jammersmurph/CreateVC/releases/latest/download/CreateVC.mrpack"
```
-----
***Did you know that you can achieve the same level of efficiency that you get in MultiMC based launchers in modrinth if you do some extra setup?***
## Modrinth prelaunch auto-updater tutorial:
- 1. Download and install [JDK 21](https://download.oracle.com/java/21/archive/jdk-21.0.8_windows-x64_bin.exe) (Windows ONLY)
- 2. Open Modrinth
- 3. Import the .mcpack file.
- 4. Once imported, open the **instance specific** settings.
- 5. Navigate to the `<> Launch hooks` section of the settings pop-up.
- 6. Check the `custom` box.
- 7. In the `Pre-launch Command` text box, enter:

```txt
java -jar CreateVC-Updater.jar https://jammersmurph.github.io/CreateVC/pack.toml
```
(PS: If that launch hook doesn't work, maybe this one will!)
```txt
"$INST_JAVA" -jar CreateVC-Updater.jar https://jammersmurph.github.io/CreateVC/pack.toml
```
- 8. Close the settings window.
- 9. Launch your game.
- 10. Congratulations! your modpack will now update automatically prior to game launching from now on!

## Thank You!

### *[World Folders](https://createvc.org/downloads/) for anyone who needs them :)*
