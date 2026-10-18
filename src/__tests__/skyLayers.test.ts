import { describe, expect, it } from 'vitest';
import { skyLayers } from '@/components/weather/WeatherVisuals';
import type { ConditionKind } from '@/lib/weather';

/**
 * The animated sky backdrop is pure decoration, but it must agree with the
 * live condition: a "clear night" backdrop that rained would contradict the
 * forecast text next to it. These tests pin the layer decisions per kind.
 */
describe('skyLayers', () => {
  it('clear day gets a sun and no precipitation', () => {
    const layers = skyLayers('clear', true);
    expect(layers.sun).toBe(true);
    expect(layers.moon).toBe(false);
    expect(layers.stars).toBe(0);
    expect(layers.rain).toBe(0);
    expect(layers.snow).toBe(0);
    expect(layers.flash).toBe(false);
  });

  it('clear night gets a moon and twinkling stars, never a sun or rain', () => {
    const layers = skyLayers('clear', false);
    expect(layers.moon).toBe(true);
    expect(layers.sun).toBe(false);
    expect(layers.stars).toBeGreaterThan(0);
    expect(layers.rain).toBe(0);
    expect(layers.snow).toBe(0);
  });

  it('storms rain hard behind dark clouds and flash lightning, day or night', () => {
    for (const isDay of [true, false]) {
      const layers = skyLayers('storm', isDay);
      expect(layers.rain).toBeGreaterThan(0);
      expect(layers.darkClouds).toBe(true);
      expect(layers.flash).toBe(true);
      expect(layers.stars).toBe(0);
      expect(layers.sun).toBe(false);
      expect(layers.moon).toBe(false);
    }
  });

  it('snow snows and never rains; steady rain is denser than drizzle', () => {
    const snow = skyLayers('snow', true);
    expect(snow.snow).toBeGreaterThan(0);
    expect(snow.rain).toBe(0);
    expect(skyLayers('rain', true).rain).toBeGreaterThan(skyLayers('drizzle', true).rain);
    expect(skyLayers('drizzle', true).darkClouds).toBe(false);
  });

  it('sleet is the one mix: rain and snow together', () => {
    const sleet = skyLayers('sleet', true);
    expect(sleet.rain).toBeGreaterThan(0);
    expect(sleet.snow).toBeGreaterThan(0);
  });

  it('fog gets low fog bands; overcast only clouds and hides the stars', () => {
    expect(skyLayers('fog', true).fog).toBeGreaterThan(0);
    const cloudy = skyLayers('cloudy', false);
    expect(cloudy.clouds).toBeGreaterThan(0);
    expect(cloudy.stars).toBe(0);
    expect(cloudy.moon).toBe(false);
  });

  it('partly keeps the sun/moon visible through light cloud', () => {
    const day = skyLayers('partly', true);
    expect(day.sun).toBe(true);
    expect(day.clouds).toBeGreaterThan(0);
    const night = skyLayers('partly', false);
    expect(night.moon).toBe(true);
    expect(night.stars).toBeGreaterThan(0);
  });

  it('every condition kind produces a sane, bounded layer set', () => {
    const kinds: ConditionKind[] = [
      'clear', 'partly', 'cloudy', 'fog', 'drizzle', 'rain',
      'storm', 'snow', 'sleet', 'ice', 'wind', 'unknown',
    ];
    for (const kind of kinds) {
      for (const isDay of [true, false]) {
        const layers = skyLayers(kind, isDay);
        expect(layers.rain).toBeGreaterThanOrEqual(0);
        expect(layers.snow).toBeGreaterThanOrEqual(0);
        expect(layers.stars).toBeGreaterThanOrEqual(0);
        expect(layers.fog).toBeGreaterThanOrEqual(0);
        // Element counts stay capped so the backdrop never janks scrolling.
        expect(layers.rain + layers.snow + layers.stars + layers.clouds + layers.fog).toBeLessThanOrEqual(60);
        // Never a sun and a moon at once; stars only at night.
        expect(layers.sun && layers.moon).toBe(false);
        if (isDay) expect(layers.stars).toBe(0);
        if (isDay) expect(layers.moon).toBe(false);
        if (!isDay) expect(layers.sun).toBe(false);
      }
    }
  });
});
