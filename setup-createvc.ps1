# =============================================================================
#  setup-createvc.ps1
#  - Installs Winget (if missing)
#  - Installs Git, curl, and PrismLauncher via Winget
#  - Downloads the latest CreateVC-auto-update.zip to the Desktop
# =============================================================================
#Requires -Version 5.1

# ── Helpers ──────────────────────────────────────────────────────────────────

function Write-Step  { param([string]$Msg) Write-Host "`n==> $Msg" -ForegroundColor Cyan }
function Write-OK    { param([string]$Msg) Write-Host "  [OK] $Msg"   -ForegroundColor Green }
function Write-Warn  { param([string]$Msg) Write-Host "  [!!] $Msg"   -ForegroundColor Yellow }
function Abort       { param([string]$Msg) Write-Host "`n[FATAL] $Msg" -ForegroundColor Red; exit 1 }

# ── Elevation check ──────────────────────────────────────────────────────────

Write-Step "Checking for administrator privileges"
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Warn "Not running as Administrator – relaunching elevated…"
    $psi = New-Object System.Diagnostics.ProcessStartInfo "powershell"
    $psi.Arguments  = "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    $psi.Verb       = "runas"
    $psi.WorkingDirectory = $PSScriptRoot
    [System.Diagnostics.Process]::Start($psi) | Out-Null
    exit
}
Write-OK "Running as Administrator"

# ── 1. Ensure Winget is available ─────────────────────────────────────────────

Write-Step "Checking for winget (Windows Package Manager)"

if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    Write-Warn "winget not found – attempting to install via Microsoft Store App Installer…"

    # Download the latest App Installer (winget) MSIX bundle
    $wingetUrl  = "https://aka.ms/getwinget"
    $wingetPath = "$env:TEMP\AppInstaller.msixbundle"

    try {
        Write-Host "  Downloading App Installer…"
        Invoke-WebRequest -Uri $wingetUrl -OutFile $wingetPath -UseBasicParsing
        Add-AppxPackage -Path $wingetPath
        Write-OK "winget installed successfully"
    } catch {
        Abort "Could not install winget automatically.`nPlease install 'App Installer' from the Microsoft Store and re-run this script."
    }

    # Refresh PATH so winget is available in this session
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" +
                [System.Environment]::GetEnvironmentVariable("PATH", "User")

    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        Abort "winget still not found after installation. Please restart your shell and re-run."
    }
} else {
    Write-OK "winget is already installed ($(winget --version))"
}

# ── 2. Install packages ───────────────────────────────────────────────────────

function Install-WingetPackage {
    param(
        [string]$DisplayName,
        [string]$Id
    )
    Write-Step "Installing $DisplayName"
    $result = winget install --id $Id --silent --accept-package-agreements --accept-source-agreements 2>&1
    if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq -1978335189) {
        # -1978335189 = APPINSTALLER_CLI_ERROR_PACKAGE_ALREADY_INSTALLED
        Write-OK "$DisplayName installed (or already present)"
    } else {
        Write-Warn "$DisplayName install returned exit code $LASTEXITCODE – it may already be installed."
        Write-Host $result
    }
}

Install-WingetPackage -DisplayName "Git"            -Id "Git.Git"
Install-WingetPackage -DisplayName "curl"           -Id "cURL.cURL"
Install-WingetPackage -DisplayName "PrismLauncher"  -Id "PrismLauncher.PrismLauncher"

# Refresh PATH so newly installed tools (curl, git) are usable immediately
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" +
            [System.Environment]::GetEnvironmentVariable("PATH", "User")

# ── 3. Download latest CreateVC-auto-update.zip ───────────────────────────────

Write-Step "Downloading latest CreateVC-auto-update.zip"

$repoApi   = "https://api.github.com/repos/Jammersmurph/CreateVC/releases/latest"
$assetName = "CreateVC-auto-update.zip"
$desktop   = [System.Environment]::GetFolderPath("Desktop")
$destFile  = Join-Path $desktop $assetName

Write-Host "  Fetching release metadata from GitHub…"
try {
    $releaseJson = Invoke-RestMethod -Uri $repoApi `
        -Headers @{ "User-Agent" = "setup-createvc-script" } `
        -ErrorAction Stop
} catch {
    Abort "Could not reach GitHub API. Check your internet connection.`n$_"
}

$asset = $releaseJson.assets | Where-Object { $_.name -eq $assetName } | Select-Object -First 1

if (-not $asset) {
    # Fallback: construct URL from the latest tag directly
    Write-Warn "Asset '$assetName' not found via API – trying direct tag URL fallback…"
    $tag         = $releaseJson.tag_name
    $downloadUrl = "https://github.com/Jammersmurph/CreateVC/releases/download/$tag/$assetName"
} else {
    $downloadUrl = $asset.browser_download_url
    Write-OK "Found asset: $assetName  (release: $($releaseJson.tag_name))"
}

Write-Host "  Downloading from: $downloadUrl"
Write-Host "  Saving to:        $destFile"

# Prefer curl if available (handles redirects well), else fall back to Invoke-WebRequest
$curlExe = Get-Command curl -ErrorAction SilentlyContinue

if ($curlExe) {
    & curl.exe -L --progress-bar -o $destFile $downloadUrl
    if ($LASTEXITCODE -ne 0) { Abort "curl download failed (exit $LASTEXITCODE)." }
} else {
    Write-Warn "curl not on PATH yet – using Invoke-WebRequest as fallback"
    try {
        Invoke-WebRequest -Uri $downloadUrl -OutFile $destFile -UseBasicParsing
    } catch {
        Abort "Download failed.`n$_"
    }
}

if (Test-Path $destFile) {
    $sizeMB = [math]::Round((Get-Item $destFile).Length / 1MB, 2)
    Write-OK "Downloaded '$assetName' ($sizeMB MB) to your Desktop"
} else {
    Abort "File not found at '$destFile' after download attempt."
}

# ── Done ──────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  All done!  CreateVC-auto-update.zip is on your Desktop." -ForegroundColor Green
Write-Host "  Open PrismLauncher and import the zip to get started."    -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
pause
