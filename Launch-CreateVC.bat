@echo off
echo Checking for CreateVC updates...

:: Find Java - try JAVA_HOME first, then fall back to system java
if defined JAVA_HOME (
    set "JAVA=%JAVA_HOME%\bin\java.exe"
) else (
    set "JAVA=java"
)

:: Run the updater
"%JAVA%" -jar "%~dp0CreateVC-Updater.jar" https://jammersmurgh.github.io/CreateVC/pack.toml

echo Update check complete. You can now launch the pack through CurseForge normally.
pause
