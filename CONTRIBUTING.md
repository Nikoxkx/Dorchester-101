# Contributing to DOR101

DOR101 is a community directory for Dorchester, Boston. Contributions that
add or improve **verified** resources are very welcome.

## The one rule

**Never publish an unverified number.** Every figure in `src/data/` carries a
`source` and a `lastVerified`/`asOf` date, and every page prints them. If you
cannot date a fact, the fact does not ship.

## Adding or updating a resource

1. Find the right data file in `src/data/` (`programs.ts`, `housing.ts`,
   `food.ts`, `resources.ts`, `map.ts`, `projects.ts`, `neighborhoods.ts`).
2. Verify by phone or by the agency's own page:
   - confirm the phone number dials the right office,
   - confirm hours/eligibility as of today,
   - keep the agency's URL as `sourceUrl`.
3. Update the record **and** its date field in the same commit.
4. Run `npm test` — invariant tests guard AMI math, FMR, SNAP amounts, BHA
   status, and MBTA fares so a bad edit fails loudly.

## New pages or features

- UI strings belong in `src/lib/i18n.ts` (English first; native speakers then
  translate the rest).
- Program figures must be imported from `src/data/programs.ts` — never typed
  into a component or page.
- Prefer the existing atoms in `src/components/ui/` and the tokens in
  `src/app/globals.css`; the design grammar is described in the README.

## Quality gates

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

CI runs the same gates plus Playwright e2e on every push.
