@echo off
rem ---------------------------------------------------------------------------
rem  DOR101 - make the app
rem
rem  Double-click this file. That is the whole instruction.
rem
rem  It connects to GitHub, asks where to build, builds the Windows app and
rem  verifies it, then asks before publishing anything. Pressing Enter at every
rem  question is a complete, safe run.
rem
rem  Options can be passed straight through, e.g.
rem      Build-App.bat --remote
rem      Build-App.bat --local --portable-only
rem      Build-App.bat --help
rem  See docs\MAKE-APP.md.
rem ---------------------------------------------------------------------------
setlocal EnableExtensions
title DOR101 - make the app

rem The tool draws its output in UTF-8 (boxes, ticks and crosses). Without this
rem the legacy console renders them as mojibake under the default OEM codepage.
rem It affects this window only, which closes when the build is done.
chcp 65001 >nul

rem Run from the folder this file lives in, not from whatever Explorer felt like.
cd /d "%~dp0"

echo.
echo   This window is the DOR101 app builder. It stays open so you can read the
echo   result. Close it at any time to stop the build.
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo   X  Node.js was not found on this computer.
  echo.
  echo      Install the LTS version from https://nodejs.org, then double-click
  echo      this file again. Node is only needed to run this tool - building
  echo      "on GitHub" does not compile anything here.
  echo.
  pause
  exit /b 1
)

if not exist "scripts\make-app.mjs" (
  echo   X  scripts\make-app.mjs is missing from this folder.
  echo.
  echo      This file has to stay in the root of the Dorchester-101 repository.
  echo      If the repository moved or is incomplete, clone it again:
  echo        git clone https://github.com/Nikoxkx/Dorchester-101.git
  echo.
  pause
  exit /b 1
)

node scripts\make-app.mjs %*
set EXITCODE=%ERRORLEVEL%

echo.
if %EXITCODE% EQU 0 (
  echo   Finished. You can close this window.
) else (
  echo   The build stopped with an error - the reason is above this line.
  echo   Nothing was published. docs\MAKE-APP.md covers the usual fixes.
)
echo.
pause
exit /b %EXITCODE%
