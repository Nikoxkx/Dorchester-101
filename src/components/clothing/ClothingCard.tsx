'use client';

import { BadgeCheck, Clock, ExternalLink, MapPin, Phone, TriangleAlert, Users } from 'lucide-react';
import { useI18n } from '@/i18n/hook';
import { Badge } from '@/components/ui/Badge';
import { BOSTON_TZ, formatWindow, windowsForDay, zonedParts } from '@/lib/hours';
import { useNow } from '@/hooks/useNow';
import type { WinterClothingPlace } from '@/data/winterClothing';
import type { TranslationKey } from '@/i18n/en';

/**
 * One free-clothing listing with everything a cold reader needs before
 * travelling: what is given away, who it is for, the exact next step, the
 * hours (or an honest "call for hours"), the ID rule, and two dates — the
 * last hand check and the last time the official page answered. Live
 * computed fields come from `/api/winter-clothing`; when no server is
 * behind the page the view computes what it can locally and the source
 * check honestly reports itself unavailable.
 */

export interface ClothingPlaceView extends WinterClothingPlace {
  computed?: { openNow: boolean | null; inSeason: boolean | null; checkedAgeDays: number; checkLevel: 'fresh' | 'stale' | 'critical' };
  sourceCheck?: { reachable: boolean | 'unchecked'; status: number | null; checkedAt: string };
}

export function ClothingCard({ place }: { place: ClothingPlaceView }) {
  const { t, format, pickContent } = useI18n();
  const summary = pickContent(place.summary);
  const c = place.computed;
  // "Today" is the place's today: a coat closet on Columbia Road opens on
  // Boston's calendar, not the visitor's device timezone — and the reading
  // re-decides every minute on the real clock, so an 8 PM closing flips at 8.
  const now = useNow(60_000);
  const todayWindows = place.hours ? windowsForDay(place.hours, zonedParts(new Date(now), BOSTON_TZ).weekday) : [];
  const mapsUrl = place.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}`
    : null;

  return (
    <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 shadow-[var(--shadow)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-heading text-base font-extrabold leading-snug" dir="auto">{place.name}</h3>
          <p className="text-xs text-[var(--color-text-muted)]">{place.neighborhood}</p>
        </div>
        <Badge variant="green">{t('clothing.free')}</Badge>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <Badge variant="blue">{t(`clothing.kind.${place.kind}` as TranslationKey)}</Badge>
        {c?.openNow === true && <Badge variant="green">{t('clothing.openNow')}</Badge>}
        {c?.openNow === false && <Badge variant="default">{t('clothing.closedNow')}</Badge>}
        {c?.inSeason === true && <Badge variant="green">{t('clothing.inSeason')}</Badge>}
        {c?.inSeason === false && <Badge variant="amber">{t('clothing.outSeason')}</Badge>}
        {c?.inSeason === null && <Badge variant="default">{t('clothing.yearRound')}</Badge>}
        {place.requiresId === true && <Badge variant="amber">{t('clothing.idNeeded')}</Badge>}
        {place.requiresId === false && <Badge variant="default">{t('clothing.noId')}</Badge>}
        {c && c.checkLevel !== 'fresh' && (
          <Badge variant="amber">{t('clothing.checkedOn', { date: format.date(place.verification.checkedOn, 'medium') })}</Badge>
        )}
      </div>

      <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]" dir="auto">{summary.value}</p>

      <div className="mt-3 rounded-[var(--radius-md)] bg-[var(--color-bg-secondary)] p-3">
        <p className="font-heading text-xs font-bold uppercase tracking-wide text-[var(--color-accent-primary)]">{t('clothing.howToGet')}</p>
        <p className="mt-1 text-sm leading-relaxed" dir="auto">{place.howToGet}</p>
      </div>

      <dl className="mt-3 grid gap-2 text-xs">
        <div>
          <dt className="font-heading font-bold uppercase tracking-wide text-[var(--color-text-muted)]">{t('clothing.whatYouGet')}</dt>
          <dd className="mt-1 flex flex-wrap gap-1">
            {place.offers.map((offer) => (
              <span key={offer} className="rounded-full bg-[var(--color-accent-primary)]/10 px-2 py-0.5 font-heading text-[11px] font-bold text-[var(--color-accent-primary)]">
                {t(`clothing.offer.${offer}` as TranslationKey)}
              </span>
            ))}
          </dd>
        </div>
        {place.eligibility && (
          <div className="flex items-start gap-2">
            <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)]" aria-hidden="true" />
            <p>
              <span className="font-heading font-bold">{t('clothing.whoFor')}: </span>
              <span dir="auto">{place.eligibility}</span>
            </p>
          </div>
        )}
        {(todayWindows.length > 0 || place.hoursNote) && (
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)]" aria-hidden="true" />
            <p>
              <span className="font-heading font-bold">{t('clothing.hours')}: </span>
              {todayWindows.length > 0 && <span>{t('weather.today')} {todayWindows.map((w) => formatWindow(w)).join(', ')}. </span>}
              {place.hoursNote && <span dir="auto">{place.hoursNote}</span>}
            </p>
          </div>
        )}
        {place.season && (
          <p>
            <span className="font-heading font-bold">{t('clothing.seasonLabel')}: </span>
            <span dir="auto">{place.season.label}</span>
          </p>
        )}
        {place.address && (
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)]" aria-hidden="true" />
            <p dir="auto">
              {place.address}
              {place.transit && <span className="block text-[var(--color-text-muted)]">{place.transit}</span>}
            </p>
          </div>
        )}
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        {place.phone && (
          <a href={`tel:${place.phone.replace(/[^+\d]/g, '')}`} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-primary)] px-3.5 py-1.5 font-heading text-sm font-bold text-white transition-transform active:scale-[0.98]">
            <Phone className="h-4 w-4" aria-hidden="true" /> {t('clothing.call')} {place.phone}
          </a>
        )}
        {mapsUrl && (
          <a href={mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] px-3.5 py-1.5 font-heading text-sm font-bold">
            <MapPin className="h-4 w-4" aria-hidden="true" /> {t('clothing.directions')}
          </a>
        )}
        <a href={place.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] px-3.5 py-1.5 font-heading text-sm font-bold">
          {t('clothing.visitSite')} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>

      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-[var(--color-border)] pt-2.5 text-[11px] text-[var(--color-text-muted)]">
        <span className="inline-flex items-center gap-1">
          <BadgeCheck className="h-3.5 w-3.5 text-[var(--color-accent-green)]" aria-hidden="true" />
          {t('clothing.checkedOn', { date: format.date(place.verification.checkedOn, 'medium') })}
        </span>
        <span aria-hidden="true">·</span>
        {place.sourceCheck?.reachable === true ? (
          <span>{t('clothing.sourceReachable', { time: format.time(place.sourceCheck.checkedAt) })}</span>
        ) : place.sourceCheck?.reachable === false ? (
          <span className="inline-flex items-center gap-1 font-semibold text-[var(--color-accent-amber)]">
            <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
            {t('clothing.sourceDown', { time: format.time(place.sourceCheck.checkedAt) })}
          </span>
        ) : (
          <span>{t('clothing.sourceUnchecked')}</span>
        )}
      </p>
    </article>
  );
}
