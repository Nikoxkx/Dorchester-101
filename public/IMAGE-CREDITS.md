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

## `img/hoods/*.jpg` — sub-neighborhood photographs

All nine are from Wikimedia Commons and are shown only inside the expanded card for
that area. Each caption in the UI links to the Commons file page, which carries the
author and the exact licence (all are CC BY, CC BY-SA or public domain at the time of
import). Modifications: resized to 1200–1600 px, progressive JPEG.

- `fields-corner.jpg` — Fields Corner: Inbound Red Line train arriving at Fields Corner station, July 2021. Source: `commons.wikimedia.org/wiki/File:Inbound_train_arriving_at_Fields_Corner_station,_July_2021.jpg`
- `savin-hill.jpg` — Savin Hill: Dorchester Bay seen from Savin Hill. Source: `commons.wikimedia.org/wiki/File:Dorchester_Bay_from_Savin_Hill.jpg`
- `uphams-corner.jpg` — Uphams Corner: The S. B. Pierce Building at Uphams Corner. Source: `commons.wikimedia.org/wiki/File:S_B_Pierce_Building,_Uphams_Corner,_Dorchester_MA.jpg`
- `codman-square.jpg` — Codman Square: Edward Everett Square, at the Columbia Road end of the Codman Square–Uphams corridor; no Commons photograph of Codman Square itself is available yet. Source: `commons.wikimedia.org/wiki/File:Edward_Everett_Square,_Dorchester_MA.jpg`
- `grove-hall.jpg` — Grove Hall: Blue Hill Avenue near American Legion Highway. Source: `commons.wikimedia.org/wiki/File:Blue_Hill_Avenue_near_American_Legion_Highway_in_Dorchester_(11071878605).jpg`
- `four-corners.jpg` — Four Corners: Four Corners/Geneva Avenue station on the Fairmount Line, looking inbound. Source: `commons.wikimedia.org/wiki/File:Four_Corners_Geneva_Ave_station,_looking_inbound,_July_2013.JPG`
- `lower-mills.jpg` — Lower Mills: Ventura Street playground in the Neponset River Reservation, below Lower Mills. Source: `commons.wikimedia.org/wiki/File:Ventura_Street_Playground_Neponset_River_Reservation_Dorchester_Massachusetts.jpg`
- `ashmont.jpg` — Ashmont: Ashmont station from Peabody Square. Source: `commons.wikimedia.org/wiki/File:Ashmont_station_from_Peabody_Square.jpg`
- `neponset.jpg` — Neponset: Neponset River Reservation. Source: `commons.wikimedia.org/wiki/File:Neponset_River_Reservation_1_Dorchester_Massachusetts.jpg`

Note: no suitable Commons photograph of Codman Square proper existed at import time; the
Codman Square card uses Edward Everett Square and says so in its caption. Replace when a
licensed photo is available.

## Logos and symbols

- **MBTA route colours and shield shapes** come from the authority's own published
  values (`src/data/transit.ts`, cross-checked against the v3 API responses). No MBTA
  logo file is copied or redrawn: the shields in the map and the legends are drawn
  here as generic transit badges using the public route colours, which is what the
  data licence covers.
- **App icon / logo** (`logo.png`, `icons/*.png`) is a square crop of `img/dorchester-bay-sunset.jpg` (Sswonk, CC BY-SA 3.0) with the “101 · DORCHESTER” wordmark set over it; a derivative work, so the CC BY-SA credit applies to it too. `icon.svg` remains as a vector fallback.
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
