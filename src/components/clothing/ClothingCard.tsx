'use client';

import { BadgeCheck, Clock, ExternalLink, MapPin, Phone, TriangleAlert, Users } from 'lucide-react';
import { useI18n } from '@/i18n/hook';
import { clothingContent } from '@/i18n/clothingContent';
import { spokenLanguage } from '@/i18n/spokenLanguages';
import { Badge } from '@/components/ui/Badge';
import { BOSTON_TZ, formatWindowForLocale, windowsForDay, zonedParts } from '@/lib/hours';
import { useHydratedNow } from '@/hooks/useNow';
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
  const { t, lang, meta, format } = useI18n();
  const content = clothingContent(place, lang);
  const season = place.season?.from && place.season?.to
    ? `${format.date(new Date(`${place.season.from}T00:00:00`), 'long')} – ${format.date(new Date(`${place.season.to}T00:00:00`), 'long')}`
    : place.season?.label;
  const c = place.computed;
  // "Today" is the place's today: a coat closet on Columbia Road opens on
  // Boston's calendar, not the visitor's device timezone — and the reading
  // re-decides every minute on the real clock, so an 8 PM closing flips at 8.
  const now = useHydratedNow(60_000);
  const todayWindows = place.hours && now !== null ? windowsForDay(place.hours, zonedParts(new Date(now), BOSTON_TZ).weekday) : [];
  const sourceCheckDate = place.sourceCheck?.checkedAt
    ? `${format.date(place.sourceCheck.checkedAt, 'medium')} ${format.time(place.sourceCheck.checkedAt)}`
    : '';
  const mapsUrl = place.address && place.directionsAllowed !== false
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}`
    : null;

  return (
    <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 shadow-[var(--shadow)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-heading text-base font-extrabold leading-snug" lang={content.nameLanguage} dir="auto">{content.name}</h3>
          <p className="text-xs text-[var(--color-text-muted)]" lang={content.neighborhoodLanguage} dir="auto">{content.neighborhood}</p>
        </div>
        <Badge variant="green">{t(place.cost === 'mixed' ? 'clothing.freeOrReduced' : 'clothing.free')}</Badge>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <Badge variant="blue">{t(`clothing.kind.${place.kind}` as TranslationKey)}</Badge>
        {c?.openNow === true && <Badge variant="green">{t('clothing.siteOpenNow')}</Badge>}
        {c?.openNow === false && <Badge variant="default">{t('clothing.siteClosedNow')}</Badge>}
        {c?.inSeason === true && <Badge variant="green">{t(place.season?.purpose === 'collection' ? 'clothing.collectionActive' : 'clothing.inSeason')}</Badge>}
        {c?.inSeason === false && <Badge variant="amber">{t(place.season?.purpose === 'collection' ? 'clothing.collectionOutside' : 'clothing.outSeason')}</Badge>}
        {place.requiresId === true && <Badge variant="amber">{t('clothing.idNeeded')}</Badge>}
        {place.requiresId === false && <Badge variant="default">{t('clothing.noId')}</Badge>}
        {(place.verification.status === 'needs-review' || (c && c.checkLevel !== 'fresh')) && (
          <Badge variant="amber">{t('clothing.needsReview')}</Badge>
        )}
      </div>

      {content.fellBack && <p className="mt-2 text-xs text-[var(--color-text-muted)]">{content.summaryLanguage === lang ? t('lang.someEnglish') : t('lang.untranslated', { language: meta.nativeName })}</p>}
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]" lang={content.summaryLanguage} dir="auto">{content.summary}</p>

      <div className="mt-3 rounded-[var(--radius-md)] bg-[var(--color-bg-secondary)] p-3">
        <p className="font-heading text-xs font-bold uppercase tracking-wide text-[var(--color-accent-primary)]">{t('clothing.howToGet')}</p>
        <p className="mt-1 text-sm leading-relaxed" lang={content.howToGetLanguage} dir="auto">{content.howToGet}</p>
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
              <span lang={content.eligibilityLanguage} dir="auto">{content.eligibility}</span>
            </p>
          </div>
        )}
        {(todayWindows.length > 0 || place.hoursNote) && (
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)]" aria-hidden="true" />
            <p>
              <span className="font-heading font-bold">{t('clothing.hours')}: </span>
              {todayWindows.length > 0 && <span>{t('weather.today')} {todayWindows.map((w) => formatWindowForLocale(w, meta.intlLocale)).join(', ')}. </span>}
              {place.hoursNote && <span lang={content.hoursNoteLanguage} dir="auto">{content.hoursNote}</span>}
            </p>
          </div>
        )}
        {place.languages && place.languages.length > 0 && (
          <p>
            <span className="font-heading font-bold">{t('common.spokenLanguages')}: </span>
            {place.languages.map((language) => spokenLanguage(language, t)).join(', ')}
          </p>
        )}
        {place.season && (
          <p>
            <span className="font-heading font-bold">{t(place.season?.purpose === 'collection' ? 'clothing.collectionDates' : 'clothing.seasonLabel')}: </span>
            <span dir="auto">{season}</span>
          </p>
        )}
        {place.address && (
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)]" aria-hidden="true" />
            <p dir="auto" lang={content.addressLanguage}>
              {content.address}
              {place.transit && <span lang={content.transitLanguage} dir="auto" className="block text-[var(--color-text-muted)]">{content.transit}</span>}
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
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
          {t('clothing.checkedOn', { date: format.date(place.verification.checkedOn, 'medium') })}
        </span>
        <span aria-hidden="true">·</span>
        {place.sourceCheck?.reachable === true ? (
          <span>{t('clothing.sourceReachable', { time: sourceCheckDate })}</span>
        ) : place.sourceCheck?.reachable === false ? (
          <span className="inline-flex items-center gap-1 font-semibold text-[var(--color-accent-amber)]">
            <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
            {t('clothing.sourceDown', { time: sourceCheckDate })}
          </span>
        ) : (
          <span>{t('clothing.sourceUnchecked')}</span>
        )}
      </p>
    </article>
  );
}
