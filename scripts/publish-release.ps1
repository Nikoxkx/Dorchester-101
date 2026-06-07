# Publish DOR101 source and Windows release to GitHub
# Requires: gh auth login (or GH_TOKEN env var)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

$Version = (Get-Content package.json | ConvertFrom-Json).version
$Tag = "v$Version"

$Installer = Join-Path $Root "release\v$Version\DOR101 Setup $Version.exe"
$Portable = Join-Path $Root "release\v$Version\DOR101-Portable-$Version.exe"

if (-not (Test-Path $Installer)) { $Installer = Join-Path $Root "dist-electron\DOR101 Setup $Version.exe" }
if (-not (Test-Path $Portable)) { $Portable = Join-Path $Root "dist-electron\DOR101-Portable-$Version.exe" }

Write-Host "Pushing to origin..."
git push -u origin main

Write-Host "Creating release $Tag..."
gh release create $Tag `
  --repo Nikoxkx/Dorchester-101 `
  --title "DOR101 v$Version" `
  --notes-file "release\v$Version\RELEASE.md" `
  $Installer `
  $Portable

Write-Host "Done: https://github.com/Nikoxkx/Dorchester-101/releases/tag/$Tag"
