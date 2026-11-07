#!/usr/bin/env bash
# ---------------------------------------------------------------------------
#  DOR101 — make the app
#
#  Double-click this file in Finder. That is the whole instruction.
#
#  It connects to GitHub, asks where to build, builds the Windows app and
#  verifies it, then asks before publishing anything. Pressing Return at every
#  question is a complete, safe run.
#
#  Options pass straight through, e.g.
#      ./build-app.command --remote
#      ./build-app.command --local --portable-only
#      ./build-app.command --help
#  See docs/MAKE-APP.md.
#
#  Building the Windows exe on macOS works — electron-builder cross-builds it —
#  but a Linux cross-build additionally needs wine for the icon stamping step.
# ---------------------------------------------------------------------------
set -uo pipefail

# Run from the folder this file lives in, not from wherever Finder started us.
cd "$(dirname "$0")" || exit 1

echo
echo "  This window is the DOR101 app builder. It stays open so you can read the"
echo "  result."
echo

if ! command -v node >/dev/null 2>&1; then
  echo "  ✖ Node.js was not found on this computer."
  echo
  echo "    Install it from https://nodejs.org (or: brew install node), then run"
  echo "    this file again. Node is only needed to run this tool — building"
  echo "    \"on GitHub\" does not compile anything here."
  echo
  printf '  Press Return to close… '
  read -r _ || true
  exit 1
fi

if [ ! -f "scripts/make-app.mjs" ]; then
  echo "  ✖ scripts/make-app.mjs is missing from this folder."
  echo
  echo "    This file has to stay in the root of the Dorchester-101 repository."
  echo "    If the repository moved or is incomplete, clone it again:"
  echo "      git clone https://github.com/Nikoxkx/Dorchester-101.git"
  echo
  printf '  Press Return to close… '
  read -r _ || true
  exit 1
fi

node scripts/make-app.mjs "$@"
exitcode=$?

echo
if [ "$exitcode" -eq 0 ]; then
  echo "  Finished."
else
  echo "  The build stopped with an error — the reason is above this line."
  echo "  Nothing was published. docs/MAKE-APP.md covers the usual fixes."
fi
echo
printf '  Press Return to close… '
read -r _ || true
exit "$exitcode"
