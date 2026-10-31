/** Reference connections, not live service. Riders are directed to MBTA for
 * current schedules, elevator status and transfer rules. */
export type Connection = { type: 'bus'; routes: string } | { type: 'rail' | 'red' | 'mattapan' };
export interface GuideStation { name: string; connections: readonly Connection[] }

export const RED_STATIONS: readonly GuideStation[] = [
  { name: 'JFK/UMass', connections: [{ type: 'rail' }, { type: 'bus', routes: '8, 16, 41' }] },
  { name: 'Savin Hill', connections: [] },
  { name: 'Fields Corner', connections: [{ type: 'bus', routes: '15, 17, 18, 19, 201, 202, 210' }] },
  { name: 'Shawmut', connections: [] },
  { name: 'Ashmont', connections: [{ type: 'mattapan' }, { type: 'bus', routes: '15, 18, 21, 22, 23, 24, 26, 215, 217, 240' }] },
];
export const MATTAPAN_STATIONS: readonly GuideStation[] = [
  { name: 'Ashmont', connections: [{ type: 'red' }] },
  { name: 'Cedar Grove', connections: [] }, { name: 'Butler', connections: [] },
  { name: 'Milton', connections: [] }, { name: 'Central Avenue', connections: [] },
  { name: 'Valley Road', connections: [] }, { name: 'Capen Street', connections: [] },
  { name: 'Mattapan', connections: [{ type: 'bus', routes: '15, 24, 28, 29, 30, 31, 33, 245, 716' }] },
];
export const FAIRMOUNT_STATIONS: readonly GuideStation[] = [
  { name: 'Uphams Corner', connections: [{ type: 'bus', routes: '15, 41' }] },
  { name: 'Four Corners/Geneva', connections: [{ type: 'bus', routes: '19' }] },
  { name: 'Talbot Avenue', connections: [{ type: 'bus', routes: '22 (Talbot Avenue)' }] },
  { name: 'Morton Street', connections: [{ type: 'bus', routes: '21, 26' }] },
  { name: 'Blue Hill Avenue', connections: [] },
];

/** Selected routes with structured names so descriptive words can be translated.
 * Compare with the shared route reference when updating its English names. */
export const GUIDE_BUS_ROUTES: readonly {
  id: string; from: string; to: string; alternate?: string; via?: string; loop?: boolean;
}[] = [
  { id: '16', from: 'Forest Hills', to: 'Andrew', alternate: 'Harbor Point' },
  { id: '17', from: 'Fields Corner', to: 'Andrew' },
  { id: '18', from: 'Ashmont', to: 'Andrew' },
  { id: '23', from: 'Ashmont', to: 'Ruggles', via: 'Washington Street' },
  { id: '26', from: 'Ashmont', to: 'Norfolk Street', loop: true },
  { id: '28', from: 'Mattapan', to: 'Ruggles' },
];

/** A sync marker, not expert approval of the translations. */
export const TRANSIT_GUIDE_SOURCE_DIGEST = 'd9e898de0d6a86dd2a76f19066550ba80044d0ce8aeb3ac99a8dbec8239f4864';
