'use client';

import { useSyncExternalStore } from 'react';

// A stable server snapshot prevents browser-only speech controls from changing
// the initial HTML during hydration. React checks the real capability once it
// has attached to the server-rendered tree.
const subscribe = () => () => {};
const browserSnapshot = () => typeof window !== 'undefined' && 'speechSynthesis' in window;
const serverSnapshot = () => false;

export function useSpeechSupported(): boolean {
  return useSyncExternalStore(subscribe, browserSnapshot, serverSnapshot);
}

/** Match the content language, not an unrelated formatting fallback locale. */
export function speechVoiceMatches(language: string, voiceLanguage: string): boolean {
  return voiceLanguage.toLowerCase().replace('_', '-').split('-')[0] === language.toLowerCase();
}
