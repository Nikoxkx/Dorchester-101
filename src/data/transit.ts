/**
 * MBTA reference data for the lines that serve Dorchester.
 *
 * Colors are the authority's own published values (the same ones the v3 API
 * returns for each route), so a shield on our map matches the one on the
 * platform. Stop identifiers are the GTFS parent-station ids.
 *
 * This file is *reference* data only. Anything that moves (arrivals, alerts,
 * detours, elevator status) is fetched live by /api/mbta and this data is used
 * solely as the fallback when the feed is unreachable. When the fallback is on
 * screen the UI says "timetable", never "live".
 */

export type TransitMode = 'subway' | 'trolley' | 'rail' | 'bus';

export interface TransitStopRef {
  id: string;
  name: string;
  lat: number;
  lng: number;
  /** GTFS wheelchair_boarding: 1 = wheelchair boarding is possible, 2 = not possible. */
  accessible: boolean;
  /** Connections worth telling a rider about. */
  connects?: string[];
}

export interface TransitLine {
  id: string;
  routeId: string;
  mode: TransitMode;
  /** Printed on the shield. Bus uses the route number, lines use a letter. */
  label: string;
  name: string;
  /** Official MBTA route colour, without the leading #. */
  color: string;
  textColor: string;
  /** Served by DOR101 in full or in part. */
  dorchesterStops: TransitStopRef[];
  /** Typical headway in minutes, off-peak weekdays. */
  headwayMinutes: number;
  peakHeadwayMinutes: number;
  /** Rough service window in the authority's own timetable convention. */
  firstDeparts: string;
  lastDeparts: string;
  fare: { mode: 'subway' | 'bus' | 'commuter-rail'; CharlieCardUsd: number; note?: string };
  /** Shape fallback used only if api-v3.mbta.com cannot be reached. */
  fallbackPath?: Array<[number, number]>;
}

export const MBTA_GREEN = '#00843D';
export const MBTA_RED = '#DA291C';
export const MBTA_ORANGE = '#ED8B00';
export const MBTA_BLUE = '#003DA5';
export const MBTA_BUS_YELLOW = '#FFC72C';
export const MBTA_CR_PURPLE = '#80276C';

/**
 * Date the reference values below were last checked against mbta.com and the
 * v3 API. Shown in the UI, never presented as "live".
 */
export const TRANSIT_DATA_AS_OF = '2026-10-04';

export const TRANSIT_LINES: TransitLine[] = [
  {
    id: 'red-ashmont',
    routeId: 'Red',
    mode: 'subway',
    label: 'B',
    name: 'Red Line, Ashmont branch',
    color: MBTA_RED,
    textColor: '#FFFFFF',
    headwayMinutes: 9,
    peakHeadwayMinutes: 4,
    firstDeparts: '04:40',
    lastDeparts: '00:35',
    fare: { mode: 'subway', CharlieCardUsd: 2.4 },
    dorchesterStops: [
      { id: 'place-jfk', name: 'JFK/UMass', lat: 42.320685, lng: -71.052391, accessible: true, connects: ['Commuter Rail: Greenbush, Kingston, Fall River/New Bedford', 'Bus 8, 16, 41'] },
      { id: 'place-shmnl', name: 'Savin Hill', lat: 42.31129, lng: -71.053331, accessible: true },
      { id: 'place-fldcr', name: 'Fields Corner', lat: 42.300093, lng: -71.061667, accessible: true, connects: ['Bus 15, 17, 18, 19, 201, 202, 210'] },
      { id: 'place-smmnl', name: 'Shawmut', lat: 42.293126, lng: -71.065738, accessible: true },
      { id: 'place-asmnl', name: 'Ashmont', lat: 42.28452, lng: -71.063777, accessible: true, connects: ['Mattapan Line', 'Bus 15, 18, 21, 22, 23, 24, 26, 215, 217, 240'] },
    ],
    fallbackPath: [
      [42.320685, -71.052391],
      [42.31632, -71.05553],
      [42.31129, -71.053331],
      [42.30608, -71.0569],
      [42.300093, -71.061667],
      [42.29663, -71.06395],
      [42.29312, -71.065738],
      [42.28879, -71.06589],
      [42.28452, -71.063777],
    ],
  },
  {
    id: 'red-braintree',
    routeId: 'Red',
    mode: 'subway',
    label: 'A',
    name: 'Red Line, Braintree branch',
    color: MBTA_RED,
    textColor: '#FFFFFF',
    headwayMinutes: 12,
    peakHeadwayMinutes: 6,
    firstDeparts: '04:45',
    lastDeparts: '00:30',
    fare: { mode: 'subway', CharlieCardUsd: 2.4 },
    dorchesterStops: [
      { id: 'place-jfk', name: 'JFK/UMass', lat: 42.320685, lng: -71.052391, accessible: true, connects: ['Ashmont branch', 'Commuter Rail'] },
    ],
    fallbackPath: [
      [42.320685, -71.052391],
      [42.31589, -71.04663],
      [42.30906, -71.03979],
    ],
  },
  {
    id: 'mattapan',
    routeId: 'Mattapan',
    mode: 'trolley',
    label: 'M',
    name: 'Mattapan Line',
    color: MBTA_RED,
    textColor: '#FFFFFF',
    headwayMinutes: 11,
    peakHeadwayMinutes: 7,
    firstDeparts: '05:00',
    lastDeparts: '00:45',
    // The Mattapan Line is charged at subway fare.
    fare: { mode: 'subway', CharlieCardUsd: 2.4, note: 'Same fare as the Red Line, free transfer at Ashmont.' },
    dorchesterStops: [
      { id: 'place-asmnl', name: 'Ashmont', lat: 42.28452, lng: -71.063777, accessible: true, connects: ['Red Line'] },
      { id: 'place-cedgr', name: 'Cedar Grove', lat: 42.279629, lng: -71.060394, accessible: true },
      { id: 'place-butlr', name: 'Butler', lat: 42.272429, lng: -71.062519, accessible: true },
      { id: 'place-miltt', name: 'Milton', lat: 42.270349, lng: -71.067266, accessible: true },
      { id: 'place-cenav', name: 'Central Avenue', lat: 42.270027, lng: -71.073444, accessible: true },
      { id: 'place-valrd', name: 'Valley Road', lat: 42.268347, lng: -71.081343, accessible: false },
      { id: 'place-capst', name: 'Capen Street', lat: 42.267563, lng: -71.087338, accessible: true },
      { id: 'place-matt', name: 'Mattapan', lat: 42.26762, lng: -71.092486, accessible: true, connects: ['Bus 15, 24, 28, 29, 30, 31, 33, 245, 716'] },
    ],
    fallbackPath: [
      [42.28452, -71.063777],
      [42.279629, -71.060394],
      [42.272429, -71.062519],
      [42.270349, -71.067266],
      [42.270027, -71.073444],
      [42.268347, -71.081343],
      [42.267563, -71.087338],
      [42.26762, -71.092486],
    ],
  },
  {
    id: 'fairmount',
    routeId: 'CR-Fairmount',
    mode: 'rail',
    label: 'CR',
    name: 'Fairmount Line',
    color: MBTA_CR_PURPLE,
    textColor: '#FFFFFF',
    headwayMinutes: 30,
    peakHeadwayMinutes: 15,
    firstDeparts: '05:10',
    lastDeparts: '23:40',
    fare: {
      mode: 'commuter-rail',
      CharlieCardUsd: 2.4,
      note: 'Zone 1A, the same one-way price as the subway, bought on a CharlieTicket or mTicket — a CharlieCard carrying a monthly LinkPass covers these trains.',
    },
    dorchesterStops: [
      { id: 'place-DB-2258', name: 'Uphams Corner', lat: 42.319125, lng: -71.068627, accessible: true, connects: ['Franklin/Foxboro Line'] },
      { id: 'place-DB-2249', name: 'Four Corners/Geneva', lat: 42.305037, lng: -71.076833, accessible: true, connects: ['Franklin/Foxboro Line'] },
      { id: 'place-DB-2240', name: 'Talbot Avenue', lat: 42.292246, lng: -71.07814, accessible: true, connects: ['Franklin/Foxboro Line'] },
      { id: 'place-DB-2230', name: 'Morton Street', lat: 42.280994, lng: -71.085475, accessible: true, connects: ['Franklin/Foxboro Line'] },
      { id: 'place-DB-2222', name: 'Blue Hill Avenue', lat: 42.271466, lng: -71.095782, accessible: true, connects: ['Franklin/Foxboro Line'] },
    ],
    fallbackPath: [
      [42.319125, -71.068627],
      [42.305037, -71.076833],
      [42.292246, -71.07814],
      [42.280994, -71.085475],
      [42.271466, -71.095782],
    ],
  },
];

/**
 * The bus routes this map tracks for Dorchester trips: every route that calls
 * at a Dorchester station above, plus the connecting and crosstown routes
 * riders here use. `name` is the number the authority paints on the box;
 * `longName` is the authority's own current long_name, read from the v3 API's
 * /routes on 4 October 2026 and still preferred live when the request
 * succeeds, so a rider is never shown a terminus that changed in a rebuild.
 * `frequent` mirrors the API's Frequent Bus classification.
 */
export interface BusRouteRef {
  id: string;
  name: string;
  /**
   * Route name used only when the live `/routes` request has not answered.
   * Termini move with every service change, so the map prefers the authority's
   * own long_name and labels this text as a reference, not a promise about
   * where a bus turns around today.
   */
  longName: string;
  color: string;
  textColor: string;
  /** Frequent-service routes get a wider shield on the map. */
  frequent: boolean;
  headwayMinutes: number;
  /** Route hint (termini or the corridor the authority names), never rendered alone. */
  corridors: string[];
}

export const DORCHESTER_BUS_ROUTES: BusRouteRef[] = [
  { id: '7',   name: '7',   longName: 'City Point - Otis Street & Summer Street',                 color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 15, corridors: ['City Point', 'Otis Street & Summer Street'] },
  { id: '9',   name: '9',   longName: 'City Point - Copley Square',                              color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: true,  headwayMinutes: 12, corridors: ['City Point', 'Copley Square'] },
  { id: '10',  name: '10',  longName: 'City Point - Arlington Station',                          color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 20, corridors: ['City Point', 'Arlington Station'] },
  { id: '11',  name: '11',  longName: 'City Point - Chauncy Street & Summer Street',             color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 18, corridors: ['City Point', 'Chauncy Street'] },
  { id: '14',  name: '14',  longName: 'Roslindale Square - Heath Street',                        color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 20, corridors: ['Roslindale Square', 'Heath Street'] },
  { id: '16',  name: '16',  longName: 'Forest Hills Station - Andrew Station or Harbor Point',   color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 15, corridors: ['Columbia Road', 'JFK/UMass', 'Andrew Station'] },
  { id: '17',  name: '17',  longName: 'Fields Corner Station - Andrew Station',                  color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 15, corridors: ['Fields Corner', 'Andrew Station'] },
  { id: '18',  name: '18',  longName: 'Ashmont Station - Andrew Station',                        color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 18, corridors: ['Dorchester Avenue', 'Savin Hill'] },
  { id: '23',  name: '23',  longName: 'Ashmont Station - Ruggles Station via Washington Street', color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: true,  headwayMinutes: 15, corridors: ['Washington Street', 'Talbot Avenue'] },
  { id: '24',  name: '24',  longName: 'Wakefield Avenue & Truman Parkway - Ashmont Station',     color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 18, corridors: ['Talbot Avenue', 'Geneva Avenue'] },
  { id: '26',  name: '26',  longName: 'Ashmont Station - Norfolk Street Loop',                   color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 20, corridors: ['Morton Street', 'Neponset'] },
  { id: '28',  name: '28',  longName: 'Mattapan Station - Ruggles Station',                      color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: true,  headwayMinutes: 20, corridors: ['Blue Hill Avenue'] },
  { id: '29',  name: '29',  longName: 'Mattapan Station - Jackson Square Station',               color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 22, corridors: ['Geneva Avenue'] },
  { id: '41',  name: '41',  longName: 'Centre Street & Eliot Street - JFK/UMass Station',        color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 20, corridors: ['Centre Street', 'Columbia Road'] },
  { id: '45',  name: '45',  longName: 'Franklin Park - Ruggles Station',                         color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 12, corridors: ['Washington Street', 'Four Corners'] },
  { id: '47',  name: '47',  longName: 'Central Square, Cambridge - Broadway Station',            color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 15, corridors: ['Central Square', 'Broadway Station'] },
  { id: '51',  name: '51',  longName: 'Reservoir Station - Forest Hills Station',                color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 22, corridors: ['Reservoir Station', 'Forest Hills Station'] },
  { id: '57',  name: '57',  longName: 'Watertown Yard - Kenmore Station',                        color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: true,  headwayMinutes: 12, corridors: ['Watertown Yard', 'Kenmore Station'] },
  { id: '65',  name: '65',  longName: 'Brighton Center - Ruggles Station',                       color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 18, corridors: ['Brighton Center', 'Ruggles Station'] },
  { id: '66',  name: '66',  longName: 'Harvard Square - Nubian Station',                         color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: true,  headwayMinutes: 25, corridors: ['Harvard Square', 'Nubian Station'] },
  { id: '68',  name: '68',  longName: 'Harvard Square - Kendall/MIT Station',                    color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 30, corridors: ['Harvard Square', 'Kendall/MIT'] },
  { id: '215', name: '215', longName: 'Quincy Center Station - Ashmont Station via West Quincy',  color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 30, corridors: ['West Quincy', 'Ashmont Station'] },
  { id: '217', name: '217', longName: 'Quincy Center Station - Ashmont Station',                 color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 30, corridors: ['Quincy Center', 'Ashmont Station'] },
  { id: '240', name: '240', longName: 'Avon Square - Ashmont Station',                           color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 35, corridors: ['Blue Hill Avenue', 'Ashmont Station'] },
];

export const ALL_LINES_BY_ROUTE: Record<string, TransitLine[]> = (() => {
  const out: Record<string, TransitLine[]> = {};
  for (const line of TRANSIT_LINES) {
    (out[line.routeId] ||= []).push(line);
  }
  return out;
})();

export function lineById(id: string): TransitLine | undefined {
  return TRANSIT_LINES.find((l) => l.id === id);
}

/** Every Dorchester stop across the lines, de-duplicated by station. */
export function allTransitStops(): Array<TransitStopRef & { lineId: string }> {
  const seen = new Map<string, TransitStopRef & { lineId: string }>();
  for (const line of TRANSIT_LINES) {
    for (const stop of line.dorchesterStops) {
      const key = `${stop.id}`;
      if (!seen.has(key)) seen.set(key, { ...stop, lineId: line.id });
    }
  }
  return [...seen.values()];
}
