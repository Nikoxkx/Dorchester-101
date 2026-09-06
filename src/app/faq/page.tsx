'use client';

import { useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';
import { FAQ_CATEGORIES } from '@/data/faq';
import { GlassButton } from '@/components/glass/GlassControls';
import { Search, PhoneCall, Languages, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FaqPage() {
  return (
    <MainLayout>
      <FaqView />
    </MainLayout>
  );
}

function FaqView() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [open, setOpen] = useState<Set<string>>(new Set());

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQ_CATEGORIES.map((cat) => ({
      ...cat,
      faqs: cat.faqs.filter((f) => {
        if (category !== 'all' && cat.id !== category) return false;
        if (!q) return true;
        return `${f.q} ${f.a}`.toLowerCase().includes(q);
      }),
    })).filter((cat) => cat.faqs.length > 0);
  }, [query, category]);

  const toggle = (key: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-large font-bold tracking-tight text-1">{t('faq.title')}</h1>
        <p className="text-title3 text-text-2 mt-1.5 max-w-2xl leading-snug">{t('faq.description')}</p>
      </header>

      <div className="flex flex-wrap items-center gap-2 no-print">
        <label className="glass glass-clear glass-edge flex items-center gap-2 rounded-full h-10 px-4 flex-1 min-w-56 max-w-md">
          <Search className="w-4 h-4 text-text-3 shrink-0" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('faq.searchPlaceholder')}
            aria-label={t('common.search')}
            className="w-full bg-transparent outline-none text-subhead text-1 placeholder:text-text-3"
          />
        </label>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('faq.allTopics')}>
          <button
            onClick={() => setCategory('all')}
            aria-pressed={category === 'all'}
            className={cn(
              'h-8 px-3.5 rounded-full text-caption font-semibold',
              category === 'all' ? 'bg-ink text-canvas' : 'glass glass-clear glass-edge text-1',
            )}
          >
            {t('faq.allTopics')}
          </button>
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              aria-pressed={category === cat.id}
              className={cn(
                'h-8 px-3.5 rounded-full text-caption font-semibold',
                category === cat.id ? 'bg-ink text-canvas' : 'glass glass-clear glass-edge text-1',
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {results.length === 0 && (
        <div className="content-card squircle p-10 text-center">
          <p className="text-body font-semibold text-1">{t('common.empty')}</p>
          <p className="text-subhead text-text-2 mt-1.5">{t('projects.tryDifferent')}</p>
        </div>
      )}

      <div className="space-y-6">
        {results.map((cat) => (
          <section key={cat.id} aria-label={cat.name}>
            <h2 className="text-title2 font-bold text-1 mb-2.5">{cat.name}</h2>
            <ul className="space-y-2">
              {cat.faqs.map((faq, i) => {
                const key = `${cat.id}-${i}`;
                const isOpen = open.has(key);
                return (
                  <li key={key} className="content-card squircle overflow-hidden print-block">
                    <h3>
                      <button
                        onClick={() => toggle(key)}
                        aria-expanded={isOpen}
                        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-start focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-current"
                      >
                        <span className="text-subhead font-semibold text-1 leading-snug">{faq.q}</span>
                        <ChevronDown
                          className={cn('w-4 h-4 shrink-0 text-text-3 transition-transform', isOpen && 'rotate-180')}
                          aria-hidden
                        />
                      </button>
                    </h3>
                    {isOpen && (
                      <div className="px-5 pb-5">
                        <div className="text-footnote text-text-1 leading-relaxed whitespace-pre-line">{faq.a}</div>
                        {language !== 'en' && (
                          <p className="mt-3 flex items-start gap-2 text-caption text-text-2 bg-[var(--surface)] rounded-[var(--radius-sm)] p-3">
                            <Languages className="w-4 h-4 shrink-0 mt-0.5 text-text-2" aria-hidden />
                            {t('faq.interpretation')}
                          </p>
                        )}
                        {faq.sources.length > 0 && (
                          <p className="text-caption2 text-text-3 mt-3">
                            {t('common.sources')}:{' '}
                            {faq.sources.map((s, si) => (
                              <span key={s.name}>
                                {si > 0 && ' · '}
                                <a
                                  href={s.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline underline-offset-2 hover:text-1"
                                >
                                  {s.name}
                                </a>
                              </span>
                            ))}
                          </p>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <section aria-label={t('faq.stillQuestions')} className="content-card squircle p-5">
        <p className="kicker">{t('faq.stillQuestions')}</p>
        <p className="text-subhead text-text-2 mt-1.5">{t('faq.reachOut')}</p>
        <a
          href="tel:211"
          className="mt-3.5 inline-flex items-center gap-2 h-11 px-5 rounded-full bg-ink text-canvas text-subhead font-semibold hover:opacity-85 no-print"
        >
          <PhoneCall className="w-4 h-4" strokeWidth={2} aria-hidden />
          <span className="num">2-1-1</span>
        </a>
        <div className="mt-4 no-print">
          <GlassButton size="sm" onClick={() => (window.location.href = '/resources')}>
            {t('footer.directory')} →
          </GlassButton>
        </div>
      </section>
    </div>
  );
}
