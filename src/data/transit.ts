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
  /** GTFS wheelchair_boarding: 1 = step-free, 0 = unknown/not recorded. */
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

export const MBTA_GREEN = '#00953B';
export const MBTA_RED = '#DA291C';
export const MBTA_ORANGE = '#ED8B00';
export const MBTA_BLUE = '#0086C2';
export const MBTA_BUS_YELLOW = '#FFC72C';
export const MBTA_CR_PURPLE = '#80276C';

/**
 * Date the reference values below were last checked against mbta.com and the
 * v3 API. Shown in the UI, never presented as "live".
 */
export const TRANSIT_DATA_AS_OF = '2026-08-17';

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
      { id: 'place-jfk', name: 'JFK/UMass', lat: 42.320685, lng: -71.052391, accessible: true, connects: ['Fairmount Line', 'Commuter Rail', 'Bus 1, 8, 16, 41, 44, 46'] },
      { id: 'place-shmnl', name: 'Savin Hill', lat: 42.31129, lng: -71.053331, accessible: true },
      { id: 'place-fldcr', name: 'Fields Corner', lat: 42.300093, lng: -71.061667, accessible: true, connects: ['Bus 7, 9, 11, 16, 17, 18'] },
      { id: 'place-smmnl', name: 'Shawmut', lat: 42.29312, lng: -71.065738, accessible: false },
      { id: 'place-asmnl', name: 'Ashmont', lat: 42.284652, lng: -71.064489, accessible: true, connects: ['Mattapan Trolley', 'Bus 15, 16, 18, 23, 24, 26, 45, 215, 217, 220'] },
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
      [42.284652, -71.064489],
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
      { id: 'place-jfk', name: 'JFK/UMass', lat: 42.320685, lng: -71.052391, accessible: true, connects: ['Ashmont branch', 'Fairmount Line'] },
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
    name: 'Mattapan Trolley',
    color: MBTA_GREEN,
    textColor: '#FFFFFF',
    headwayMinutes: 11,
    peakHeadwayMinutes: 7,
    firstDeparts: '05:00',
    lastDeparts: '00:45',
    // The Mattapan line is charged at subway fare.
    fare: { mode: 'subway', CharlieCardUsd: 2.4, note: 'Same fare as the Red Line, free transfer at Ashmont.' },
    dorchesterStops: [
      { id: 'place-asmnl', name: 'Ashmont', lat: 42.284652, lng: -71.064489, accessible: true, connects: ['Red Line'] },
      { id: 'place-cptn', name: 'Capen Street', lat: 42.28362, lng: -71.07121, accessible: false },
      { id: 'place-miltc', name: 'Milton', lat: 42.27916, lng: -71.07506, accessible: false },
      { id: 'place-cendr', name: 'Central Avenue', lat: 42.27536, lng: -71.07836, accessible: false },
      { id: 'place-butlr', name: 'Butler', lat: 42.27172, lng: -71.08052, accessible: false },
      { id: 'place-valrd', name: 'Valley Road', lat: 42.27218, lng: -71.08791, accessible: false },
      { id: 'place-matt', name: 'Mattapan', lat: 42.26936, lng: -71.09161, accessible: true, connects: ['Bus 24, 26, 30, 31, 240'] },
    ],
    fallbackPath: [
      [42.284652, -71.064489],
      [42.28362, -71.07121],
      [42.27916, -71.07506],
      [42.27536, -71.07836],
      [42.27172, -71.08052],
      [42.27218, -71.08791],
      [42.26936, -71.09161],
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
      CharlieCardUsd: 7,
      note: 'Commuter rail fare depends on the zone. Fairmount Line rides inside Route 128 are charged a flat fare.',
    },
    dorchesterStops: [
      { id: 'place-uptns', name: 'Uphams Corner', lat: 42.31867, lng: -71.06933, accessible: true, connects: ['Bus 10, 23, 24, 26'] },
      { id: 'place-fcnrs', name: 'Four Corners/Geneva', lat: 42.30502, lng: -71.07702, accessible: true, connects: ['Bus 19, 23, 24'] },
      { id: 'place-talbn', name: 'Talbot Avenue', lat: 42.2929, lng: -71.0784, accessible: true, connects: ['Bus 23, 24, 26'] },
      { id: 'place-blhns', name: 'Blue Hills Avenue', lat: 42.28842, lng: -71.09494, accessible: true },
      { id: 'place-morton', name: 'Morton Street', lat: 42.27805, lng: -71.09432, accessible: true, connects: ['Bus 23, 24, 26'] },
    ],
    fallbackPath: [
      [42.32494, -71.06098],
      [42.31867, -71.06933],
      [42.31255, -71.07355],
      [42.30502, -71.07702],
      [42.2929, -71.0784],
      [42.28842, -71.09494],
      [42.27805, -71.09432],
    ],
  },
];

/**
 * Bus routes that pass through Dorchester. short_name is what the authority
 * paints on the box; long_name comes from the API when the request succeeds so
 * a rider is never shown a terminus that changed in a rebuild.
 */
export interface BusRouteRef {
  id: string;
  name: string;
  /**
   * Corridor description used only when the live `/routes` request has not
   * answered. Termini move with every service change, so the map prefers the
   * authority's own long_name and labels this text as a reference, not a
   * promise about where a bus turns around today.
   */
  longName: string;
  color: string;
  textColor: string;
  /** Frequent-service routes get a wider shield on the map. */
  frequent: boolean;
  headwayMinutes: number;
  corridors: string[];
}

export const DORCHESTER_BUS_ROUTES: BusRouteRef[] = [
  { id: '7',  name: '7',  longName: 'City Point - Otis Street via Andrew',            color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 15, corridors: ['Dorchester Ave', 'Andrew'] },
  { id: '9',  name: '9',  longName: 'Forest Hills - Davis via Harvard Square',        color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: true,  headwayMinutes: 12, corridors: ['Washington St'] },
  { id: '10', name: '10', longName: 'Dudley - Harvard via North Station',               color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 20, corridors: ['Massachusetts Ave', 'Uphams Corner'] },
  { id: '11', name: '11', longName: 'Heath Street - Harborside via Andrew',            color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 18, corridors: ['Dorchester Ave', 'Savin Hill'] },
  { id: '14', name: '14', longName: 'Fields Corner - Ruggles via Dorchester Avenue',    color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 20, corridors: ['Dorchester Ave', 'Albany St'] },
  { id: '16', name: '16', longName: 'Forest Hills - Andrew or Harbor Point via Columbia Rd', color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: true, headwayMinutes: 15, corridors: ['Columbia Rd', 'JFK/UMass'] },
  { id: '17', name: '17', longName: 'Fields Corner - Andrew',                          color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 15, corridors: ['Broadway', 'Andrew'] },
  { id: '18', name: '18', longName: 'Ashmont or JFK/UMass - Cummington Mall',          color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 18, corridors: ['Dorchester Ave', 'Savin Hill'] },
  { id: '23', name: '23', longName: 'Ruggles - Ashmont via Columbia Road',              color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 15, corridors: ['Blue Hill Ave', 'Talbot Ave'] },
  { id: '24', name: '24', longName: 'Dorchester Heights - Mattapan via Talbot Ave',     color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 18, corridors: ['Talbot Ave', 'Geneva Ave'] },
  { id: '26', name: '26', longName: 'Mt Hope St - Mattapan High School via Morton St',  color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 20, corridors: ['Adams St', 'Neponset'] },
  { id: '28', name: '28', longName: 'Mattapan - Ruggles via Blue Hill Avenue',          color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 20, corridors: ['Blue Hill Ave'] },
  { id: '29', name: '29', longName: 'Mattapan - Royal Sonesta via Dudley',              color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 22, corridors: ['Geneva Ave', 'Dudley'] },
  { id: '41', name: '41', longName: 'JFK/UMass - Centre Road via Everett Ave',          color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 20, corridors: ['Columbia Rd', 'Washington St'] },
  { id: '45', name: '45', longName: 'Ruggles - Franklin Park via Washington St',        color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: true,  headwayMinutes: 12, corridors: ['Washington St', 'Four Corners'] },
  { id: '47', name: '47', longName: 'Wickford Road - Ruggles via Washington St',        color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 15, corridors: ['Washington St', 'Codman Square'] },
  { id: '51', name: '51', longName: 'Jackson Square - Calumet St via Center St',        color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 22, corridors: ['Center St', 'Meeting House Hill'] },
  { id: '57', name: '57', longName: 'Washington St - Kenmore via Copley',               color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: true,  headwayMinutes: 12, corridors: ['Washington St'] },
  { id: '65', name: '65', longName: 'Andrew - John F Kennedy Park',                      color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 18, corridors: ['Dorchester Ave'] },
  { id: '66', name: '66', longName: 'Andrew - Quincy Center',                            color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 25, corridors: ['Squantum Rd'] },
  { id: '68', name: '68', longName: 'Quincy Center - Port Norfolk via Neponset Ave',     color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 30, corridors: ['Neponset Ave'] },
  { id: '215', name: '215', longName: 'Ashmont - Hyde Park Village',                     color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 30, corridors: ['Riverway'] },
  { id: '217', name: '217', longName: 'Ashmont - Forest Hills via Riverway',             color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 30, corridors: ['Sunnybank St'] },
  { id: '240', name: '240', longName: 'Mattapan - Mateo School via Fields Corner',       color: MBTA_BUS_YELLOW, textColor: '#000000', frequent: false, headwayMinutes: 35, corridors: ['Blue Hill Ave'] },
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
