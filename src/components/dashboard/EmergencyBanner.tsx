'use client';

import { Phone } from 'lucide-react';
import { useI18n } from '@/i18n/hook';

/**
 * The "help today" band: the two phone numbers that reach food, shelter
 * and rent help with interpreters on the line (Project Bread's FoodSource
 * Hotline and Mass 2-1-1). It is dressed as an ordinary site card — card
 * tokens, the shared aurora wash, the surface blur, site buttons — so the
 * resident's palette, surface and homepage card style style it exactly
 * like every other section. (It used to be a flat accent slab with a
 * harbor-navy button hardcoded into it: the loudest block on the page,
 * in somebody else's colors.) Safety copy, calm clothes.
 */
export function EmergencyBanner() {
  const { t } = useI18n();

  return (
    <section
      aria-labelledby="home-emergency-title"
      className="dor101-glass relative isolate overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 shadow-[var(--shadow)] md:p-6"
    >
      <div aria-hidden="true" className="dor101-aurora-wash pointer-events-none absolute inset-0 -z-10" />
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-start gap-4">
          <span
            className="grid shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-secondary))] p-3 text-white shadow-sm"
            aria-hidden="true"
          >
            <Phone className="h-6 w-6" />
          </span>
          <div>
            <h2 id="home-emergency-title" className="mb-1 font-heading text-lg font-semibold text-[var(--color-text-primary)]">
              {t('emergency.title')}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)]">{t('emergency.body')}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="tel:18006458333"
            className="flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-secondary))] px-4 py-2.5 font-heading font-bold text-white shadow-[var(--shadow)] transition-transform hover:scale-[1.03] active:scale-95"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            <span>1-800-645-8333</span>
            <span className="text-xs opacity-80">({t('emergency.foodLabel')})</span>
          </a>
          <a
            href="tel:211"
            className="flex items-center justify-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-secondary)] px-4 py-2.5 font-heading font-bold text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-tertiary)]"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            <span>2-1-1</span>
            <span className="text-xs opacity-75">({t('emergency.allLabel')})</span>
          </a>
        </div>
      </div>
    </section>
  );
}
