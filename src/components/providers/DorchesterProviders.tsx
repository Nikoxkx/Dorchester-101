'use client';

import { useEffect, type ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import { useAppStore } from '@/stores/appStore';
import { useResolvedPrefs } from '@/hooks/useResolvedPrefs';
import { languageMeta } from '@/i18n/config';
import { LiveRegionProvider } from './LiveRegion';
import { SkipLink, ShortcutHelp } from '@/components/a11y';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

/**
 * Applies the visitor's stored preferences to the document, then mounts the
 * shared providers.
 *
 * Every attribute written here has a rule in `globals.css` behind it. The
 * settings page, this component and the stylesheet are the only three places
 * these values exist, which is what keeps a toggle from becoming decoration.
 */
function DocumentSettings() {
  const prefs = useResolvedPrefs();
  const meta = languageMeta(prefs.language);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = meta.intlLocale;
    root.dir = prefs.dir;
    root.classList.toggle('dark', prefs.dark);
    root.dataset.locale = prefs.language;
    root.dataset.reduceMotion = String(prefs.reduceMotion);
    root.dataset.contrast = prefs.highContrast ? 'high' : 'normal';
    root.dataset.linksUnderlined = String(prefs.underlineLinks);
    root.dataset.focusLarge = String(prefs.largeFocus);
    root.dataset.dyslexiaFont = String(prefs.legibleFont);
    root.dataset.textSpacing = String(prefs.textSpacing);
    root.dataset.surface = prefs.surface;
    root.style.fontSize = prefs.fontSizePx;
  }, [
    prefs.dir,
    prefs.language,
    prefs.dark,
    prefs.reduceMotion,
    prefs.highContrast,
    prefs.underlineLinks,
    prefs.largeFocus,
    prefs.legibleFont,
    prefs.textSpacing,
    prefs.surface,
    prefs.fontSizePx,
    meta.intlLocale,
  ]);

  // Colour of the browser chrome follows the resolved theme, including when
  // the theme is 'system' and the OS switches at sunset.
  useEffect(() => {
    const existing = document.querySelector('meta[name="theme-color"]');
    const color = prefs.dark ? '#0F1720' : '#14304F';
    if (existing) existing.setAttribute('content', color);
  }, [prefs.dark]);

  return null;
}

/** Reads persisted state once, on the client, so first paint never flashes defaults. */
function HydrationBridge() {
  const hydrated = useAppStore((s) => s.hydrated);
  const setLanguage = useAppStore((s) => s.setLanguage);

  useEffect(() => {
    if (hydrated) return;
    // zustand's persist middleware marks this itself; this is the belt-and-
    // braces path for a storage read that threw (private mode, quota).
    const timer = window.setTimeout(() => {
      if (!useAppStore.getState().hydrated) useAppStore.getState().markHydrated();
    }, 400);
    return () => window.clearTimeout(timer);
  }, [hydrated, setLanguage]);

  return null;
}

export function DorchesterProviders({ children }: { children: ReactNode }) {
  const reduceMotion = useResolvedPrefs().reduceMotion;

  useKeyboardShortcuts();

  return (
    <MotionConfig reducedMotion={reduceMotion ? 'always' : 'never'}>
      <LiveRegionProvider>
        <DocumentSettings />
        <HydrationBridge />
        <SkipLink />
        {children}
        <ShortcutHelp />
      </LiveRegionProvider>
    </MotionConfig>
  );
}
