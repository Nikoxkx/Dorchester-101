'use client';

import { useCallback, useMemo, useState } from 'react';
import { useLivePolling } from './useLivePolling';
import { useHydratedNow } from './useNow';
import { WINTER_CLOTHING, clothingCheckedAge, clothingCheckLevel, inSeason } from '@/data/winterClothing';
import { BOSTON_TZ, statusFor } from '@/lib/hours';
import type { ClothingPlaceView } from '@/components/clothing/ClothingCard';

/**
 * Winter-clothing listings, kept fresh two ways.
 *
 * The record fields (what a place gives away, who it is for, how to ask)
 * are sourced data with a `checkedOn` date on every card, some needing review — like the
 * rest of the directory. The time-dependent readings around them are
 * computed, never typed: `/api/winter-clothing` evaluates open-now and
 * date windows in Boston time and tests each page’s reachability separately.
 * Start without time-dependent claims in static HTML. After hydration, compute
 * open/season/review readings on the visitor's ticking clock, even if an API
 * response was cached or the server is unreachable. Reachability remains a
 * separate, timestamped server check; a browser cannot verify another origin.
 */
export function useWinterClothing(): { places: ClothingPlaceView[]; live: boolean } {
  const [records, setRecords] = useState<ClothingPlaceView[]>(WINTER_CLOTHING);
  const [live, setLive] = useState(false);
  const nowMs = useHydratedNow(60_000);
  const places = useMemo(() => {
    if (nowMs === null) return records;
    const now = new Date(nowMs);
    return records.map((place) => ({
      ...place,
      computed: {
        openNow: place.hours ? statusFor(place.hours, now, BOSTON_TZ).state !== 'closed' : null,
        inSeason: inSeason(place, now),
        checkedAgeDays: clothingCheckedAge(place, now),
        checkLevel: clothingCheckLevel(place, now),
      },
    }));
  }, [records, nowMs]);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/winter-clothing');
      if (!res.ok) throw new Error(`winter-clothing api answered ${res.status}`);
      const json = (await res.json()) as { places: ClothingPlaceView[] };
      if (Array.isArray(json.places) && json.places.length) {
        setRecords(json.places);
        setLive(true);
        return;
      }
      throw new Error('empty clothing payload');
    } catch {
      // Drop old source-check results; local clock-based status still works.
      setRecords(WINTER_CLOTHING);
      setLive(false);
    }
  }, []);

  useLivePolling(load, { minMs: 30 * 60_000 });

  return { places, live };
}
