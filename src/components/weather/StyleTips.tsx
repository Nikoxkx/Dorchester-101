'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Shirt } from 'lucide-react';
import { buildStyleTips, type WeatherPayload } from '@/lib/weather';
import { useNow } from '@/hooks/useNow';
import { useI18n } from '@/i18n/hook';
import { SCOPE_KEY, TIP_ICON, tipText, tipsNeedCoat, type TempUnit } from './shared';

/**
 * "What to wear" — the live forecast translated into clothing.
 *
 * The tips are recomputed from the payload every render (`buildStyleTips` is
 * pure), so they change with the hour, not just the date: the same forecast
 * read at 7 AM leads with the cold morning, at 3 PM with tonight's drop. When
 * a tip says a warm coat is genuinely needed, the free-coats link appears
 * with it — advice to wear a coat is incomplete for a reader who has none.
 */
export function StyleTips({
  payload,
  unit,
  limit,
  headingLevel = 3,
}: {
  payload: WeatherPayload;
  unit: TempUnit;
  limit?: number;
  headingLevel?: 2 | 3;
}) {
  const { t, format } = useI18n();
  // Re-derived on the minute tick as well as on every new payload, so the
  // advice follows the day: a tip that was right at 7 AM ("cold start") is
  // replaced by tonight's layer warning without a reload, and a fresh
  // forecast with a different temperature re-runs the coat ladder at once.
  const now = useNow(60_000);
  const tips = useMemo(() => buildStyleTips(payload, new Date(now)), [payload, now]);
  const shown = limit ? tips.slice(0, limit) : tips;
  const Heading = headingLevel === 2 ? 'h2' : 'h3';

  return (
    <div>
      <Heading className="flex items-center gap-2 font-heading text-base font-bold">
        <Shirt className="h-4 w-4 text-[var(--color-accent-primary)]" aria-hidden="true" />
        {t('weather.tipsTitle')}
      </Heading>
      <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{t('weather.tipsSubtitle')}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {shown.map((tip) => {
          const Icon = TIP_ICON[tip.kind];
          return (
            <li
              key={tip.kind}
              className="flex items-start gap-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5"
            >
              <span className="mt-0.5 shrink-0 rounded-[var(--radius-sm)] bg-[var(--color-accent-primary)]/12 p-1.5 text-[var(--color-accent-primary)]">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="font-heading text-[10px] font-bold uppercase tracking-wide text-[var(--color-accent-primary)]">
                  {t(SCOPE_KEY[tip.scope])}
                </span>
                <span className="block text-sm leading-snug text-[var(--color-text-primary)]">{tipText(t, tip, unit, format)}</span>
              </span>
            </li>
          );
        })}
      </ul>
      {tipsNeedCoat(tips) && (
        <Link
          href="/winter-clothing"
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-primary)] px-4 py-2 font-heading text-sm font-bold text-white transition-transform active:scale-[0.98]"
        >
          {t('weather.noCoatCta')} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
