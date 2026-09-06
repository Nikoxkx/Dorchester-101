# Image credits

Every photograph the site ships, where it came from, and what the licence allows.
Kept next to the images because a credit that lives only in a build script gets lost.

## `img/dorchester-bay-sunset.jpg`

- **Subject:** Dorchester Bay and the Neponset mouth at sunset, looking south from the
  Morris Brown Jr. Bridge area.
- **Source:** Wikimedia Commons, uploaded by user *Sswonk*.
- **Licence:** Creative Commons Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0).
- **Credit line used in the UI:** “Dorchester Bay at sunset — photo by Sswonk, CC BY-SA 3.0.”
- **Modifications:** recoloured for contrast, resized to 1600 px on the long edge,
  converted to progressive JPEG with 4:2:0 chroma. Derivative work, so the CC BY-SA
  attribution travels with it.

## `img/fields-corner-station.jpg`

- **Subject:** Fields Corner station plaza, Red Line Ashmont branch.
- **Status:** provenance and licence **must be confirmed before this file is
  republished outside this repository.** It is used only as on-site illustration of
  the Fields Corner section and is not offered for reuse.
- **Modifications:** resized, progressive JPEG.

## `img/codman-square.jpg`

- **Subject:** Codman Square at Washington Street and Centre Street.
- **Status:** provenance and licence **must be confirmed before republication.** Same
  handling as above.
- **Modifications:** resized, progressive JPEG.

## Logos and symbols

- **MBTA route colours and shield shapes** come from the authority's own published
  values (`src/data/transit.ts`, cross-checked against the v3 API responses). No MBTA
  logo file is copied or redrawn: the shields in the map and the legends are drawn
  here as generic transit badges using the public route colours, which is what the
  data licence covers.
- **App icon and inline marks** are original work by this project.
- **Typefaces** — Fraunces (variable), Public Sans, Atkinson Hyperlegible, IBM Plex
  Mono, Noto Sans Arabic — are bundled from `@fontsource` packages. Each is SIL Open
  Font License; the licence text ships in the installed package folder.
- **Basemap and imagery** — OpenStreetMap contributors (ODbL) for street tiles and
  labels, Esri World Imagery for satellite. Both are attributed in the map corner by
  Leaflet on every zoom level, and again in the map legend.

## Fonts, icons, third-party data

- **Icons:** Lucide, ISC licence.
- **Transit data:** MBTA Developer V3 API (`api-v3.mbta.com`), GTFS-derived. Arrivals
  and alerts are read live; when the feed is unreachable the site says “timetable”
  and shows the published headway instead of pretending to be live.
- **Demographic figures:** US Census Bureau, American Community Survey 5-year
  estimates, read at build time through `src/lib/census.ts`.
- **Housing market figures:** not installed unless `public/data/hud-fmr.json` is
  present, in which case the market page reports it as installed. Nothing is
  estimated when the file is missing.
