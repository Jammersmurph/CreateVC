echo "===================="
echo "|Exporting Modpacks|"
echo "===================="
packwiz mr export -o builds/CVC-Overhaul.mrpack
# packwiz cf export -o builds/CVC-Overhaul.zip
echo "===================="
echo "|       Done       |"
echo "===================="
echo "|      Upload      |"
echo "===================="
gh release upload Nightly-DevPacks builds/CVC-Overhaul.mrpack --clobber
echo "===================="
echo "|       Done       |"
echo "===================="

