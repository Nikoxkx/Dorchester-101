# Image credits

Every photograph the site ships, where it came from, who took it and what the
licence allows. Kept next to the images because a credit that lives only in a
build script gets lost.

**A file whose origin cannot be confirmed is not shipped.** Two photographs that
used to appear on the About page — `img/fields-corner-station.jpg` and a
top-level `img/codman-square.jpg` — were removed for exactly that reason: no
EXIF, no upload record, no licence, and therefore no honest way to credit them.
The Wikimedia Commons photographs below took their place. Author, licence and
file page for each one were checked against Commons itself, not copied from a
third party.

None of the images on this site is AI-generated. Every photograph is a credited
photograph of a real place; the logos, source badges and icons are drawn here.

## `img/dorchester-bay-sunset.jpg`

- **Subject:** Dorchester Bay and the Neponset mouth at sunset, looking south from the
  Morris Brown Jr. Bridge area.
- **Author:** *Sswonk* (Wikimedia Commons), 4 July 2009.
- **Commons page:** https://commons.wikimedia.org/wiki/File:Dorchester_Bay_Boston_Harbor_sunset.jpg
- **Licence:** Creative Commons Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0).
- **Credit line used in the UI:** “Dorchester Bay at sunset — photo by Sswonk, CC BY-SA 3.0.”
- **Modifications:** recoloured for contrast, resized to 1600 px on the long edge,
  converted to progressive JPEG with 4:2:0 chroma. Derivative work, so the CC BY-SA
  attribution travels with it.
- **Also used for:** the app icon, the PWA icon set, the Open Graph card and the README
  hero — all derivatives of this photograph, so the same credit covers all of them.

## `img/hoods/fields-corner.jpg`

- **Subject:** An inbound Red Line train arriving at Fields Corner station, 25 July 2021.
- **Author:** *Hutima* (Wikimedia Commons).
- **Commons page:** https://commons.wikimedia.org/wiki/File:Inbound_train_arriving_at_Fields_Corner_station,_July_2021.jpg
- **Licence:** Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0).
- **Credit line used in the UI:** “Fields Corner station — photo by Hutima, CC BY-SA 4.0.”
- **Modifications:** resized to 1200 px on the long edge, progressive JPEG. Derivative work,
  so the attribution travels with it.
- **Used in:** the About page, the Fields Corner neighborhood card and the station photo
  sheet for Fields Corner.

## `img/hoods/codman-square.jpg`

- **Subject:** Edward Everett Square, Dorchester — the Columbia Road end of the
  Codman Square–Uphams Corner corridor. It stands in for Codman Square because no
  Commons photograph of Codman Square itself was available at import time; the caption
  in the UI says so rather than passing the square off as somewhere else.
- **Author:** *John Phelan* (Wikimedia Commons), 11 March 2012.
- **Commons page:** https://commons.wikimedia.org/wiki/File:Edward_Everett_Square,_Dorchester_MA.jpg
- **Licence:** Creative Commons Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0).
- **Credit line used in the UI:** “Edward Everett Square, Dorchester — photo by John Phelan, CC BY-SA 3.0.”
- **Modifications:** resized, progressive JPEG.
- **Used in:** the About page and the Codman Square neighborhood card.

## `img/hoods/savin-hill.jpg`

- **Subject:** Dorchester Bay seen from Savin Hill, October 2016.
- **Author:** *ButteBag* (Wikimedia Commons).
- **Commons page:** https://commons.wikimedia.org/wiki/File:Dorchester_Bay_from_Savin_Hill.jpg
- **Licence:** Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0).
- **Modifications:** resized, progressive JPEG.

## `img/hoods/uphams-corner.jpg`

- **Subject:** The S. B. Pierce Building at Uphams Corner, March 2012.
- **Author:** *John Phelan* (Wikimedia Commons).
- **Commons page:** https://commons.wikimedia.org/wiki/File:S_B_Pierce_Building,_Uphams_Corner,_Dorchester_MA.jpg
- **Licence:** Creative Commons Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0).
- **Modifications:** resized, progressive JPEG.

## `img/hoods/grove-hall.jpg`

- **Subject:** Blue Hill Avenue near American Legion Highway, circa 1960–1968.
- **Author:** City of Boston Archives (Mayor John F. Collins records, collection #0244.001).
- **Commons page:** https://commons.wikimedia.org/wiki/File:Blue_Hill_Avenue_near_American_Legion_Highway_in_Dorchester_(11071878605).jpg
- **Licence:** Creative Commons Attribution 2.0 Generic (CC BY 2.0).
- **Modifications:** resized, progressive JPEG.

## `img/hoods/four-corners.jpg`

- **Subject:** Four Corners/Geneva Avenue station on the Fairmount Line, looking inbound,
  July 2013.
- **Author:** *Pi.1415926535* (Wikimedia Commons).
- **Commons page:** https://commons.wikimedia.org/wiki/File:Four_Corners_Geneva_Ave_station,_looking_inbound,_July_2013.JPG
- **Licence:** Creative Commons Attribution-ShareAlike 3.0 Unported (CC BY-SA 3.0).
- **Modifications:** resized, progressive JPEG.

## `img/hoods/lower-mills.jpg`

- **Subject:** Ventura Street playground in the Neponset River Reservation, below Lower
  Mills, September 2018.
- **Author:** *Swampyank* (Wikimedia Commons).
- **Commons page:** https://commons.wikimedia.org/wiki/File:Ventura_Street_Playground_Neponset_River_Reservation_Dorchester_Massachusetts.jpg
- **Licence:** Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0).
- **Modifications:** resized, progressive JPEG.

## `img/hoods/ashmont.jpg`

- **Subject:** Ashmont station from Peabody Square, June 2012.
- **Author:** *Matthew in Boston* (Wikimedia Commons).
- **Commons page:** https://commons.wikimedia.org/wiki/File:Ashmont_station_from_Peabody_Square.jpg
- **Licence:** Creative Commons Attribution-ShareAlike 2.0 Generic (CC BY-SA 2.0).
- **Modifications:** resized, progressive JPEG.

## `img/hoods/neponset.jpg`

- **Subject:** Neponset River Reservation, September 2018.
- **Author:** *Swampyank* (Wikimedia Commons).
- **Commons page:** https://commons.wikimedia.org/wiki/File:Neponset_River_Reservation_1_Dorchester_Massachusetts.jpg
- **Licence:** Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0).
- **Modifications:** resized, progressive JPEG.

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
