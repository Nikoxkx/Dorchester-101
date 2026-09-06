# Organization marks — sourcing manifest

Per the DOR101 design rules: every partner organization is represented by its
**real, current** mark, sourced from the organization itself or (for U.S.
government works) a public-domain source. **Never generate, approximate, or
placeholder** a mark. Where a private company's brand guidelines restrict use
(Zillow, Redfin), DOR101 uses **text attribution** instead — that decision is
final, not a placeholder.

## How to add a mark

Download the file at the source URL, save it under `/public/logos/` with the
exact filename below (SVG preferred), and it appears in the Resource Directory
and partners section automatically. `src/components/ui/OrgLogo.tsx` renders the
file when present and falls back to a plain typographic wordmark otherwise.

## U.S. government / public agencies (public-domain works)

| Organization | File | Source (verified 2026-09) |
| --- | --- | --- |
| MBTA | `mbta.svg` | https://commons.wikimedia.org/wiki/File:MBTA.svg (PD-ineligible “T” mark; also on mbta.com design standards) |
| HUD | `hud.svg` | https://commons.wikimedia.org/wiki/File:Seal_of_the_United_States_Department_of_Housing_and_Urban_Development.svg (U.S. gov work) — verify against huduser.gov before shipping |
| U.S. Census Bureau | `census.svg` | https://commons.wikimedia.org/wiki/File:US-CensusBureau-Logo.svg (U.S. gov work) — verify against census.gov |
| City of Boston (BPDA, Boston Open Data) | `boston.svg` | https://commons.wikimedia.org/wiki/File:Seal_of_Boston,_Massachusetts.svg (municipal seal) — verify against boston.gov |
| Boston Housing Authority | `bha.svg` | bostonhousing.org press/communications page (they publish a media kit; request via BHA Communications) |
| Greater Boston Food Bank | `gbfb.svg` | gbfb.org “Press & Media” kit |
| Project Bread | `projectbread.svg` | projectbread.org media page |
| ABCD | `abcd.svg` | bostonabcd.org about/press page |
| CSNDC | `csndc.svg` | csndc.org footer/about |
| DBEDC (Dorchester Bay EDC) | `dbedc.svg` | dorchesterbay.org press page |
| VietAID | `vietaid.svg` | vietaid.org about page |
| City Life / Vida Urbana | `citylife.svg` | claseba.org / clave-uv.org press page |

## Private data providers (text attribution only — do NOT add their marks)

| Source | Attribution string used in UI |
| --- | --- |
| Zillow Research | “Data: Zillow Research” (ZORI) |
| Redfin | “Data: Redfin Data Center” |
| RentCafe | “Published estimate: RentCafe” |
