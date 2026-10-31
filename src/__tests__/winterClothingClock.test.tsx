import { act, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WINTER_CLOTHING } from '@/data/winterClothing';
import { useWinterClothing } from '@/hooks/useWinterClothing';
import { useAppStore } from '@/stores/appStore';

function ServerProbe() {
  const { places } = useWinterClothing();
  const place = places.find((item) => item.id === 'abcd-dorchester-nsc');
  return <p>{place?.computed ? 'time-dependent claim' : 'no current clock'}</p>;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-30T14:00:00Z')); // Friday, 10 AM in Boston
  useAppStore.getState().setAutoRefresh(false);
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('winter clothing time and source checks', () => {
  it('does not prerender open or seasonal claims at build time', () => {
    expect(renderToString(<ServerProbe />)).toContain('no current clock');
  });

  it('recomputes a cached API status on the reader clock and changes as hours pass', async () => {
    const staleResponse = WINTER_CLOTHING.map((place) => ({
      ...place,
      computed: { openNow: false, inSeason: false, checkedAgeDays: 9999, checkLevel: 'critical' },
      sourceCheck: { reachable: true, status: 200, checkedAt: '2026-10-30T13:00:00Z' },
    }));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ places: staleResponse }), { status: 200 })));
    const { result, unmount } = renderHook(() => useWinterClothing());
    await act(async () => {});
    const abcd = () => result.current.places.find((place) => place.id === 'abcd-dorchester-nsc')!;
    expect(result.current.live).toBe(true);
    expect(abcd().computed?.openNow).toBe(true);
    expect(abcd().sourceCheck?.checkedAt).toBe('2026-10-30T13:00:00Z');

    vi.setSystemTime(new Date('2026-10-30T22:00:00Z')); // Friday, 6 PM in Boston
    await act(async () => { vi.advanceTimersByTime(60_000); });
    expect(abcd().computed?.openNow).toBe(false);
    unmount();
  });
});
