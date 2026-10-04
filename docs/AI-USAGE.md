# How AI was used to build DOR101

DOR101 was built with AI assistance, and a directory that asks tenants to trust it
should say plainly which parts came from a model. This file is the full account.
A short version is in the README and in the **How AI was used** section of the
site's About page, in all nine languages.

Last reviewed: 4 October 2026.

## In one paragraph

One person, **Yeisbel Pena**, designed, built, maintains and runs this site. AI
tools — an AI coding agent working in this repository (Arena.ai Agent Mode, which
routes between several models) and machine translation for the eight non-English
locales — did much of the typing. Yeisbel directed the work, decided what shipped,
checked every listing against the organisation that publishes it, and is the person
answerable for what the site says. No AI runs inside the app itself: nothing a
visitor types is sent to a model, and nothing about a visitor is sent anywhere.

## Where AI was used

| Area | What AI did | How it was checked |
|------|-------------|--------------------|
| **Application code** — pages, components, hooks, API routes, the service worker | Wrote first drafts and most revisions of the TypeScript/React behind every screen, including the map, the offline path, the calculators and the Electron shell | `npm run typecheck && npm run lint && npm run test` must pass; every route is loaded and used by hand before a release |
| **Live data readers** — Census ACS, HUD income-limit workbooks, MBTA GTFS-realtime, RSS news | Wrote the parsers and the fallbacks that say "unavailable" when a publisher cannot be reached | Each reader is compared against the publisher's own response or file; a figure that cannot be traced to the source is not shown |
| **English copy** — page text, error messages, the FAQ answers, this About page | Drafted and re-drafted | Every factual sentence is tied to a named statute, agency page or dataset; the tenant-rights answers cite the office to call |
| **Translations** — Spanish, Haitian Creole, Portuguese, Vietnamese, Chinese, Arabic, Somali, Kabuverdianu | Produced the first pass of every string, and later corrections | A parity test fails the build when any locale is missing a key, so no screen silently falls back to English. Where a locale has thin reference material (Haitian Creole, Kabuverdianu, Somali especially) the phrasing is a best effort, not a substitute for a professional translator |
| **Documentation** — this README, `BUILD.md`, `SECURITY.md`, this file, release notes | Drafted and maintained | Commands are run before they are written down; version numbers, paths and licence statements are read from the repository, not recalled |
| **Build and asset scripts** — icon generation, source badges, the desktop packager | Written with AI assistance | Run locally; the desktop package is verified by `npm run verify:desktop` |
| **Accessibility passes** — skip links, focus handling, reduced-motion, contrast | Suggested fixes and rewrites | Keyboard-only walkthrough of each page and a screen-reader pass on the main flows |

## Where AI was not used

* **No AI in the running app.** There is no language model, chat, recommendation
  engine, scoring or automated decision anywhere in the product. The site ships no
  AI SDK and makes no outbound AI call. Search is a literal text match over local
  data; the calculators are arithmetic you can check by hand.
* **No visitor data leaves the browser.** Consistent with the privacy policy: no
  accounts, no analytics, no third-party scripts. A model that never receives
  anything cannot profile anyone.
* **No AI-generated imagery.** Every photograph in `public/img/` is a credited
  Wikimedia Commons photograph of a real place, with its author, licence and file
  page recorded in [`public/IMAGE-CREDITS.md`](../public/IMAGE-CREDITS.md). Two
  photographs that used to appear on the About page (`img/fields-corner-station.jpg`
  and a top-level `img/codman-square.jpg`) were **removed** precisely because their
  provenance and licence could not be confirmed; credited Commons photographs took
  their place. The rule from here on: a file with no verifiable origin does not ship.
* **No invented facts.** Nothing on the site comes from a model's memory. Figures
  are read at request time or build time from the publisher (HUD, Census, MBTA,
  Mass.gov, BHA, BPDA), and when a source is unreachable the UI says "unavailable"
  or "snapshot" instead of filling the gap.

## Known limits of this disclosure

* The repository's history is a single import commit, so it does not record which
  model produced which line. This file describes how the project is built, not a
  per-commit audit trail.
* Translations are AI-assisted drafts that have not been reviewed by a professional
  translator in every language. Corrections are welcome through the issue tracker.
* Review was by one person. Errors that a larger team would have caught may remain;
  that is a reason to report them, not a reason to hide how the site was made.

## How to check the claims

```bash
npm run typecheck && npm run lint && npm run test   # code, types, translations
npm run build                                       # the shipped site
```

* Per-photograph provenance: [`public/IMAGE-CREDITS.md`](../public/IMAGE-CREDITS.md).
* Per-publisher data sources and cadence: the **Data sources** section of the README
  and the About page in the app.
* Anything that looks wrong: open an issue at
  <https://github.com/Nikoxkx/Dorchester-101/issues>.
