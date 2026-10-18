'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BadgeState {
  earned: Record<string, string>;
  earn: (id: string) => void;
  reset: () => void;
}

export const useBadgeStore = create<BadgeState>()(
  persist(
    (set, get) => ({
      earned: {},
      earn: (id: string) => {
        if (get().earned[id]) return;
        set((state) => ({
          earned: {
            ...state.earned,
            [id]: new Date().toISOString(),
          },
        }));
      },
      reset: () => set({ earned: {} }),
    }),
    {
      name: 'dor101-badges',
    },
  ),
);
