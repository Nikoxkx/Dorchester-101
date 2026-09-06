'use client';

import { useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';
import { useToast } from '@/stores/toastStore';
import { useShare } from '@/lib/share';
import { GlassButton, GlassSegmented } from '@/components/glass/GlassControls';
import { FOOD_SITES, type FoodSite } from '@/data/food';
import { isOpenNow } from '@/lib/hours';
import { telHref } from '@/lib/utils';
import { formatFor } from '@/lib/i18n';
import {
  Heart, Phone, Globe, Share2, MapPin, ShoppingCart, Search, Clock3, Printer,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SiteFilter = 'all' | 'Food Pantry' | 'Hot Meals' | 'Mobile Market';

export default function FoodPage() {
  return (
    <MainLayout>
      <FoodView />
    </MainLayout>
  );
}

function FoodView() {
  const { language } = useAppStore();
  const { t, formatFor } = useTranslation(language);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SiteFilter>('all');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FOOD_SITES.filter((s) => {
      if (filter !== 'all' && s.type !== filter) return false;
      if (!q) return true;
      return `${s.name} ${s.neighborhood} ${s.address} ${s.foodTypes.join(' ')}`.toLowerCase().includes(q);
    });
  }, [query, filter]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-large font-bold tracking-tight text-1">{t('food.title')}</h1>
        <p className="text-title3 text-text-2 mt-1.5 max-w-2xl leading-snug">{t('food.description')}</p>
      </header>

      <section aria-label={t('food.needFoodToday')} className="content-card squircle p-5">
        <p className="kicker text-danger">{t('food.needFoodToday')}</p>
        <p className="text-subhead text-text-2 mt-1.5 max-w-2xl">{t('food.callHotline')}</p>
        <a
          href="tel:18006458333"
          className="mt-4 inline-flex items-center gap-2.5 h-12 px-6 rounded-full font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'var(--red-text)' }}
        >
          <Phone className="w-4.5 h-4.5" strokeWidth={2} aria-hidden />
          <span className="num text-title3">1-800-645-8333</span>
        </a>
        <p className="text-caption2 text-text-3 mt-2.5">
          {t('common.source')}: Project Bread FoodSource Hotline
        </p>
      </section>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 no-print">
        <label className="glass glass-clear glass-edge flex items-center gap-2 rounded-full h-10 px-4 flex-1 min-w-56 max-w-md">
          <Search className="w-4 h-4 text-text-3 shrink-0" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('common.search')}
            aria-label={t('common.search')}
            className="w-full bg-transparent outline-none text-subhead text-1 placeholder:text-text-3"
          />
        </label>
        <GlassSegmented<SiteFilter>
          ariaLabel={t('food.title')}
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: t('food.filters.all') },
            { value: 'Food Pantry', label: t('food.filters.pantry') },
            { value: 'Hot Meals', label: t('food.filters.meals') },
          ]}
        />
        <GlassButton
          size="md"
          onClick={() => window.print()}
          icon={<Printer className="w-4 h-4" aria-hidden />}
        >
          {t('common.print')}
        </GlassButton>
      </div>

      {/* Results */}
      <p className="text-caption font-semibold uppercase tracking-wider text-text-3" aria-live="polite">
        {formatFor.number(results.length)} {t('common.results')}
      </p>
      {results.length === 0 ? (
        <div className="content-card squircle p-10 text-center">
          <p className="text-body font-semibold text-1">{t('common.empty')}</p>
          <p className="text-subhead text-text-2 mt-1.5">{t('projects.tryDifferent')}</p>
        </div>
      ) : (
        <ul className="grid md:grid-cols-2 gap-3">
          {results.map((s) => (
            <li key={s.id}>
              <FoodCard site={s} />
            </li>
          ))}
        </ul>
      )}

      {/* SNAP guide */}
      <section aria-label={t('food.snapTitle')} className="content-card squircle p-5 md:p-6 print-block">
        <h2 className="text-title2 font-bold text-1 flex items-center gap-2.5">
          <ShoppingCart className="w-5 h-5" strokeWidth={2} aria-hidden />
          {t('food.snapTitle')}
        </h2>
        <p className="text-subhead text-text-2 mt-2 max-w-3xl leading-relaxed">{t('food.snapBody')}</p>
        <div className="flex flex-wrap gap-2 mt-4 no-print">
          <a
            href="https://www.mass.gov/snap-benefits"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-ink text-canvas text-subhead font-semibold hover:opacity-85"
          >
            {t('common.applyNow')}
          </a>
          <a
            href="tel:18775137733"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-full glass glass-clear glass-edge text-subhead font-semibold text-1"
          >
            <Phone className="w-4 h-4" strokeWidth={2} aria-hidden />
            <span className="num">DTA: 1-877-513-7333</span>
          </a>
        </div>
        <p className="text-caption2 text-text-3 mt-4">
          {t('common.source')}: Massachusetts DTA · SNAP FY2026 amounts verified 2026-09-06
        </p>
      </section>
    </div>
  );
}

function FoodCard({ site }: { site: FoodSite }) {
  const { language } = useAppStore();
  const { t, formatFor } = useTranslation(language);
  const toast = useToast();
  const share = useShare();
  const { favorites, toggleFavorite } = useAppStore();
  const saved = favorites.some((f) => f.id === `food-${site.id}`);
  const open = isOpenNow(site.hours);
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  const todayName = days[new Date().getDay()];

  const mapsUrl = site.lat
    ? `https://www.google.com/maps/dir/?api=1&destination=${site.lat},${site.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}`;

  return (
    <article className="content-card squircle p-5 h-full flex flex-col print-block">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-body font-bold text-1 leading-snug">{site.name}</h2>
          <p className="text-caption text-text-2 mt-0.5">
            {t(`food.type.${site.type === 'Food Pantry' ? 'pantry' : site.type === 'Hot Meals' ? 'meals' : site.type === 'Mobile Market' ? 'mobile' : 'hotline'}` as const)}
            {' · '}
            {site.neighborhood}
          </p>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-caption2 font-bold uppercase tracking-wider shrink-0',
            open ? 'text-success' : 'text-text-3',
          )}
        >
          <span aria-hidden className={cn('dot', open ? 'dot-open' : 'dot-pending')} />
          {open ? t('common.open') : t('common.closed')}
        </span>
      </div>

      <p className="text-footnote text-text-1 mt-3">{site.address}</p>

      <div className="mt-3">
        <p className="text-caption2 font-semibold uppercase tracking-wider text-text-2 flex items-center gap-1.5">
          <Clock3 className="w-3.5 h-3.5" aria-hidden />
          {t('food.hoursTitle')}
        </p>
        <ul className="mt-1 space-y-0.5">
          {days.map((d) => {
            const hours = site.hours[d];
            if (!hours || /closed/i.test(hours)) return null;
            const isToday = d === todayName;
            return (
              <li
                key={d}
                className={cn(
                  'flex justify-between gap-3 text-caption num',
                  isToday ? 'font-bold text-1' : 'text-text-2',
                )}
              >
                <span>{formatFor.date(new Date(2026, 0, 4 + days.indexOf(d)), { weekday: 'short' })}</span>
                <span>{hours}</span>
              </li>
            );
          })}
        </ul>
        <p className="text-caption2 text-text-3 mt-1.5">{t('food.hoursNote')}</p>
      </div>

      {site.requirements && (
        <p className="text-caption text-text-2 mt-3">
          <span className="font-semibold text-1">{t('food.requirements')}: </span>
          {site.requirements}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5 mt-3">
        {site.foodTypes.slice(0, 4).map((f) => (
          <span key={f} className="text-caption2 font-semibold bg-[var(--surface-2)] text-text-2 rounded-full px-2.5 py-1">
            {f}
          </span>
        ))}
        {site.acceptsEbt && (
          <span className="text-caption2 font-semibold bg-success-fill/15 text-success rounded-full px-2.5 py-1">
            {t('food.acceptsEbt')}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-4 no-print">
        <a
          href={telHref(site.phone)}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full glass glass-clear glass-edge text-footnote font-semibold text-1"
        >
          <Phone className="w-3.5 h-3.5" strokeWidth={2} aria-hidden />
          <span className="num">{site.phone}</span>
        </a>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full glass glass-clear glass-edge text-footnote font-semibold text-1"
        >
          <MapPin className="w-3.5 h-3.5" strokeWidth={2} aria-hidden />
          {t('common.directions')}
        </a>
        {site.website && (
          <a
            href={site.website}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-full glass glass-clear glass-edge text-1"
            aria-label={`${t('common.website')} — ${site.name}`}
          >
            <Globe className="w-4 h-4" strokeWidth={2} aria-hidden />
          </a>
        )}
        <span className="ms-auto flex items-center gap-1.5">
          <button
            onClick={() => {
              const added = toggleFavorite({
                id: `food-${site.id}`,
                kind: 'food',
                title: site.name,
                href: '/food',
              });
              toast(added ? t('food.saved') : t('saved.removed'), 'success');
            }}
            className="p-2.5 rounded-full glass glass-clear glass-edge text-1 hover:bg-[var(--glass-clear-hover)]"
            aria-label={`${saved ? t('saved.remove') : t('common.save')} — ${site.name}`}
            aria-pressed={saved}
          >
            <Heart className={cn('w-4 h-4', saved && 'fill-danger text-danger')} strokeWidth={2} aria-hidden />
          </button>
          <button
            onClick={() => void share({ title: site.name, text: `${site.name} — ${site.address}`, url: mapsUrl })}
            className="p-2.5 rounded-full glass glass-clear glass-edge text-1 hover:bg-[var(--glass-clear-hover)]"
            aria-label={`${t('common.share')} — ${site.name}`}
          >
            <Share2 className="w-4 h-4" strokeWidth={2} aria-hidden />
          </button>
        </span>
      </div>

      <p className="text-caption2 text-text-3 mt-3">
        {t('common.lastVerified')}: {formatFor.date(site.lastVerified)}
      </p>
    </article>
  );
}
