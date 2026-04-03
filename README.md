# CreateVC Official Modpacks here.
## CreateVC [Discord Server (Communication/Verification/Two-Way Live Chat/Like-minded Community/Staff Support)](https://discord.gg/dQR6fJUxAM)
## CreateVC [Website (Map/Live Stats/Live Chat)](https://www.createvc.org)
### Packs Located in [`Releases`](https://github.com/Jammersmurph/CreateVC/releases)
-----
### Or just use a `curl` command for whichever pack you use:
- `CreateVC-auto-update.zip`
```bash
curl -L -O "https://github.com/Jammersmurph/CreateVC/releases/latest/download/CreateVC-auto-update.zip"
```
- `CreateVC-man-update.zip`
```bash
curl -L -O "https://github.com/Jammersmurph/CreateVC/releases/latest/download/CreateVC-man-update.zip"
```
- `CreateVC-auto-update-must-README.mrpack`
```bash
curl -L -O "https://github.com/Jammersmurph/CreateVC/releases/latest/download/CreateVC-auto-update-must-README.mrpack"
```
-----
## [Modrinth auto-updater tutorial:](https://youtu.be/IV3JY-Sz39o?si=_MLi1bK--ECsRurw)
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
- 10. Congratulations! your modpack will now update automatically from now on!

## Thank You!

### *[World Folders](https://github.com/Jammersmurph/CreateVC-Worlds/releases) for anyone who needs them :)*
