'use client';

import { HOTLINES } from '@/data/programs';
import { telHref } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';
import { Phone } from 'lucide-react';

/**
 * EmergencyBanner — hotlines. System red appears here because it carries
 * meaning (emergency), and the surface stays flat and opaque (content layer):
 * red numbers on light ground keep WCAG AA; the call buttons are solid
 * accessible red with white text.
 */
export function EmergencyBanner() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const featured = HOTLINES[0];
  const rest = HOTLINES.slice(1);

  return (
    <section
      aria-label={t('emergency.title')}
      className="content-card squircle overflow-hidden"
      style={{ background: 'color-mix(in srgb, var(--red-fill) 7%, var(--canvas))' }}
    >
      <div className="p-5 md:p-7">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
          <div className="min-w-0">
            <p className="kicker text-danger">{t('emergency.title')}</p>
            <p className="text-subhead text-text-2 mt-1.5 max-w-xl">{t('emergency.body')}</p>
          </div>
          <a
            href={telHref(featured.phone)}
            className="shrink-0 inline-flex items-center gap-2.5 rounded-full px-6 h-12 font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ background: 'var(--red-text)' }}
          >
            <Phone className="w-4.5 h-4.5" strokeWidth={2} aria-hidden />
            <span className="text-start leading-tight">
              <span className="block text-caption2 font-semibold uppercase tracking-wider opacity-80">
                {featured.name}
              </span>
              <span className="block text-title3 num">{featured.phone}</span>
            </span>
          </a>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-5">
          {rest.map((h) => (
            <a
              key={h.id}
              href={telHref(h.phone)}
              className="content-card group flex items-start gap-3 p-3.5 rounded-[var(--radius-sm)] transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            >
              <Phone className="w-4 h-4 mt-0.5 shrink-0 text-danger" strokeWidth={2} aria-hidden />
              <span className="min-w-0">
                <span className="block text-caption2 font-semibold uppercase tracking-wider text-text-2">
                  {h.name}
                </span>
                <span className="block text-body font-bold text-danger num">{h.phone}</span>
                <span className="block text-caption text-text-2 mt-0.5 leading-snug">{h.blurb}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
