'use client';

import { useCallback, useState } from 'react';
import { useLivePolling } from './useLivePolling';
import { WINTER_CLOTHING, clothingCheckedAge, clothingCheckLevel, inSeason } from '@/data/winterClothing';
import { BOSTON_TZ, statusFor } from '@/lib/hours';
import type { ClothingPlaceView } from '@/components/clothing/ClothingCard';

/**
 * Winter-clothing listings, kept fresh two ways.
 *
 * The record fields (what a place gives away, who it is for, how to ask)
 * are hand-checked data with a `checkedOn` date on every card — like the
 * rest of the directory. The time-dependent readings around them are
 * computed, never typed: `/api/winter-clothing` evaluates open-now and
 * in-season in Boston time and live-tests each official page. When no
 * DOR101 server is behind the page (desktop build, static preview), the
 * same computations run locally and only the page-reachability check
 * reports itself unavailable — a browser cannot truthfully test another
 * origin's availability anyway.
 */
function localPlaces(): ClothingPlaceView[] {
  const now = new Date();
  return WINTER_CLOTHING.map((place) => ({
    ...place,
    computed: {
      openNow: place.hours ? statusFor(place.hours, now, BOSTON_TZ).state !== 'closed' : null,
      inSeason: inSeason(place, now),
      checkedAgeDays: clothingCheckedAge(place, now),
      checkLevel: clothingCheckLevel(place, now),
    },
  }));
}

export function useWinterClothing(): { places: ClothingPlaceView[]; live: boolean } {
  const [places, setPlaces] = useState<ClothingPlaceView[]>(() => localPlaces());
  const [live, setLive] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/winter-clothing');
      if (!res.ok) throw new Error(`winter-clothing api answered ${res.status}`);
      const json = (await res.json()) as { places: ClothingPlaceView[] };
      if (Array.isArray(json.places) && json.places.length) {
        setPlaces(json.places);
        setLive(true);
        return;
      }
      throw new Error('empty clothing payload');
    } catch {
      setPlaces(localPlaces());
      setLive(false);
    }
  }, []);

  useLivePolling(load, { minMs: 30 * 60_000 });

  return { places, live };
}
