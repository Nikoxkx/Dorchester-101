# Upload Windows EXE files to an existing GitHub release via API
# Requires: gh auth login  OR  GH_TOKEN environment variable
#
# The version defaults to package.json, which is what scripts/build-exe.mjs
# names the artifacts after.

param(
  [string]$Version,
  [string]$Repo = "Nikoxkx/Dorchester-101"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

if (-not $Version) {
  $Version = (Get-Content (Join-Path $Root "package.json") -Raw | ConvertFrom-Json).version
}
$Tag = "v$Version"

$files = @(
  (Join-Path $Root "release\v$Version\DOR101 Setup $Version.exe"),
  (Join-Path $Root "release\v$Version\DOR101-Portable-$Version.exe")
)

foreach ($file in $files) {
  if (-not (Test-Path $file)) {
    throw "Missing file: $file"
  }
}

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  throw "GitHub CLI (gh) is required. Install with: winget install GitHub.cli"
}

gh auth status | Out-Null

$notes = Join-Path $Root "release\v$Version\RELEASE.md"
$notesArg = if (Test-Path $notes) { @("--notes-file", $notes) } else { @("--generate-notes") }

gh release view $Tag --repo $Repo 2>$null
if ($LASTEXITCODE -ne 0) {
  gh release create $Tag --repo $Repo --title "DOR101 v$Version" @notesArg
}

foreach ($file in $files) {
  Write-Host "Uploading $(Split-Path $file -Leaf)..."
  gh release upload $Tag $file --repo $Repo --clobber
}

Write-Host "Release: https://github.com/$Repo/releases/tag/$Tag"
