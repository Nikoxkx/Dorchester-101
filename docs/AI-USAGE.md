# How AI was used to build DOR101

DOR101 was built with AI assistance, and a directory that asks tenants to trust it
should say plainly which parts came from a model. This file is the full account.
A short version is in the README and in the **How AI was used** section of the
site's About page, in all nine languages.

Last reviewed: 28 October 2026.

## In one paragraph

I'm **Yeisbel**: I designed, built, maintain and run this site. AI tools — an AI
coding agent working in this repository (Arena.ai Agent Mode, which routes between
several models) and machine translation for the eight non-English locales — did
much of the typing. I directed the work, decided what shipped, checked every
listing against the organisation that publishes it, and I am the person answerable
for what the site says. Optional machine translation for public news excerpts is disabled by default; if an operator enables it, those excerpts are sent to an external provider. Nothing a visitor types is sent to that provider. Search terms are sent to the site’s search API; the layout also includes Vercel Analytics and Speed Insights when enabled by the host.

## Where AI was used

| Area | What AI did | How it was checked |
|------|-------------|--------------------|
| **Application code** — pages, components, hooks, API routes, the service worker | Wrote first drafts and most revisions of the TypeScript/React behind every screen, including the map, the offline path, the calculators and the Electron shell | `npm run typecheck && npm run lint && npm run test` must pass; every route is loaded and used by hand before a release |
| **Live data readers** — Census ACS, HUD income-limit workbooks, MBTA GTFS-realtime, RSS news | Wrote the parsers and the fallbacks that say "unavailable" when a publisher cannot be reached | Each reader is compared against the publisher's own response or file; a figure that cannot be traced to the source is not shown |
| **English copy** — page text, error messages, the FAQ answers, this About page | Drafted and re-drafted | Every factual sentence is tied to a named statute, agency page or dataset; the tenant-rights answers cite the office to call |
| **Translations** — Spanish, Haitian Creole, Portuguese, Vietnamese, Chinese, Arabic, Somali, Kabuverdianu | Produced AI-assisted first drafts for translated strings | Dictionary parity tests check keys, not whether all displayed content uses them. Some page and directory data and external feeds remain English. All twelve FAQ answers, all four project records, nine neighborhood summaries and photo captions, the neighborhood tenant-rights, healthcare and transit-guide sections, all thirteen winter-clothing records (summaries and available instruction, eligibility, hours and transit fields), and nineteen priority resource summaries and listing details for Boston Housing Authority, Housing Navigator, Metrolist, RAFT, Greater Boston Legal Services, City Life/Vida Urbana, all five food records, the Health Care For All HelpLine, Boston 311, Codman Square Health Center, the Grove Hall Library, Metro Housing\|Boston, the Somali Development Center, VietAID, and CPCS have first-pass drafts in every language. Bundled transit lines, bus route wording and station photo captions have drafts; exact live direction words are translated while unknown headsigns remain intact and disclosed. Fallback arrivals are headway estimates, not a published timetable; partial predictions are labelled incomplete. Unsourced sub-neighborhood figures and other unverified details have been removed pending verification; the overview cites the 2020 tract-based population. Project application guidance cites current sources rather than assuming a lottery or closed waitlist. Common NWS period labels, 16-point wind directions, simple mph ranges, and weather measurement units are localized. Unrecognized labels or wind wording and live weather prose remain in English and are marked. Source-digest tests flag edits to several of these records for review, but do not judge translation quality. Live news translation is optional and off by default; MBTA alerts remain in the original English with an explicit notice in other languages. Haitian Creole and Kriolu use actual content-language tags, and their weekday/month/relative-time labels are first-pass drafts rather than French or Portuguese fallback text. Browser read-aloud also requests the actual language tags; a compatible device voice may not be installed. Translations need native-speaker review, especially for legal and eligibility information. The benefits comparison and eviction and move-in tools give general information only; their rules and translations need subject-matter review and regular updates. |
| **Documentation** — this README, `BUILD.md`, `SECURITY.md`, this file, release notes | Drafted and maintained | Commands are run before they are written down; version numbers, paths and licence statements are read from the repository, not recalled |
| **Build and asset scripts** — icon generation, source badges, the desktop packager | Written with AI assistance | Run locally; the desktop package is verified by `npm run verify:desktop` |
| **Accessibility passes** — skip links, focus handling, reduced-motion, contrast | Suggested fixes and rewrites | Keyboard-only walkthrough of each page and a screen-reader pass on the main flows |
| **Translation coverage** — finding English still left in components | Converted many screens and added an AST guard (`src/__tests__/i18n-hardcoded.test.ts`) | The guard is a partial ratchet for JSX, selected attributes and FAQ data; a tracked set of pages remains unfinished and arbitrary data modules are not covered. Rendered language-switch tests exercise selected flows. Neither test proves full coverage. |

## Where AI was not used

* **Optional news translation.** The app can send public headlines and short excerpts
  from built-in news feeds to Lara when explicitly configured; it is off by default.
  Custom feeds and visitor-entered searches or feedback are never sent to Lara.
  Machine translations are labelled and originals are available. There is no chat,
  profiling or automated decision about a visitor; calculators are arithmetic.
* **No AI processes visitor input.** Search queries go to the site’s search API,
  and Vercel analytics components can process usage and performance data when
  enabled. The draft privacy notice needs owner and legal review against the deployment.
* **No AI-generated imagery.** Every photograph in `public/img/` is a credited
  Wikimedia Commons photograph of a real place, with its author, licence and file
  page recorded in [`public/IMAGE-CREDITS.md`](../public/IMAGE-CREDITS.md). Two
  photographs that used to appear on the About page (`img/fields-corner-station.jpg`
  and a top-level `img/codman-square.jpg`) were **removed** precisely because their
  provenance and licence could not be confirmed; credited Commons photographs took
  their place. The rule from here on: a file with no verifiable origin does not ship.
* **No invented facts.** Nothing on the site comes from a model's memory. Figures
  are read at request time or build time from the publisher (HUD, Census, MBTA,
  Mass.gov, BHA, Boston Planning Department), and when a source is unreachable the UI says "unavailable"
  or "snapshot" instead of filling the gap.

## Known limits of this disclosure

* The repository's history is a single import commit, so it does not record which
  model produced which line. This file describes how the project is built, not a
  per-commit audit trail.
* Translations are AI-assisted drafts that have not been reviewed by a professional
  translator in every language. Corrections are welcome through the issue tracker.
* I reviewed everything myself. Errors that a larger team would have caught may
  remain; that is a reason to report them, not a reason to hide how the site was made.

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
