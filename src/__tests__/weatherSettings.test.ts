import { describe, expect, it } from 'vitest';
import {
  DEFAULT_WEATHER_LAYOUT,
  HOME_SECTION_ORDER,
  WEATHER_BLOCK_ORDER,
  migrateSettings,
  type HomeLayout,
} from '@/stores/appStore';

/**
 * Weather became opt-in in 4.8. The migration contract: a resident who had
 * arranged their homepage had chosen a page *with* weather on it, so their
 * weather stays on; anyone still on the shipped layout gets the new
 * default (off). Nobody's arrangement is ever rewritten beyond the two
 * documented default-following moves.
 */
const shippedLayout = (): HomeLayout => ({ order: [...HOME_SECTION_ORDER], hidden: [], cardStyle: 'match' });

describe('weather layout defaults', () => {
  it('ships every /weather block visible in reading order', () => {
    expect(DEFAULT_WEATHER_LAYOUT.order).toEqual(WEATHER_BLOCK_ORDER);
    expect(DEFAULT_WEATHER_LAYOUT.hidden).toEqual([]);
    // Alerts are not a block: safety is not furniture.
    expect(WEATHER_BLOCK_ORDER).not.toContain('alerts');
  });
});

describe('migrateSettings — weather opt-in (v4)', () => {
  it('turns weather OFF for a persisted shipped-default layout', () => {
    const out = migrateSettings({ homeLayout: shippedLayout() }, 3);
    expect(out.weatherEnabled).toBe(false);
  });

  it('keeps weather ON for any customized layout', () => {
    const reordered = shippedLayout();
    [reordered.order[0], reordered.order[1]] = [reordered.order[1], reordered.order[0]];
    expect(migrateSettings({ homeLayout: reordered }, 3).weatherEnabled).toBe(true);

    const hiddenSome = { ...shippedLayout(), hidden: ['news' as const] };
    expect(migrateSettings({ homeLayout: hiddenSome }, 3).weatherEnabled).toBe(true);

    const styled = { ...shippedLayout(), cardStyle: 'aurora' as const };
    expect(migrateSettings({ homeLayout: styled }, 3).weatherEnabled).toBe(true);
  });

  it('never second-guesses a v4+ choice the resident already made', () => {
    const on = migrateSettings({ homeLayout: shippedLayout(), weatherEnabled: true }, 4);
    expect(on.weatherEnabled).toBe(true);
    const off = migrateSettings({ homeLayout: shippedLayout(), weatherEnabled: false }, 4);
    expect(off.weatherEnabled).toBe(false);
  });

  it('chains v2 → v3 → v4: old shipped order moves the NowBar, then opts weather out', () => {
    const v2Default: HomeLayout = {
      order: ['nowbar', 'hero', 'greeting', 'weather', 'permissions', 'glance', 'quick', 'clothing', 'news', 'map', 'extras'],
      hidden: [],
      cardStyle: 'match',
    };
    const out = migrateSettings({ homeLayout: v2Default }, 2);
    expect(out.homeLayout.order).toEqual(HOME_SECTION_ORDER);
    expect(out.weatherEnabled).toBe(false);
  });

  it('survives empty and shapeless persisted state', () => {
    expect(migrateSettings(null, 1).weatherEnabled).toBe(false);
    expect(migrateSettings(undefined, 3).weatherEnabled).toBe(false);
    expect(migrateSettings({}, 3).weatherEnabled).toBe(false);
    expect(migrateSettings({ homeLayout: { order: 'bogus' } }, 3).weatherEnabled).toBe(true);
  });
});
