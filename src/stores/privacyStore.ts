'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** A legacy "Got it" acknowledgement was never permission for analytics. */
export type AnalyticsChoice = 'unset' | 'allow' | 'decline';
export const PRIVACY_STORAGE_KEY = 'dor101-privacy-choice';

interface PrivacyState {
  choice: AnalyticsChoice;
  hydrated: boolean;
  /** Session-only: let people read the policy or browser settings first. */
  deferred: boolean;
  choose: (choice: AnalyticsChoice) => void;
  defer: () => void;
  markHydrated: () => void;
}

const storage = {
  getItem: (key: string) => {
    try { return typeof window === 'undefined' ? null : window.localStorage.getItem(key); } catch { return null; }
  },
  setItem: (key: string, value: string) => {
    try { if (typeof window !== 'undefined') window.localStorage.setItem(key, value); } catch { /* Choice remains in memory. */ }
  },
  removeItem: (key: string) => {
    try { if (typeof window !== 'undefined') window.localStorage.removeItem(key); } catch { /* Private mode. */ }
  },
};

export function readAnalyticsChoice(serialized: string | null): AnalyticsChoice {
  try {
    const choice = serialized ? JSON.parse(serialized)?.state?.choice : undefined;
    return choice === 'allow' || choice === 'decline' ? choice : 'unset';
  } catch { return 'unset'; }
}

export const usePrivacyStore = create<PrivacyState>()(persist((set) => ({
  choice: 'unset',
  hydrated: false,
  deferred: false,
  choose: (choice) => set({ choice, deferred: false }),
  defer: () => set({ deferred: true }),
  markHydrated: () => set({ hydrated: true }),
}), {
  name: PRIVACY_STORAGE_KEY,
  storage: createJSONStorage(() => storage),
  version: 1,
  partialize: ({ choice }) => ({ choice }),
  // Only the explicit allowed value can enable telemetry, even with corrupt data.
  merge: (persisted, current) => ({
    ...current,
    choice: readAnalyticsChoice(JSON.stringify({ state: persisted })),
  }),
  onRehydrateStorage: () => (state) => state?.markHydrated(),
}));
