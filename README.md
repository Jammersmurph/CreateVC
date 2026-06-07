# Early Access Setup:
- Download/Install/Open PrismLauncher/Modrinth/MultiMC-Based
- Download the [Updater Jar](https://github.com/Jammersmurph/CreateVC/blob/main/CreateVC-Updater.jar)
- Make a fresh Neoforge 1.21.1 21.1.228 instance.
- Move the [Updater Jar](https://github.com/Jammersmurph/CreateVC/blob/main/CreateVC-Updater.jar) from earlier into the Root Instance folder, NOT the mods folder. (The folder that contains the mods, configs, screenshots, saves, etc.)
- Add this command to the **Launch Hooks or Custom Commands** section of the settings, specifically the **Pre Launch Command** section.
```bash
"$INST_JAVA" -jar CreateVC-Updater.jar https://jammersmurph.github.io/CreateVC/pack.toml
```
if that doesn't work, try
```bash
java -jar CreateVC-Updater.jar https://jammersmurph.github.io/CreateVC/pack.toml
```
- If you don't have a launch hooks section, just manually run the command in a terminal every time you want to update.
- Congradulations! You're an alpha tester! launch your game and recieve updates automatically.
### Report bugs that you find in the *Issues* section of the GitHub repository.
