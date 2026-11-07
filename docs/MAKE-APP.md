# Making the app — the one command

`make-app` is the maintainer's tool. It connects to the GitHub repository on its
own, builds the Windows app from the current website, checks that the result
actually runs, and asks before publishing anything.

Residents never need this. They download the finished app from the website; this
is what produces it.

## The short version

Double-click **`Build-App.bat`** (Windows) or **`build-app.command`** (macOS),
then press Enter at each question.

That is a complete, safe run: it takes the latest `main`, builds it on GitHub,
verifies the packaged app, and stops without publishing. The window stays open
so you can read the result.

The same tool from a terminal:

```bash
node scripts/make-app.mjs            # asks where to build
node scripts/make-app.mjs --remote   # build on GitHub, download the exe files
node scripts/make-app.mjs --local    # build on this computer
node scripts/make-app.mjs --help     # every option
```

## What it does

```
connect   talks to GitHub, fetches, and reports which code is about to be built
   ↓
choose    asks: build on GitHub, or on this computer?
   ↓
build     cloud: dispatches the Release workflow, follows the run, downloads it
          local: fast-forwards a clean tree, then runs scripts/build-exe.mjs
   ↓
verify    boots the packaged app and requests the routes the exe depends on
   ↓
publish   asks — and only then creates or updates the GitHub Release
```

Example output, from a run that has nothing to do:

```
── Connect ───────────────────────────────────────────────────

      Node.js 22.22.3
      git 2.39.5
      gh 2.50.1, signed in as Nikoxkx
      working in C:\dev\Dorchester-101
      fetching from GitHub…
      here       main @ 082abf3  (clean)
      on GitHub  main @ 9f1c2ab  (2 commit(s) newer than this checkout)

  How do you want to build the app (v4.9.2)?

    1  On GitHub  ← default
         GitHub's Windows runner builds the exe; the files are downloaded here.
         Nothing is installed or compiled on this computer. About 10 minutes.
         Ready — gh signed in as Nikoxkx.
    2  On this computer
         Pulls the latest code, then builds here with scripts/build-exe.mjs.
         About 5 minutes, and faster after that. Needs ~3 GB of free disk.
         Ready — Node.js 22.22.3.

  Enter 1-2 (Enter = 1, q = stop):
```

## The two build paths

| | **On GitHub** (`--remote`) | **On this computer** (`--local`) |
|---|---|---|
| What runs it | GitHub's Windows runner | Your machine |
| Needs here | A signed-in `gh`. Nothing else | Node.js 22.12+/24/26+, ~3 GB disk |
| Time | ~10 minutes, mostly waiting | ~5 minutes, faster on a re-run |
| Builds from | What is **pushed** to GitHub | What is **checked out** here |
| Verification | Read from the run's `verify-desktop.log` | Run here, after packaging |
| Extra tools | none | `wine`, only for a Linux cross-build |
| Good for | Shipping a release; a laptop with no toolchain | Iterating on the Electron shell |

Both produce exactly the same files in exactly the same place. The cloud path is
the default because it asks the least of the machine in front of you.

Neither path needs a local checkout at all for the cloud build — `--remote`
reads the repository through the API, so it works on a machine that has nothing
but `gh`.

## The questions it asks

Every question has a default, and every default is the safe answer.

| Question | Default | Why |
|---|---|---|
| Where should it build? | On GitHub, if `gh` is signed in | Needs the least from this machine |
| You have uncommitted changes and GitHub is ahead | Build what is checked out | Nothing is pulled over your edits |
| Your commits are not on GitHub and you chose a cloud build | Push them first | Otherwise the build cannot contain them |
| Publish to GitHub Releases? | **No** | Publishing is not undoable |
| Open the output folder? | Yes | The double-click case has no other view of the result |

Press `q` at any numbered question to stop. Nothing is changed by stopping.

## Options

```
Where to build
  --remote              build on GitHub's runner, download the exe files here
  --local               build on this computer with scripts/build-exe.mjs

What to build
  --ref <branch|tag>    build this ref instead of the default. Locally it is
                        also checked out, but only when the tree is clean
  --repo-dir <path>     use this clone; a folder that does not exist is cloned
  --no-sync             local only: build what is checked out, pull nothing
  --installer-only      just the setup exe
  --portable-only       just the no-install exe

After building
  --skip-verify         do not boot the packaged app
  --publish             publish to GitHub Releases without asking
  --no-publish          never offer to publish
  --open                open the output folder when finished
  --timeout <minutes>   how long to wait for a cloud build (default 45)

Other
  --yes                 take the default answer to safe questions
  --dry-run             print what would happen; nothing is built or changed
  --verbose             stack traces when something fails
```

`--yes` is deliberately weaker than it sounds. It answers the safe questions and
stops at the unsafe ones: it never publishes (that is `--publish`) and it never
moves a dirty tree. A question whose default would write to GitHub — pushing a
branch — is not answered by `--yes` either.

`--dry-run` still talks to GitHub for reading, so it reports the real state of
the repository, but it holds back anything that would change something:

```bash
node scripts/make-app.mjs --dry-run --remote
```

## Where the files land

One place, whichever path built them:

| File | What it is |
|---|---|
| `dist-electron/DOR101 Setup <version>.exe` | Installer — Start Menu and Desktop shortcuts, uninstaller |
| `dist-electron/DOR101-Portable-<version>.exe` | Portable — no install, no admin rights |
| `dist-electron/SHA256SUMS.txt` | Checksums for both |
| `dist-electron/verify-desktop.log` | Cloud builds only: the packaged-app check's own output |

The filenames come from `version` in `package.json` **of the code being built**.
A cloud build reads that version from GitHub, so a laptop that is two commits
behind still names the files correctly.

## Publishing

Publishing is what makes a new build reach residents: `/api/download` resolves
the newest GitHub Release, so the site's download button follows automatically.

The tool asks after a successful verification. Say yes and it:

1. Creates `v<version>` if that release does not exist, using
   `release/v<version>/RELEASE.md` when the local build drafted one, and
   GitHub-generated notes otherwise.
2. Or uploads into the existing release with `--clobber`, because rebuilding the
   same version after a fix is the normal case.
3. Prints the release URL.

A build that **failed verification is not offered for publication.** `--publish`
overrides that, loudly, for when you know something the check does not.

## What this tool will never do

- Discard work. The only change it makes to your tree is a fast-forward of a
  clean branch, or a checkout of a ref you named. It never stashes, never
  `reset --hard`, never cleans untracked files.
- Build the wrong code silently. If your commits are unpushed and you asked for
  a cloud build, it stops and says so.
- Publish without being told.
- Switch branches without being asked.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `gh is not signed in` | `gh auth login`. Or build locally with `--local` |
| `This tool has to know where to build` | It cannot ask in a non-interactive shell. Add `--remote` or `--local` |
| `N local commit(s) have not been pushed` | `git push`, or `--local` to build them here |
| `committing or stashing is your call` | Commit or stash, or add `--no-sync` to build exactly what is on disk |
| Cloud build failed | The failing job and step are printed, with the run URL. Answer yes to "Print the failing part of the log here?" |
| `still running after 45 minutes` | The run is not lost. Follow the printed URL, or allow longer with `--timeout 90` |
| Cloud build green but `✖ … failed verification` | The workflow tolerates a failed check so the artifacts survive. Read `dist-electron/verify-desktop.log` |
| `the download has no verify-desktop.log` | An older workflow run, or one that died before the check. The exe files are still there |
| Blank window in the finished app | `npm run verify:desktop` reproduces it outside Electron. See [BUILD.md](../BUILD.md) |
| Windows SmartScreen warning | Expected — the build is unsigned. **More info → Run anyway** |

## How it fits with the rest

`make-app` wraps the pieces that already existed; it does not replace them, and
it contains no build logic of its own.

| Piece | Role |
|---|---|
| `scripts/make-app.mjs` | This tool: connect, choose, build, verify, publish |
| `scripts/lib/make-app.mjs` | Its decisions, pure and tested by `src/__tests__/makeApp.test.ts` |
| `Build-App.bat`, `build-app.command` | Double-click launchers for the same script |
| [`scripts/build-exe.mjs`](../scripts/build-exe.mjs) | The actual local build — what `--local` runs |
| [`.github/workflows/release.yml`](../.github/workflows/release.yml) | The Windows runner build — what `--remote` dispatches |
| [`scripts/verify-desktop-package.mjs`](../scripts/verify-desktop-package.mjs) | Boots the packaged app and probes its routes |
| [BUILD.md](../BUILD.md) | The build itself, in depth: flags, packaging, requirements |

If you want the underlying commands without the conversation, they are all still
there: `npm run build:exe`, `npm run verify:desktop`,
`pwsh scripts/publish-release.ps1`.
