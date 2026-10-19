/**
 * Live Boston weather for Dorchester — never typed in, never guessed.
 *
 * Primary source: the National Weather Service (api.weather.gov), the same
 * federal feed behind weather.gov. No key is required; the API asks only for
 * an identifying User-Agent. The request chain resolves the Dorchester grid
 * point at runtime (`/points/{lat},{lon}`), then reads the forecast,
 * hourly forecast, active alerts and the nearest station observation from
 * the URLs the NWS itself returns — so no grid coordinate, station id or
 * forecast value is hard-coded here. The only constants are the Dorchester
 * coordinates the query starts from, which are a place, not weather.
 *
 * If the NWS cannot be reached, Open-Meteo is read as a labelled backup
 * (`status: 'fallback'`). Alerts are *never* synthesized from the backup:
 * when the NWS is down `alertsStatus` is `'unavailable'` and the UI says so,
 * because claiming "no warnings" without having checked would be the most
 * dangerous sentence on the site.
 *
 * Everything in this module is environment-agnostic (server route and
 * browser both run it), and the parsing/tip functions are pure so they can
 * be unit-tested without the network.
 */

import { BOSTON_TZ } from './hours';

/** Fields Corner, Dorchester — the point every query resolves from. */
export const BOSTON_POINT = { lat: 42.3016, lon: -71.0676, label: 'Dorchester, Boston' } as const;

const NWS_BASE = 'https://api.weather.gov';
const USER_AGENT = 'DOR101/4.0 (https://github.com/Nikoxkx/Dorchester-101)';
const REQUEST_TIMEOUT_MS = 9_000;

export type ConditionKind =
  | 'clear'
  | 'partly'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'storm'
  | 'snow'
  | 'sleet'
  | 'ice'
  | 'wind'
  | 'unknown';

export interface WeatherAlert {
  id: string;
  /** e.g. "Winter Storm Warning" — the NWS event name, verbatim. */
  event: string;
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown';
  certainty: string | null;
  urgency: string | null;
  headline: string | null;
  description: string;
  instruction: string | null;
  senderName: string | null;
  areas: string | null;
  onset: string | null;
  ends: string | null;
  expires: string | null;
  url: string;
}

export interface CurrentConditions {
  observedAt: string;
  stationId: string;
  stationName: string;
  /** NWS text description ("Fair", "Light Rain") or the WMO label on fallback. */
  text: string;
  kind: ConditionKind;
  isDay: boolean;
  tempF: number;
  feelsLikeF: number;
  windChillF: number | null;
  heatIndexF: number | null;
  humidity: number | null;
  dewpointF: number | null;
  windMph: number | null;
  windGustMph: number | null;
  windDir: string | null;
  pressureInHg: number | null;
  visibilityMi: number | null;
}

export interface HourlyPeriod {
  start: string;
  end: string;
  isDay: boolean;
  tempF: number;
  feelsLikeF: number;
  kind: ConditionKind;
  shortForecast: string;
  precipChance: number | null;
  humidity: number | null;
  dewpointF: number | null;
  windMph: number | null;
  windText: string;
  windDir: string | null;
}

export interface DailyPeriod {
  name: string;
  start: string;
  end: string;
  isDay: boolean;
  tempF: number;
  kind: ConditionKind;
  shortForecast: string;
  detailedForecast: string;
  precipChance: number | null;
  windText: string;
  windDir: string | null;
}

export interface DaySummary {
  /** Local calendar date, YYYY-MM-DD in America/New_York. */
  date: string;
  highF: number | null;
  lowF: number | null;
  precipChanceMax: number | null;
  kind: ConditionKind;
  hasSnow: boolean;
  hasRain: boolean;
}

export interface WeatherPayload {
  status: 'live' | 'fallback';
  source: { name: 'nws' | 'open-meteo'; url: string; office: string | null; grid: string | null };
  point: { lat: number; lon: number; city: string; state: string; timeZone: string };
  /** When this payload was assembled (server or browser clock). */
  fetchedAt: string;
  /** When the forecast itself was issued by the publisher, when it says so. */
  issuedAt: string | null;
  current: CurrentConditions | null;
  hourly: HourlyPeriod[];
  daily: DailyPeriod[];
  days: DaySummary[];
  alerts: WeatherAlert[];
  alertsStatus: 'live' | 'unavailable';
  astronomy: { sunrise: string; sunset: string } | null;
}

/* ------------------------------------------------------------------ math -- */

export const cToF = (c: number): number => (c * 9) / 5 + 32;
export const fToC = (f: number): number => ((f - 32) * 5) / 9;
export const kmhToMph = (kmh: number): number => kmh * 0.621371;

/** NWS wind chill formula. Valid for T ≤ 50°F and wind > 3 mph; else null. */
export function windChillF(tempF: number, windMph: number | null): number | null {
  if (windMph === null || tempF > 50 || windMph <= 3) return null;
  const v = Math.pow(windMph, 0.16);
  return Math.round(35.74 + 0.6215 * tempF - 35.75 * v + 0.4275 * tempF * v);
}

/** Rothfusz heat-index regression used by the NWS. Below 80°F returns temp. */
export function heatIndexF(tempF: number, humidity: number | null): number | null {
  if (humidity === null || tempF < 80) return null;
  const t = tempF;
  const r = humidity;
  let hi =
    -42.379 + 2.04901523 * t + 10.14333127 * r - 0.22475541 * t * r - 0.00683783 * t * t -
    0.05481717 * r * r + 0.00122874 * t * t * r + 0.00085282 * t * r * r - 0.00000199 * t * t * r * r;
  if (r < 13 && t >= 80 && t <= 112) hi -= ((13 - r) / 4) * Math.sqrt((17 - Math.abs(t - 95)) / 17);
  if (r > 85 && t >= 80 && t <= 87) hi += ((r - 85) / 10) * ((87 - t) / 5);
  return Math.round(hi);
}

/** Feels-like: wind chill in the cold, heat index in the heat, air temp between. */
export function feelsLikeF(tempF: number, windMph: number | null, humidity: number | null): number {
  return windChillF(tempF, windMph) ?? heatIndexF(tempF, humidity) ?? Math.round(tempF);
}

/** "10 mph" → 10 · "5 to 15 mph" → 15 (the gusty end drives feels-like). */
export function parseWindMph(text: string | null | undefined): number | null {
  if (!text) return null;
  const nums = text.match(/\d+/g)?.map(Number) ?? [];
  return nums.length ? Math.max(...nums) : null;
}

const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
export function degreesToCompass(deg: number | null): string | null {
  if (deg === null || Number.isNaN(deg)) return null;
  return COMPASS[Math.round(((deg % 360) / 22.5)) % 16];
}

/* ------------------------------------------------------------- conditions -- */

/** Map an NWS short-forecast phrase (or icon code) to one display condition. */
export function conditionFromText(text: string | null | undefined, icon?: string | null): ConditionKind {
  const s = (text ?? '').toLowerCase();
  if (/freezing rain|ice storm|glaze/.test(s)) return 'ice';
  if (/thunder|t-storm/.test(s)) return 'storm';
  if (/snow|flurr|blizzard/.test(s)) return 'snow';
  if (/sleet|hail|ice pellets/.test(s)) return 'sleet';
  if (/rain|shower/.test(s)) return 'rain';
  if (/drizzle/.test(s)) return 'drizzle';
  if (/fog|mist|haze|smoke/.test(s)) return 'fog';
  if (/partly|mostly sunny|partly sunny|few clouds/.test(s)) return 'partly';
  if (/cloudy|overcast|mostly cloudy/.test(s)) return 'cloudy';
  if (/sunny|clear|fair/.test(s)) return 'clear';
  if (/windy|breezy|blustery/.test(s)) return 'wind';
  const code = (icon ?? '').split('/').pop()?.split(',')[0]?.split('?')[0] ?? '';
  const byCode: Record<string, ConditionKind> = {
    skc: 'clear', few: 'partly', sct: 'partly', bkn: 'cloudy', ovc: 'cloudy', fg: 'fog',
    rain: 'rain', shra: 'rain', tsra: 'storm', snow: 'snow', blizzard: 'snow', ip: 'sleet',
    fzra: 'ice', wind: 'wind', hot: 'clear', cold: 'clear',
  };
  return byCode[code] ?? 'unknown';
}

/** Severity first so a banner never leads with the minor alert. */
const SEVERITY_RANK: Record<WeatherAlert['severity'], number> = { Extreme: 0, Severe: 1, Moderate: 2, Minor: 3, Unknown: 4 };
export function sortAlerts(alerts: WeatherAlert[]): WeatherAlert[] {
  return [...alerts].sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
}

/* ------------------------------------------------------------ NWS parsing -- */

interface NwsPeriod {
  name?: string;
  startTime: string;
  endTime: string;
  isDaytime: boolean;
  temperature: number;
  temperatureUnit?: string;
  probabilityOfPrecipitation?: { value: number | null } | null;
  dewpoint?: { value: number | null } | null;
  relativeHumidity?: { value: number | null } | null;
  windSpeed?: string;
  windDirection?: string;
  icon?: string;
  shortForecast?: string;
  detailedForecast?: string;
}

function hourFromPeriod(p: NwsPeriod): HourlyPeriod {
  const tempF = p.temperatureUnit === 'C' ? Math.round(cToF(p.temperature)) : Math.round(p.temperature);
  const windMph = parseWindMph(p.windSpeed);
  const humidity = p.relativeHumidity?.value ?? null;
  return {
    start: p.startTime,
    end: p.endTime,
    isDay: p.isDaytime,
    tempF,
    feelsLikeF: feelsLikeF(tempF, windMph, humidity),
    kind: conditionFromText(p.shortForecast, p.icon),
    shortForecast: p.shortForecast ?? '',
    precipChance: p.probabilityOfPrecipitation?.value ?? null,
    humidity,
    dewpointF: p.dewpoint?.value === null || p.dewpoint?.value === undefined ? null : Math.round(cToF(p.dewpoint.value)),
    windMph,
    windText: p.windSpeed ?? '',
    windDir: p.windDirection ?? null,
  };
}

function dayFromPeriod(p: NwsPeriod): DailyPeriod {
  return {
    name: p.name ?? '',
    start: p.startTime,
    end: p.endTime,
    isDay: p.isDaytime,
    tempF: p.temperatureUnit === 'C' ? Math.round(cToF(p.temperature)) : Math.round(p.temperature),
    kind: conditionFromText(p.shortForecast, p.icon),
    shortForecast: p.shortForecast ?? '',
    detailedForecast: p.detailedForecast ?? '',
    precipChance: p.probabilityOfPrecipitation?.value ?? null,
    windText: p.windSpeed ?? '',
    windDir: p.windDirection ?? null,
  };
}

export function parseAlerts(doc: unknown): WeatherAlert[] {
  const features = (doc as { features?: unknown[] })?.features ?? [];
  const out: WeatherAlert[] = [];
  for (const f of features as Array<{ id?: string; properties?: Record<string, unknown> }>) {
    const p = f?.properties;
    if (!p || p.status !== 'Actual') continue;
    if (p.messageType === 'Cancel') continue;
    const sev = String(p.severity ?? 'Unknown');
    out.push({
      id: String(p.id ?? f.id ?? `${p.event}-${p.onset}`),
      event: String(p.event ?? 'Weather alert'),
      severity: (['Extreme', 'Severe', 'Moderate', 'Minor'].includes(sev) ? sev : 'Unknown') as WeatherAlert['severity'],
      certainty: (p.certainty as string) ?? null,
      urgency: (p.urgency as string) ?? null,
      headline: (p.headline as string) ?? null,
      description: String(p.description ?? ''),
      instruction: (p.instruction as string) ?? null,
      senderName: (p.senderName as string) ?? null,
      areas: (p.areaDesc as string) ?? null,
      onset: (p.onset as string) ?? null,
      ends: (p.ends as string) ?? null,
      expires: (p.expires as string) ?? null,
      url: String(p['@id'] ?? f.id ?? 'https://www.weather.gov/'),
    });
  }
  return sortAlerts(out);
}

export function parseObservation(doc: unknown, stationId: string, stationName: string): CurrentConditions | null {
  const p = (doc as { properties?: Record<string, { value: number | null } | string | null> })?.properties;
  if (!p) return null;
  const val = (k: string): number | null => {
    const v = (p[k] as { value: number | null } | undefined)?.value;
    return typeof v === 'number' && Number.isFinite(v) ? v : null;
  };
  const tempC = val('temperature');
  if (tempC === null) return null;
  const tempF = Math.round(cToF(tempC));
  const windKmh = val('windSpeed');
  const windMph = windKmh === null ? null : Math.round(kmhToMph(windKmh));
  const gustKmh = val('windGust');
  const humidityRaw = val('relativeHumidity');
  const humidity = humidityRaw === null ? null : Math.round(humidityRaw);
  // The station itself reports wind chill / heat index when they apply; use
  // the instrument's own numbers first and only compute when it stays silent.
  const chillC = val('windChill');
  const heatC = val('heatIndex');
  const windChill = chillC !== null ? Math.round(cToF(chillC)) : windChillF(tempF, windMph);
  const heatIndex = heatC !== null ? Math.round(cToF(heatC)) : heatIndexF(tempF, humidity);
  const pressurePa = val('barometricPressure');
  const visibilityM = val('visibility');
  const dewC = val('dewpoint');
  const icon = typeof p.icon === 'string' ? p.icon : null;
  return {
    observedAt: String(p.timestamp ?? new Date().toISOString()),
    stationId,
    stationName,
    text: String(p.textDescription ?? ''),
    kind: conditionFromText(typeof p.textDescription === 'string' ? p.textDescription : null, icon),
    isDay: !(icon ?? '').includes('/night/'),
    tempF,
    feelsLikeF: windChill ?? heatIndex ?? tempF,
    windChillF: windChill,
    heatIndexF: heatIndex,
    humidity,
    dewpointF: dewC === null ? null : Math.round(cToF(dewC)),
    windMph,
    windGustMph: gustKmh === null ? null : Math.round(kmhToMph(gustKmh)),
    windDir: degreesToCompass(val('windDirection')),
    pressureInHg: pressurePa === null ? null : Math.round((pressurePa / 3386.39) * 100) / 100,
    visibilityMi: visibilityM === null ? null : Math.round((visibilityM / 1609.344) * 10) / 10,
  };
}

/* ------------------------------------------------------------ day shaping -- */

const KIND_SEVERITY: Record<ConditionKind, number> = {
  storm: 10, ice: 9, snow: 8, sleet: 7, rain: 6, drizzle: 5, fog: 4, wind: 3, cloudy: 2, partly: 1, clear: 0, unknown: -1,
};

const dateKeyFmt = new Intl.DateTimeFormat('en-CA', { timeZone: BOSTON_TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
export function localDateKey(iso: string): string {
  return dateKeyFmt.format(new Date(iso));
}

/** Seven day cards, derived from the hourly series and the day/night periods. */
export function buildDaySummaries(hourly: HourlyPeriod[], daily: DailyPeriod[]): DaySummary[] {
  const byDate = new Map<string, DaySummary & { worst: number }>();
  const ensure = (date: string) => {
    let d = byDate.get(date);
    if (!d) {
      d = { date, highF: null, lowF: null, precipChanceMax: null, kind: 'unknown', hasSnow: false, hasRain: false, worst: -1 };
      byDate.set(date, d);
    }
    return d;
  };
  for (const h of hourly) {
    const d = ensure(localDateKey(h.start));
    d.highF = d.highF === null ? h.tempF : Math.max(d.highF, h.tempF);
    d.lowF = d.lowF === null ? h.tempF : Math.min(d.lowF, h.tempF);
    if (h.precipChance !== null) d.precipChanceMax = d.precipChanceMax === null ? h.precipChance : Math.max(d.precipChanceMax, h.precipChance);
    if (KIND_SEVERITY[h.kind] > d.worst) { d.worst = KIND_SEVERITY[h.kind]; d.kind = h.kind; }
    if (h.kind === 'snow' || h.kind === 'sleet' || h.kind === 'ice') d.hasSnow = true;
    if (h.kind === 'rain' || h.kind === 'drizzle' || h.kind === 'storm') d.hasRain = true;
  }
  for (const p of daily) {
    const d = ensure(localDateKey(p.start));
    if (p.isDay) d.highF = d.highF === null ? p.tempF : Math.max(d.highF, p.tempF);
    else d.lowF = d.lowF === null ? p.tempF : Math.min(d.lowF, p.tempF);
    if (p.precipChance !== null) d.precipChanceMax = d.precipChanceMax === null ? p.precipChance : Math.max(d.precipChanceMax, p.precipChance);
    if (KIND_SEVERITY[p.kind] > d.worst) { d.worst = KIND_SEVERITY[p.kind]; d.kind = p.kind; }
    if (p.kind === 'snow' || p.kind === 'sleet' || p.kind === 'ice') d.hasSnow = true;
    if (p.kind === 'rain' || p.kind === 'drizzle' || p.kind === 'storm') d.hasRain = true;
  }
  return [...byDate.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 7)
    .map(({ worst: _worst, ...d }) => d);
}

/* --------------------------------------------------------------- fetching -- */

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/geo+json, application/json' },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.json();
}

interface PointInfo {
  forecast: string;
  forecastHourly: string;
  observationStations: string;
  grid: string;
  office: string;
  city: string;
  state: string;
  timeZone: string;
  sunrise: string | null;
  sunset: string | null;
}

let pointCache: { at: number; info: PointInfo } | null = null;

async function resolvePoint(): Promise<PointInfo> {
  if (pointCache && Date.now() - pointCache.at < 24 * 3600_000) return pointCache.info;
  const doc = (await fetchJson(`${NWS_BASE}/points/${BOSTON_POINT.lat},${BOSTON_POINT.lon}`)) as {
    properties: Record<string, unknown>;
  };
  const p = doc.properties;
  const rel = (p.relativeLocation as { properties?: { city?: string; state?: string } })?.properties ?? {};
  const astro = (p.astronomicalData as { sunrise?: string; sunset?: string }) ?? {};
  const info: PointInfo = {
    forecast: String(p.forecast),
    forecastHourly: String(p.forecastHourly),
    observationStations: String(p.observationStations),
    grid: `${p.gridId} ${p.gridX},${p.gridY}`,
    office: String(p.cwa ?? ''),
    city: rel.city ?? 'Boston',
    state: rel.state ?? 'MA',
    timeZone: String(p.timeZone ?? BOSTON_TZ),
    sunrise: astro.sunrise ?? null,
    sunset: astro.sunset ?? null,
  };
  pointCache = { at: Date.now(), info };
  return info;
}

async function latestObservation(stationsUrl: string): Promise<CurrentConditions | null> {
  const list = (await fetchJson(stationsUrl)) as {
    features?: Array<{ id: string; properties?: { stationIdentifier?: string; name?: string } }>;
  };
  const stations = (list.features ?? []).slice(0, 3);
  for (const s of stations) {
    try {
      const obs = await fetchJson(`${s.id}/observations/latest`);
      const parsed = parseObservation(obs, s.properties?.stationIdentifier ?? s.id, s.properties?.name ?? 'Boston');
      if (parsed) return parsed;
    } catch {
      /* try the next nearest station */
    }
  }
  return null;
}

async function fromNws(): Promise<WeatherPayload> {
  const point = await resolvePoint();
  const [forecastDoc, hourlyDoc, alertsDoc, current] = await Promise.all([
    fetchJson(point.forecast),
    fetchJson(point.forecastHourly),
    fetchJson(`${NWS_BASE}/alerts/active?point=${BOSTON_POINT.lat},${BOSTON_POINT.lon}`),
    latestObservation(point.observationStations).catch(() => null),
  ]);
  const dailyPeriods = ((forecastDoc as { properties?: { periods?: NwsPeriod[] } }).properties?.periods ?? []).map(dayFromPeriod);
  const hourlyPeriods = ((hourlyDoc as { properties?: { periods?: NwsPeriod[] } }).properties?.periods ?? []).map(hourFromPeriod);
  if (!dailyPeriods.length && !hourlyPeriods.length) throw new Error('NWS returned no periods');
  const issuedAt =
    (forecastDoc as { properties?: { generatedAt?: string; updateTime?: string } }).properties?.generatedAt ??
    (forecastDoc as { properties?: { updateTime?: string } }).properties?.updateTime ??
    null;
  return {
    status: 'live',
    source: { name: 'nws', url: 'https://www.weather.gov/', office: point.office || null, grid: point.grid },
    point: { lat: BOSTON_POINT.lat, lon: BOSTON_POINT.lon, city: point.city, state: point.state, timeZone: point.timeZone },
    fetchedAt: new Date().toISOString(),
    issuedAt,
    current,
    hourly: hourlyPeriods,
    daily: dailyPeriods,
    days: buildDaySummaries(hourlyPeriods, dailyPeriods),
    alerts: parseAlerts(alertsDoc),
    alertsStatus: 'live',
    astronomy: point.sunrise && point.sunset ? { sunrise: point.sunrise, sunset: point.sunset } : null,
  };
}

/* ------------------------------------------------- Open-Meteo backup path -- */

function wmoKind(code: number): ConditionKind {
  if (code === 0) return 'clear';
  if (code <= 2) return 'partly';
  if (code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 57) return code >= 56 ? 'ice' : 'drizzle';
  if (code >= 61 && code <= 67) return code >= 66 ? 'ice' : 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 82) return 'rain';
  if (code === 85 || code === 86) return 'snow';
  if (code >= 95) return 'storm';
  return 'unknown';
}

async function fromOpenMeteo(): Promise<WeatherPayload> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${BOSTON_POINT.lat}&longitude=${BOSTON_POINT.lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m,surface_pressure,is_day` +
    `&hourly=temperature_2m,precipitation_probability,weather_code,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,is_day` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,sunrise,sunset` +
    `&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FNew_York&forecast_days=7`;
  const doc = (await fetchJson(url)) as {
    current?: Record<string, number | string>;
    hourly?: Record<string, Array<number | string | null>>;
    daily?: Record<string, Array<number | string | null>>;
  };
  const num = (v: number | string | null | undefined): number | null =>
    typeof v === 'number' && Number.isFinite(v) ? v : null;
  const cur = doc.current ?? {};
  const tempF = num(cur.temperature_2m as number);
  const wind = num(cur.wind_speed_10m as number);
  const humidity = num(cur.relative_humidity_2m as number);
  const current: CurrentConditions | null =
    tempF === null
      ? null
      : {
          observedAt: String(cur.time ?? new Date().toISOString()),
          stationId: 'open-meteo',
          stationName: 'Open-Meteo grid point',
          text: '',
          kind: wmoKind(Number(cur.weather_code ?? -1)),
          isDay: Number(cur.is_day ?? 1) === 1,
          tempF: Math.round(tempF),
          feelsLikeF: Math.round(num(cur.apparent_temperature as number) ?? feelsLikeF(tempF, wind, humidity)),
          windChillF: windChillF(tempF, wind),
          heatIndexF: heatIndexF(tempF, humidity),
          humidity: humidity === null ? null : Math.round(humidity),
          dewpointF: null,
          windMph: wind === null ? null : Math.round(wind),
          windGustMph: num(cur.wind_gusts_10m as number) === null ? null : Math.round(num(cur.wind_gusts_10m as number)!),
          windDir: degreesToCompass(num(cur.wind_direction_10m as number)),
          pressureInHg: num(cur.surface_pressure as number) === null ? null : Math.round(num(cur.surface_pressure as number)! * 0.02953 * 100) / 100,
          visibilityMi: null,
        };
  const h = doc.hourly ?? {};
  const times = (h.time ?? []) as string[];
  const hourly: HourlyPeriod[] = times.map((t, i) => {
    const temp = Math.round(num(h.temperature_2m?.[i] as number) ?? 0);
    const w = num(h.wind_speed_10m?.[i] as number);
    const hum = num(h.relative_humidity_2m?.[i] as number);
    const start = new Date(t).toISOString();
    return {
      start,
      end: new Date(new Date(t).getTime() + 3600_000).toISOString(),
      isDay: Number(h.is_day?.[i] ?? 1) === 1,
      tempF: temp,
      feelsLikeF: feelsLikeF(temp, w, hum),
      kind: wmoKind(Number(h.weather_code?.[i] ?? -1)),
      shortForecast: '',
      precipChance: num(h.precipitation_probability?.[i] as number),
      humidity: hum === null ? null : Math.round(hum),
      dewpointF: null,
      windMph: w === null ? null : Math.round(w),
      windText: w === null ? '' : `${Math.round(w)} mph`,
      windDir: null,
    };
  });
  const d = doc.daily ?? {};
  const dTimes = (d.time ?? []) as string[];
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: BOSTON_TZ, weekday: 'long' });
  const daily: DailyPeriod[] = dTimes.flatMap((t, i) => {
    const high = num(d.temperature_2m_max?.[i] as number);
    const low = num(d.temperature_2m_min?.[i] as number);
    const kind = wmoKind(Number(d.weather_code?.[i] ?? -1));
    const startIso = new Date(`${t}T12:00:00`).toISOString();
    const name = weekday.format(new Date(startIso));
    const periods: DailyPeriod[] = [];
    if (high !== null)
      periods.push({ name, start: startIso, end: startIso, isDay: true, tempF: Math.round(high), kind, shortForecast: '', detailedForecast: '', precipChance: num(d.precipitation_probability_max?.[i] as number), windText: '', windDir: null });
    if (low !== null)
      periods.push({ name: `${name} Night`, start: startIso, end: startIso, isDay: false, tempF: Math.round(low), kind, shortForecast: '', detailedForecast: '', precipChance: num(d.precipitation_probability_max?.[i] as number), windText: '', windDir: null });
    return periods;
  });
  const sunrise = (d.sunrise?.[0] as string) ?? null;
  const sunset = (d.sunset?.[0] as string) ?? null;
  return {
    status: 'fallback',
    source: { name: 'open-meteo', url: 'https://open-meteo.com/', office: null, grid: null },
    point: { lat: BOSTON_POINT.lat, lon: BOSTON_POINT.lon, city: 'Boston', state: 'MA', timeZone: BOSTON_TZ },
    fetchedAt: new Date().toISOString(),
    issuedAt: null,
    current,
    hourly,
    daily,
    days: buildDaySummaries(hourly, daily),
    alerts: [],
    alertsStatus: 'unavailable',
    astronomy: sunrise && sunset ? { sunrise: new Date(sunrise).toISOString(), sunset: new Date(sunset).toISOString() } : null,
  };
}

/** NWS first; Open-Meteo only as a labelled backup; throw if both are down. */
export async function fetchBostonWeather(): Promise<WeatherPayload> {
  try {
    return await fromNws();
  } catch (nwsError) {
    try {
      return await fromOpenMeteo();
    } catch {
      throw nwsError;
    }
  }
}

/* ------------------------------------------------------------- style tips -- */

export type TipKind =
  | 'heavyCoat' | 'coat' | 'lightJacket' | 'layers' | 'hatGloves' | 'windbreaker'
  | 'umbrella' | 'rainShell' | 'waterproofShoes' | 'snowBoots' | 'heatLight' | 'sunHat'
  | 'eveningLayer' | 'morningChill' | 'coldWeek' | 'heatWave' | 'wetWeek' | 'snowWeek'
  | 'swingWeek' | 'mild' | 'storm' | 'freezingRain' | 'darkReflective' | 'humid';

export interface StyleTip {
  kind: TipKind;
  scope: 'now' | 'today' | 'tonight' | 'week';
  priority: number;
  values: { tempF?: number; highF?: number; lowF?: number; chance?: number; gustMph?: number; timeIso?: string };
}

const SCOPE_ORDER = { now: 0, today: 1, tonight: 2, week: 3 } as const;

function hourInBoston(d: Date): number {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone: BOSTON_TZ, hour: 'numeric', hour12: false }).format(d)) % 24;
}

/**
 * What-to-wear advice derived from the live payload at read time: the coat
 * ladder runs on feels-like (wind chill / heat index), not air temperature,
 * because 38°F in a harbor wind is a different outfit than 38°F calm. Week
 * tips look at the pattern across the seven day summaries, so "cold all
 * week" is a statement about at least four cold days, not one cold morning.
 */
export function buildStyleTips(payload: WeatherPayload, now = new Date()): StyleTip[] {
  const tips: StyleTip[] = [];
  const push = (kind: TipKind, scope: StyleTip['scope'], priority: number, values: StyleTip['values'] = {}) =>
    tips.push({ kind, scope, priority, values });

  const nowMs = now.getTime();
  const upcoming = payload.hourly.filter((h) => new Date(h.end).getTime() > nowMs);
  const next12 = upcoming.slice(0, 12);
  const next24 = upcoming.slice(0, 24);
  const today = payload.days[0];
  const feelsNow = payload.current?.feelsLikeF ?? upcoming[0]?.feelsLikeF ?? today?.highF ?? 55;
  const tempNow = payload.current?.tempF ?? upcoming[0]?.tempF ?? feelsNow;
  const high = today?.highF ?? Math.max(...next24.map((h) => h.tempF), tempNow);
  const low = today?.lowF ?? Math.min(...next24.map((h) => h.tempF), tempNow);

  const severeAlert = payload.alerts.some(
    (a) => a.severity === 'Extreme' || a.severity === 'Severe' || /tornado|hurricane|thunderstorm|blizzard|winter storm|ice storm|flood/i.test(a.event)
  );
  if (severeAlert) push('storm', 'now', 100);
  if (next12.some((h) => h.kind === 'ice')) push('freezingRain', 'today', 95);

  // The coat ladder, on feels-like.
  if (feelsNow <= 25) push('heavyCoat', 'now', 90, { tempF: feelsNow });
  else if (feelsNow <= 45) push('coat', 'now', 90, { tempF: feelsNow });
  else if (feelsNow <= 62) {
    if (high - low >= 14) push('layers', 'today', 88, { lowF: low, highF: high });
    else push('lightJacket', 'now', 88, { tempF: feelsNow });
  } else if (feelsNow >= 79) push('heatLight', 'now', 90, { tempF: feelsNow });
  else push('mild', 'today', 60, { tempF: high });

  const windNow = payload.current?.windMph ?? upcoming[0]?.windMph ?? 0;
  if (feelsNow > 25 && feelsNow <= 35 && windNow >= 10) push('hatGloves', 'today', 85, { tempF: feelsNow });

  const gustMax = Math.max(
    payload.current?.windGustMph ?? 0,
    ...next12.map((h) => h.windMph ?? 0)
  );
  if (gustMax >= 28) push('windbreaker', 'today', 80, { gustMph: gustMax });

  const precip12 = Math.max(0, ...next12.map((h) => h.precipChance ?? 0));
  if (precip12 >= 70) push('rainShell', 'today', 86, { chance: precip12 });
  else if (precip12 >= 40) push('umbrella', 'today', 84, { chance: precip12 });

  if (next24.some((h) => h.kind === 'snow' || h.kind === 'sleet')) push('snowBoots', 'today', 82);
  else if (precip12 >= 50) push('waterproofShoes', 'today', 70);

  const kindNow = payload.current?.kind ?? upcoming[0]?.kind;
  if (high >= 78 && (kindNow === 'clear' || kindNow === 'partly') && hourInBoston(now) < 17) push('sunHat', 'today', 65);
  if ((payload.current?.humidity ?? 0) >= 75 && tempNow >= 72) push('humid', 'today', 55);

  // Time-of-day: a cold start that warms up wants different advice at 7 AM
  // than the same forecast read at noon.
  const hour = hourInBoston(now);
  const morning = upcoming.filter((h) => {
    const hh = hourInBoston(new Date(h.start));
    return hh >= 5 && hh <= 10 && new Date(h.start).getTime() - nowMs < 6 * 3600_000;
  });
  const morningFeels = morning.length ? Math.min(...morning.map((h) => h.feelsLikeF)) : null;
  if (hour < 10 && morningFeels !== null && morningFeels <= 40 && high - morningFeels >= 15) {
    push('morningChill', 'today', 87, { tempF: morningFeels });
  }

  const tonightHours = upcoming.filter((h) => new Date(h.start).getTime() - nowMs <= 16 * 3600_000);
  const tonightFeels = tonightHours.length ? Math.min(...tonightHours.map((h) => h.feelsLikeF)) : low;
  if (tonightFeels <= feelsNow - 12 || tonightFeels <= 40) {
    if (!(feelsNow <= 45)) push('eveningLayer', 'tonight', 83, { tempF: tonightFeels });
  }

  if (payload.astronomy?.sunset) {
    const sunset = new Date(payload.astronomy.sunset);
    const diffH = (nowMs - sunset.getTime()) / 3600_000;
    if (hourInBoston(sunset) <= 18 && diffH > -3) push('darkReflective', 'tonight', 58, { timeIso: payload.astronomy.sunset });
  }

  // The week's pattern, from the day summaries.
  const week = payload.days.slice(0, 6).filter((d) => d.highF !== null || d.lowF !== null);
  if (week.length >= 4) {
    const coldDays = week.filter((d) => (d.highF ?? 99) <= 42).length;
    const bitterNights = week.filter((d) => (d.lowF ?? 99) <= 25).length;
    const hotDays = week.filter((d) => (d.highF ?? 0) >= 88).length;
    const snowDays = week.filter((d) => d.hasSnow).length;
    const wetDays = week.filter((d) => (d.precipChanceMax ?? 0) >= 60).length;
    const swings = week.filter((d) => d.highF !== null && d.lowF !== null).map((d) => d.highF! - d.lowF!);
    const avgSwing = swings.length ? swings.reduce((a, b) => a + b, 0) / swings.length : 0;
    const weekTips: StyleTip[] = [];
    if (coldDays >= 4 || bitterNights >= 3) {
      const highs = week.map((d) => d.highF).filter((v): v is number => v !== null);
      weekTips.push({ kind: 'coldWeek', scope: 'week', priority: 92, values: { tempF: Math.round(highs.reduce((a, b) => a + b, 0) / Math.max(1, highs.length)) } });
    }
    if (hotDays >= 3) weekTips.push({ kind: 'heatWave', scope: 'week', priority: 91, values: { tempF: Math.max(...week.map((d) => d.highF ?? 0)) } });
    if (snowDays >= 2) weekTips.push({ kind: 'snowWeek', scope: 'week', priority: 89, values: {} });
    if (wetDays >= 3) weekTips.push({ kind: 'wetWeek', scope: 'week', priority: 78, values: {} });
    if (avgSwing >= 24) weekTips.push({ kind: 'swingWeek', scope: 'week', priority: 72, values: {} });
    tips.push(...weekTips.sort((a, b) => b.priority - a.priority).slice(0, 2));
  }

  const seen = new Set<TipKind>();
  return tips
    .filter((t) => (seen.has(t.kind) ? false : (seen.add(t.kind), true)))
    .sort((a, b) => SCOPE_ORDER[a.scope] - SCOPE_ORDER[b.scope] || b.priority - a.priority)
    .slice(0, 6);
}

/** True when the live weather says a warm coat is urgent — drives CTAs. */
export type DayPhase = 'morning' | 'midday' | 'evening' | 'night';

/**
 * Which part of the day the reader is standing in, Boston time. Real
 * sunrise/sunset win when the payload carries them; otherwise the Boston
 * wall clock decides. This is what lets one advice surface show the
 * morning's tip in the morning and tonight's after dark.
 */
export function dayPhase(payload: WeatherPayload, now = new Date()): DayPhase {
  const hour = hourInBoston(now);
  const sunrise = payload.astronomy?.sunrise ? new Date(payload.astronomy.sunrise).getTime() : null;
  const sunset = payload.astronomy?.sunset ? new Date(payload.astronomy.sunset).getTime() : null;
  const t = now.getTime();
  if (sunrise && sunset && !Number.isNaN(sunrise) && !Number.isNaN(sunset)) {
    if (t < sunrise - 30 * 60_000 || t > sunset + 45 * 60_000) return 'night';
    if (t < sunrise + 4.5 * 3600_000) return 'morning';
    if (t > sunset - 3.5 * 3600_000) return 'evening';
    return 'midday';
  }
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 15) return 'midday';
  if (hour >= 15 && hour < 21) return 'evening';
  return 'night';
}

/**
 * The single most useful tip *for this moment*: safety alerts first, then
 * the tip written for the reader's part of the day, at the temperature it
 * actually is right now (the underlying tips already run on feels-like).
 * One tip, shown one at a time — the full set stays one tap away on
 * /weather.
 */
export function pickSpotlightTip(payload: WeatherPayload, now = new Date()): StyleTip | null {
  const tips = buildStyleTips(payload, now);
  if (!tips.length) return null;
  const safety = tips.find((tip) => tip.kind === 'storm' || tip.kind === 'freezingRain');
  if (safety) return safety;

  const phase = dayPhase(payload, now);
  const byKind = (kinds: TipKind[]) => tips.find((tip) => kinds.includes(tip.kind));
  const byScope = (scopes: StyleTip['scope'][]) => tips.find((tip) => scopes.includes(tip.scope));

  switch (phase) {
    case 'morning':
      return byKind(['morningChill', 'heavyCoat', 'coat']) ?? byScope(['now', 'today']) ?? tips[0];
    case 'midday':
      return byScope(['now']) ?? byKind(['layers', 'rainShell', 'umbrella']) ?? byScope(['today']) ?? tips[0];
    case 'evening':
      return byKind(['eveningLayer', 'darkReflective']) ?? byScope(['tonight', 'now']) ?? tips[0];
    case 'night':
      return byScope(['tonight']) ?? byKind(['heavyCoat', 'coat', 'coldWeek']) ?? byScope(['now']) ?? tips[0];
  }
}

export function coldSignal(payload: WeatherPayload, now = new Date()): boolean {
  const feels = payload.current?.feelsLikeF ?? payload.hourly.find((h) => new Date(h.end).getTime() > now.getTime())?.feelsLikeF;
  if (feels !== undefined && feels <= 38) return true;
  if ((payload.days[0]?.lowF ?? 99) <= 32) return true;
  return buildStyleTips(payload, now).some((t) => t.kind === 'coldWeek' || t.kind === 'heavyCoat');
}
