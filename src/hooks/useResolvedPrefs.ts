'use client';

import { useMemo } from 'react';
import { useAppStore, FONT_SIZE_VALUES, PALETTES, SURFACES, type Surface, type Palette } from '@/stores/appStore';
import { languageMeta, isRtl, type LanguageCode } from '@/i18n/config';
import { resolveScene, SCENES, type ResolvedScene } from '@/lib/scenes';
import {
  usePrefersDark,
  usePrefersHighContrast,
  usePrefersReducedMotion,
} from './useMediaPreferences';

export interface ResolvedPreferences {
  language: LanguageCode;
  dir: 'ltr' | 'rtl';
  fontSizePx: string;
  reduceMotion: boolean;
  highContrast: boolean;
  dark: boolean;
  surface: Surface;
  palette: Palette;
  /** Resolved theme scene ('classic' = palette/surface run the show). */
  scene: ResolvedScene;
  underlineLinks: boolean;
  largeFocus: boolean;
  legibleFont: boolean;
  textSpacing: boolean;
  announceUpdates: boolean;
  /** Which values came from the device rather than from an explicit choice. */
  detected: { reduceMotion: boolean; highContrast: boolean; dark: boolean };
  /** Ready to render: false only until persisted state has been read. */
  ready: boolean;
}

/**
 * Single source of truth for "what should this page look and behave like".
 *
 * A preference stored as 'auto' means the visitor never overrode it, so the
 * operating system wins. This is also where the truth becomes visible: the
 * settings UI reads `detected` to label a control "Detected from your device"
 * instead of silently showing a hard-coded default.
 */
export function useResolvedPrefs(): ResolvedPreferences {
  const language = useAppStore((s) => s.language);
  const fontSize = useAppStore((s) => s.fontSize);
  const theme = useAppStore((s) => s.theme);
  const accessibility = useAppStore((s) => s.accessibility);
  const surface = useAppStore((s) => s.surface);
  const palette = useAppStore((s) => s.palette);
  const sceneSetting = useAppStore((s) => s.scene);
  const hydrated = useAppStore((s) => s.hydrated);

  const deviceReduceMotion = usePrefersReducedMotion();
  const deviceContrast = usePrefersHighContrast();
  const deviceDark = usePrefersDark();

  return useMemo<ResolvedPreferences>(() => {
    const reduceMotion =
      accessibility.reduceMotion === 'auto' ? deviceReduceMotion : accessibility.reduceMotion === 'on';
    const highContrast =
      accessibility.highContrast === 'auto' ? deviceContrast : accessibility.highContrast === 'on';
    const scene = resolveScene(sceneSetting);
    const sceneMeta = SCENES[scene];
    // A scene is designed as a whole: Halloween is a night scene whatever
    // the light/dark toggle says, and each scene sits on its own surface.
    const dark = sceneMeta.forcedDark ? true : theme === 'system' ? deviceDark : theme === 'dark';
    const effectiveSurface = scene === 'classic' ? surface : (sceneMeta.surface ?? surface);

    return {
      language,
      dir: isRtl(language) ? 'rtl' : 'ltr',
      fontSizePx: FONT_SIZE_VALUES[fontSize],
      reduceMotion,
      highContrast,
      dark,
      surface: effectiveSurface,
      scene,
      palette,
      underlineLinks: accessibility.underlineLinks,
      largeFocus: accessibility.largeFocus,
      legibleFont: accessibility.legibleFont,
      textSpacing: accessibility.textSpacing,
      announceUpdates: accessibility.announceUpdates,
      detected: {
        reduceMotion: accessibility.reduceMotion === 'auto',
        highContrast: accessibility.highContrast === 'auto',
        dark: theme === 'system',
      },
      ready: hydrated,
    };
  }, [
    language,
    fontSize,
    theme,
    accessibility,
    surface,
    palette,
    hydrated,
    deviceReduceMotion,
    deviceContrast,
    deviceDark,
    sceneSetting,
  ]);
}

/** Human label for the active language, for announcements and the picker. */
export function useLanguageLabel() {
  const language = useAppStore((s) => s.language);
  const meta = languageMeta(language);
  return { code: language, name: meta.name, nativeName: meta.nativeName, dir: meta.dir };
}
