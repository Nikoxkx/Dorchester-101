/**
 * The weather engine's pure parts: feels-like arithmetic against the NWS's
 * own reference values, condition mapping, alert parsing and ordering, day
 * shaping in Boston time, and the what-to-wear rules under citations a
 * resident will actually meet (a cold week, a rainy warm day, a mild
 * afternoon that turns cold at night). Nothing here touches the network.
 */
import { describe, expect, it } from 'vitest';
import {
  buildDaySummaries,
  buildStyleTips,
  coldSignal,
  dayPhase,
  pickSpotlightTip,
  conditionFromText,
  degreesToCompass,
  feelsLikeF,
  heatIndexF,
  localDateKey,
  parseAlerts,
  parseObservation,
  parseWindMph,
  windChillF,
  type DaySummary,
  type HourlyPeriod,
  type WeatherPayload,
} from '@/lib/weather';

describe('feels-like math', () => {
  it('wind chill matches the NWS chart (30°F at 20 mph feels like 17°F)', () => {
    expect(windChillF(30, 20)).toBe(17);
    expect(windChillF(0, 15)).toBe(-19);
  });
  it('wind chill does not apply above 50°F or in a calm', () => {
    expect(windChillF(55, 25)).toBeNull();
    expect(windChillF(30, 2)).toBeNull();
    expect(windChillF(30, null)).toBeNull();
  });
  it('heat index matches the Rothfusz regression (90°F, 60% ≈ 100°F)', () => {
    const hi = heatIndexF(90, 60);
    expect(hi).not.toBeNull();
    expect(Math.abs((hi as number) - 100)).toBeLessThanOrEqual(2);
    expect(heatIndexF(75, 60)).toBeNull();
  });
  it('feels-like picks chill in the cold, index in the heat, air temp between', () => {
    expect(feelsLikeF(30, 20, 40)).toBe(17);
    expect(feelsLikeF(65, 5, 50)).toBe(65);
    expect(feelsLikeF(90, 5, 60)).toBeGreaterThan(90);
  });
  it('parses NWS wind text, taking the gusty end of a range', () => {
    expect(parseWindMph('10 mph')).toBe(10);
    expect(parseWindMph('5 to 15 mph')).toBe(15);
    expect(parseWindMph('Calm')).toBeNull();
    expect(parseWindMph(null)).toBeNull();
  });
  it('compass conversion', () => {
    expect(degreesToCompass(0)).toBe('N');
    expect(degreesToCompass(90)).toBe('E');
    expect(degreesToCompass(225)).toBe('SW');
    expect(degreesToCompass(null)).toBeNull();
  });
});

describe('condition mapping', () => {
  it('maps NWS phrases, most specific first', () => {
    expect(conditionFromText('Sunny')).toBe('clear');
    expect(conditionFromText('Partly Sunny')).toBe('partly');
    expect(conditionFromText('Mostly Cloudy')).toBe('cloudy');
    expect(conditionFromText('Chance Rain Showers')).toBe('rain');
    expect(conditionFromText('Scattered Thunderstorms')).toBe('storm');
    expect(conditionFromText('Snow Likely')).toBe('snow');
    expect(conditionFromText('Freezing Rain')).toBe('ice'); // not plain rain
    expect(conditionFromText('Patchy Fog')).toBe('fog');
    expect(conditionFromText('')).toBe('unknown');
  });
  it('falls back to the icon code', () => {
    expect(conditionFromText('', 'https://api.weather.gov/icons/land/day/snow,80?size=medium')).toBe('snow');
    expect(conditionFromText(null, 'https://api.weather.gov/icons/land/night/skc?size=medium')).toBe('clear');
  });
});

const alertFeature = (severity: string, event: string, status = 'Actual', messageType = 'Alert') => ({
  id: `id-${event}`,
  properties: {
    '@id': `https://api.weather.gov/alerts/${event}`,
    status,
    messageType,
    severity,
    event,
    headline: `${event} headline`,
    description: 'Details.',
    instruction: 'Stay inside.',
    areaDesc: 'Suffolk, MA',
    onset: '2026-10-18T10:00:00-04:00',
    ends: '2026-10-19T04:00:00-04:00',
    expires: '2026-10-19T04:00:00-04:00',
  },
});

describe('alert parsing', () => {
  it('keeps only actual alerts, worst first', () => {
    const out = parseAlerts({
      features: [
        alertFeature('Minor', 'Special Weather Statement'),
        alertFeature('Severe', 'Winter Storm Warning'),
        alertFeature('Moderate', 'Wind Advisory'),
        alertFeature('Extreme', 'Test Message', 'Test'),
        alertFeature('Severe', 'Cancelled Warning', 'Actual', 'Cancel'),
      ],
    });
    expect(out.map((a) => a.event)).toEqual(['Winter Storm Warning', 'Wind Advisory', 'Special Weather Statement']);
    expect(out[0].instruction).toBe('Stay inside.');
    expect(out[0].url).toContain('api.weather.gov');
  });
  it('an empty feed is an empty list, not an error', () => {
    expect(parseAlerts({ features: [] })).toEqual([]);
    expect(parseAlerts(null)).toEqual([]);
  });
});

describe('station observation parsing', () => {
  const doc = {
    properties: {
      timestamp: '2026-10-18T14:54:00Z',
      textDescription: 'Fair',
      icon: 'https://api.weather.gov/icons/land/day/skc?size=medium',
      temperature: { value: 10 }, // 50°F
      dewpoint: { value: 4 },
      windDirection: { value: 270 },
      windSpeed: { value: 16.0934 }, // ≈10 mph
      windGust: { value: null },
      barometricPressure: { value: 101591 },
      visibility: { value: 16093.4 },
      relativeHumidity: { value: 64.8 },
      windChill: { value: null },
      heatIndex: { value: null },
    },
  };
  it('converts units and derives the compass point', () => {
    const obs = parseObservation(doc, 'KBOS', 'Boston Logan');
    expect(obs).not.toBeNull();
    expect(obs!.tempF).toBe(50);
    expect(obs!.windMph).toBe(10);
    expect(obs!.windDir).toBe('W');
    expect(obs!.humidity).toBe(65);
    expect(obs!.pressureInHg).toBe(30);
    expect(obs!.visibilityMi).toBe(10);
    expect(obs!.kind).toBe('clear');
    // 50°F at 10 mph: station stayed silent, formula fills in (≈46°F).
    expect(obs!.windChillF).toBe(46);
    expect(obs!.feelsLikeF).toBe(46);
  });
  it('refuses an observation with no temperature', () => {
    expect(parseObservation({ properties: { temperature: { value: null } } }, 'K', 'X')).toBeNull();
    expect(parseObservation(null, 'K', 'X')).toBeNull();
  });
});

describe('day shaping', () => {
  const hour = (start: string, tempF: number, kind: HourlyPeriod['kind'] = 'clear', precipChance: number | null = null): HourlyPeriod => ({
    start,
    end: start,
    isDay: true,
    tempF,
    feelsLikeF: tempF,
    kind,
    shortForecast: '',
    precipChance,
    humidity: null,
    dewpointF: null,
    windMph: null,
    windText: '',
    windDir: null,
  });
  it('groups by Boston calendar date, not UTC', () => {
    // 01:30 UTC on Oct 19 is still Oct 18, 9:30 PM in Boston (EDT).
    expect(localDateKey('2026-10-19T01:30:00Z')).toBe('2026-10-18');
    const days = buildDaySummaries(
      [hour('2026-10-18T16:00:00-04:00', 55, 'rain', 80), hour('2026-10-18T21:30:00-04:00', 48, 'clear')],
      []
    );
    expect(days).toHaveLength(1);
    expect(days[0].date).toBe('2026-10-18');
    expect(days[0].highF).toBe(55);
    expect(days[0].lowF).toBe(48);
    expect(days[0].precipChanceMax).toBe(80);
    expect(days[0].hasRain).toBe(true);
    expect(days[0].kind).toBe('rain'); // the day wears its worst weather
  });
});

/* ------------------------------------------------------------ style tips -- */

function makePayload(overrides: Partial<WeatherPayload> & { daysSpec?: Array<[number, number, Partial<DaySummary>?]> }): WeatherPayload {
  const now = new Date('2026-10-18T14:00:00-04:00'); // Sunday 2 PM Boston
  const mkHour = (offset: number, tempF: number, extra: Partial<HourlyPeriod> = {}): HourlyPeriod => {
    const start = new Date(now.getTime() + offset * 3600_000);
    return {
      start: start.toISOString(),
      end: new Date(start.getTime() + 3600_000).toISOString(),
      isDay: true,
      tempF,
      feelsLikeF: extra.feelsLikeF ?? tempF,
      kind: 'clear',
      shortForecast: 'Sunny',
      precipChance: 0,
      humidity: 50,
      dewpointF: null,
      windMph: 5,
      windText: '5 mph',
      windDir: 'NW',
      ...extra,
    };
  };
  const days: DaySummary[] = (overrides.daysSpec ?? []).map(([highF, lowF, extra], i) => ({
    date: `2026-10-${18 + i}`,
    highF,
    lowF,
    precipChanceMax: 0,
    kind: 'clear',
    hasSnow: false,
    hasRain: false,
    ...extra,
  }));
  return {
    status: 'live',
    source: { name: 'nws', url: 'https://www.weather.gov', office: 'BOX', grid: 'BOX/72,98' },
    point: { lat: 42.3016, lon: -71.0676, city: 'Dorchester', state: 'MA', timeZone: 'America/New_York' },
    fetchedAt: now.toISOString(),
    issuedAt: null,
    current: {
      observedAt: now.toISOString(),
      stationId: 'KBOS',
      stationName: 'Boston Logan',
      text: 'Fair',
      kind: 'clear',
      isDay: true,
      tempF: 55,
      feelsLikeF: 55,
      windChillF: null,
      heatIndexF: null,
      humidity: 50,
      dewpointF: null,
      windMph: 5,
      windGustMph: null,
      windDir: 'NW',
      pressureInHg: null,
      visibilityMi: null,
    },
    hourly: Array.from({ length: 24 }, (_, i) => mkHour(i, 55)),
    daily: [],
    days,
    alerts: [],
    alertsStatus: 'live',
    astronomy: null,
    ...overrides,
    ...(overrides.daysSpec ? { days } : {}),
  };
}

const READ_AT = new Date('2026-10-18T14:00:00-04:00');

describe('style tips', () => {
  it('a bitter day leads with the heavy coat and trips the cold signal', () => {
    const payload = makePayload({ daysSpec: [[24, 12]] });
    payload.current = { ...payload.current!, tempF: 20, feelsLikeF: 8, windMph: 18 };
    payload.hourly = payload.hourly.map((h) => ({ ...h, tempF: 20, feelsLikeF: 8 }));
    const tips = buildStyleTips(payload, READ_AT);
    expect(tips[0].kind).toBe('heavyCoat');
    expect(tips[0].values.tempF).toBe(8);
    expect(coldSignal(payload, READ_AT)).toBe(true);
  });

  it('a cold week is called a cold week (four cold days), not from one cold day', () => {
    const coldWeek = makePayload({ daysSpec: [[40, 28], [38, 27], [36, 24], [39, 26], [55, 40], [58, 41]] });
    expect(buildStyleTips(coldWeek, READ_AT).some((tp) => tp.kind === 'coldWeek' && tp.scope === 'week')).toBe(true);
    const oneColdDay = makePayload({ daysSpec: [[38, 27], [58, 41], [60, 42], [62, 44], [59, 40], [61, 43]] });
    expect(buildStyleTips(oneColdDay, READ_AT).some((tp) => tp.kind === 'coldWeek')).toBe(false);
  });

  it('warm rain gets a rain shell, not a coat lecture', () => {
    const payload = makePayload({ daysSpec: [[68, 58]] });
    payload.current = { ...payload.current!, tempF: 66, feelsLikeF: 66 };
    payload.hourly = payload.hourly.map((h) => ({ ...h, tempF: 66, feelsLikeF: 66, kind: 'rain', precipChance: 85 }));
    const kinds = buildStyleTips(payload, READ_AT).map((tp) => tp.kind);
    expect(kinds).toContain('rainShell');
    expect(kinds).not.toContain('coat');
    expect(coldSignal(payload, READ_AT)).toBe(false);
  });

  it('a mild afternoon that dives after dark earns the evening-layer tip', () => {
    const payload = makePayload({ daysSpec: [[62, 34]] });
    payload.hourly = payload.hourly.map((h, i) => ({ ...h, tempF: i < 6 ? 60 : 36, feelsLikeF: i < 6 ? 60 : 36 }));
    const kinds = buildStyleTips(payload, READ_AT).map((tp) => tp.kind);
    expect(kinds).toContain('eveningLayer');
  });

  it('snow in the next day brings boots', () => {
    const payload = makePayload({ daysSpec: [[30, 22, { hasSnow: true, kind: 'snow' }]] });
    payload.current = { ...payload.current!, tempF: 29, feelsLikeF: 29 };
    payload.hourly = payload.hourly.map((h) => ({ ...h, tempF: 29, feelsLikeF: 29, kind: 'snow', precipChance: 70 }));
    expect(buildStyleTips(payload, READ_AT).map((tp) => tp.kind)).toContain('snowBoots');
  });

  it('caps at six tips, ordered now → today → tonight → week', () => {
    const payload = makePayload({ daysSpec: [[36, 20], [35, 22], [38, 24], [37, 23], [36, 21], [39, 25]] });
    payload.current = { ...payload.current!, tempF: 30, feelsLikeF: 18, windMph: 22, windGustMph: 38 };
    payload.hourly = payload.hourly.map((h) => ({ ...h, tempF: 30, feelsLikeF: 18, kind: 'snow', precipChance: 90, windMph: 30 }));
    const tips = buildStyleTips(payload, READ_AT);
    expect(tips.length).toBeLessThanOrEqual(6);
    const order = { now: 0, today: 1, tonight: 2, week: 3 };
    const scopes = tips.map((tp) => order[tp.scope]);
    expect(scopes).toEqual([...scopes].sort((a, b) => a - b));
  });
});

describe('day phase (which single tip the spotlight leads with)', () => {
  const at = (iso: string) => new Date(iso);

  it('uses the Boston clock when astronomy is missing', () => {
    const payload = makePayload({});
    expect(payload.astronomy).toBeNull();
    expect(dayPhase(payload, at('2026-10-18T07:30:00-04:00'))).toBe('morning');
    expect(dayPhase(payload, at('2026-10-18T13:00:00-04:00'))).toBe('midday');
    expect(dayPhase(payload, at('2026-10-18T19:00:00-04:00'))).toBe('evening');
    expect(dayPhase(payload, at('2026-10-18T23:30:00-04:00'))).toBe('night');
    expect(dayPhase(payload, at('2026-10-18T02:00:00-04:00'))).toBe('night');
  });

  it('prefers real sunrise/sunset when the payload carries them', () => {
    const payload = makePayload({
      astronomy: { sunrise: '2026-10-18T07:05:00-04:00', sunset: '2026-10-18T18:08:00-04:00' },
    });
    expect(dayPhase(payload, at('2026-10-18T05:00:00-04:00'))).toBe('night');
    expect(dayPhase(payload, at('2026-10-18T08:00:00-04:00'))).toBe('morning');
    expect(dayPhase(payload, at('2026-10-18T13:00:00-04:00'))).toBe('midday');
    expect(dayPhase(payload, at('2026-10-18T16:30:00-04:00'))).toBe('evening');
    expect(dayPhase(payload, at('2026-10-18T20:00:00-04:00'))).toBe('night');
  });

  it('spotlight leads with the moment: morning cold in the morning, not the stacked list order', () => {
    const payload = makePayload({ daysSpec: [[40, 26]] });
    payload.current = { ...payload.current!, tempF: 30, feelsLikeF: 24 };
    payload.hourly = payload.hourly.map((h) => ({ ...h, tempF: 30, feelsLikeF: 24 }));
    const morning = pickSpotlightTip(payload, at('2026-10-18T07:30:00-04:00'));
    expect(morning).not.toBeNull();
    expect(['morningChill', 'heavyCoat', 'coat']).toContain(morning!.kind);
  });

  it('an evening read prefers tonight-scoped advice over the daytime lead', () => {
    // Mild afternoon that turns cold at night: buildStyleTips orders
    // now -> today -> tonight, but at 7 PM the spotlight must lead with
    // tonight, because that is when the reader will be out in it.
    const payload = makePayload({ daysSpec: [[62, 30]] });
    payload.current = { ...payload.current!, tempF: 58, feelsLikeF: 58 };
    payload.hourly = payload.hourly.map((h, i) => ({ ...h, tempF: i < 5 ? 58 : 33, feelsLikeF: i < 5 ? 58 : 33 }));
    const evening = pickSpotlightTip(payload, at('2026-10-18T19:00:00-04:00'));
    expect(evening).not.toBeNull();
    expect(evening!.scope === 'tonight' || evening!.kind === 'eveningLayer' || evening!.kind === 'darkReflective').toBe(true);
  });

  it('safety always overrides the phase (storm tip wins at any hour)', () => {
    const payload = makePayload({ daysSpec: [[55, 45]] });
    payload.current = { ...payload.current!, tempF: 52, feelsLikeF: 52 };
    payload.hourly = payload.hourly.map((h) => ({ ...h, tempF: 52, feelsLikeF: 52, kind: 'storm', precipChance: 90 }));
    payload.alerts = [{
      id: 'test-alert', event: 'Severe Thunderstorm Warning', severity: 'Severe', certainty: 'Observed',
      urgency: 'Immediate', headline: null, description: '', instruction: null, senderName: 'NWS Boston',
      onset: null, ends: null, expires: null, areas: 'Suffolk County', url: 'https://www.weather.gov',
    }];
    const spot = pickSpotlightTip(payload, at('2026-10-18T13:00:00-04:00'));
    expect(spot?.kind).toBe('storm');
  });

  it('returns exactly one tip, and null only when there is nothing to say', () => {
    const payload = makePayload({ daysSpec: [[70, 58]] });
    const spot = pickSpotlightTip(payload, at('2026-10-18T12:00:00-04:00'));
    expect(spot).not.toBeNull();
    expect(buildStyleTips(payload, at('2026-10-18T12:00:00-04:00')).length).toBeGreaterThanOrEqual(1);
  });
});
