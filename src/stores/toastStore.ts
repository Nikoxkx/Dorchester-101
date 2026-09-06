'use client';

import { create } from 'zustand';

export type ToastTone = 'neutral' | 'success' | 'warning' | 'danger';

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastState {
  toasts: Toast[];
  push: (message: string, tone?: ToastTone) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

/** Local-only confirmation feedback. Nothing leaves the device. */
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (message, tone = 'neutral') => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, message, tone }] }));
    window.setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3200);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Hook returning a fire-and-forget `toast(message, tone)`. */
export function useToast() {
  return useToastStore((s) => s.push);
}
