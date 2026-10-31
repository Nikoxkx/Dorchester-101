'use client';

import { useI18n } from '@/i18n/hook';
import { localizeShortForecast } from '@/i18n/weatherForecast';

/** Exact recognized short phrases are localized; unknown wording stays intact. */
export function ForecastText({ text, className }: { text: string; className?: string }) {
  const { lang } = useI18n();
  const localized = localizeShortForecast(text, lang);
  return <span lang={localized.language} dir="auto" className={className}>{localized.text}</span>;
}
