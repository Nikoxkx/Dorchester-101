'use client';

/**
 * Compatibility shim.
 *
 * The implementation moved to `src/i18n` (typed dictionary per locale, Intl
 * formatting, RTL metadata). Older imports keep working, and the previous
 * `availableLanguages` shape is preserved minus the `flag` field: flag emoji do
 * not render on Windows, which is the primary target of the desktop build, and
 * a flag maps a language to a single country, which is wrong for Kreyòl,
 * Portuguese, Cape Verdean and Arabic in Dorchester.
 */

export { useTranslation, useI18n } from '@/i18n/hook';
export type { TranslationKey } from '@/i18n/en';
export { LANGUAGES as availableLanguages, languageMeta, isRtl } from '@/i18n/config';
export { dictionaries, localeCoverage, missingKeys, TOTAL_KEYS } from '@/i18n';
export { pick, type Localized } from '@/i18n/runtime';
