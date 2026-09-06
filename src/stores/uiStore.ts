'use client';

import { create } from 'zustand';

/**
 * UI panel state — command palette and the saved-items sheet.
 * Deliberately NOT persisted: panels are transient, and no user data
 * leaves the device.
 */

interface CommandPaletteState {
  open: boolean;
  query: string;
  setOpen: (open: boolean) => void;
  setQuery: (q: string) => void;
}

export const useCommandPalette = create<CommandPaletteState>((set) => ({
  open: false,
  query: '',
  setOpen: (open) => set({ open, query: open ? '' : '' }),
  setQuery: (query) => set({ query }),
}));

interface SavedSheetState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useSavedSheet = create<SavedSheetState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
