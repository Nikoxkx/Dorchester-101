'use client';

import { useState } from 'react';
import { ChevronDown, PhoneCall } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn, telHref } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';
import { HOTLINES } from '@/data/programs';

interface FaqCat {
  id: string;
  name: string;
  faqs: { q: string; a: string; sources: { name: string; url: string }[] }[];
}

export default function FAQPage() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const { data, loading } = useApi<{ categories: FaqCat[] }>('/api/faq');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [open, setOpen] = useState<string | null>(null);

  const cats = data?.categories || [];
  const shown = cats.filter((c) => cat === 'all' || c.id === cat);

  const searchHits = q.length > 2
    ? cats.flatMap((c) => c.faqs.filter((f) => `${f.q} ${f.a}`.toLowerCase().includes(q.toLowerCase())).map((f) => ({ ...f, category: c.name })))
    : [];

  return (
    <MainLayout>
      <div className="grid lg:grid-cols-[1fr_280px] gap-8 items-start">
        <div className="space-y-6 min-w-0">
          <header className="pb-6 border-b border-[var(--line)]">
            <p className="kicker mb-3">Straight answers</p>
            <h1 className="font-display text-[clamp(2.2rem,4.5vw,3.75rem)] font-black leading-[0.95] tracking-[-0.03em] text-[var(--charcoal)]">{t('faq.title')}</h1>
            <p className="text-[var(--ink-soft)] mt-4 max-w-2xl leading-relaxed">{t('faq.description')}</p>
          </header>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('faq.searchPlaceholder')}
            className="w-full px-4 py-3 bg-[var(--paper)] border border-[var(--line)] rounded-xl text-sm outline-none focus:border-[var(--charcoal)]"
            aria-label="Search questions"
          />

          {loading && <LoadingSpinner />}

          {q.length > 2 ? (
            <ul className="space-y-2.5">
              {searchHits.length === 0 && (
                <div className="desk-card p-8 text-center">
                  <p className="font-display text-xl font-bold">No answers match that yet.</p>
                  <p className="text-sm text-[var(--muted)] mt-1">Try &ldquo;Section 8&rdquo;, &ldquo;SNAP&rdquo;, or &ldquo;eviction&rdquo; — or call 2-1-1 and ask a person.</p>
                </div>
              )}
              {searchHits.map((faq) => (
                <li key={faq.q} className="desk-card overflow-hidden">
                  <button onClick={() => setOpen(open === faq.q ? null : faq.q)} aria-expanded={open === faq.q} className="w-full p-4 text-left flex justify-between gap-3 hover:bg-[var(--wax)] transition-colors">
                    <span><span className="kicker block mb-1.5">{faq.category}</span>{faq.q}</span>
                    <ChevronDown className={cn('w-4 h-4 shrink-0 transition-transform', open === faq.q && 'rotate-180')} />
                  </button>
                  {open === faq.q && <div className="px-4 pb-4 text-sm whitespace-pre-wrap leading-relaxed text-[var(--ink-soft)]">{faq.a}</div>}
                </li>
              ))}
            </ul>
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setCat('all')} aria-pressed={cat === 'all'} className={cat === 'all' ? 'bg-[var(--charcoal)] text-[var(--paper)] px-3.5 py-1.5 text-xs font-bold rounded-full' : 'border border-[var(--line)] px-3.5 py-1.5 text-xs font-bold rounded-full hover:border-[var(--ink-soft)] transition-colors'}>{t('faq.allTopics')}</button>
                {cats.map((c) => (
                  <button key={c.id} onClick={() => setCat(c.id)} aria-pressed={cat === c.id} className={cat === c.id ? 'bg-[var(--charcoal)] text-[var(--paper)] px-3.5 py-1.5 text-xs font-bold rounded-full' : 'border border-[var(--line)] px-3.5 py-1.5 text-xs font-bold rounded-full hover:border-[var(--ink-soft)] transition-colors'}>{c.name}</button>
                ))}
              </div>
              {shown.map((c) => (
                <section key={c.id}>
                  <h2 className="font-display text-2xl font-extrabold mb-3">{c.name}</h2>
                  <div className="space-y-2.5">
                    {c.faqs.map((faq) => {
                      const id = `${c.id}-${faq.q}`;
                      return (
                        <article key={id} className="desk-card overflow-hidden">
                          <button onClick={() => setOpen(open === id ? null : id)} aria-expanded={open === id} className="w-full p-4 text-left flex justify-between gap-3 hover:bg-[var(--wax)] transition-colors">
                            <span className="font-display font-bold text-[var(--charcoal)]">{faq.q}</span>
                            <ChevronDown className={cn('w-4 h-4 shrink-0 transition-transform text-[var(--red)]', open === id && 'rotate-180')} />
                          </button>
                          {open === id && (
                            <div className="px-4 pb-4 border-t border-[var(--line)] pt-3">
                              <div className="text-sm whitespace-pre-wrap leading-relaxed text-[var(--ink)]">{faq.a}</div>
                              <div className="flex flex-wrap gap-4 mt-3 text-xs font-bold">
                                {faq.sources.map((s) => (
                                  <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-[var(--red)]">{s.name}</a>
                                ))}
                              </div>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20">
          <div className="bg-[var(--charcoal)] text-[var(--paper)] rounded-xl p-5">
            <p className="flex items-center gap-2 text-[10px] font-display font-bold uppercase tracking-[0.18em] text-[#E8B54A]">
              <PhoneCall className="w-3.5 h-3.5" /> Need a person?
            </p>
            <p className="font-display text-xl font-black mt-2 leading-tight">Ask someone who does this all day.</p>
            <p className="text-sm text-[var(--ink-soft)] mt-2 opacity-90">One call usually beats ten tabs. Hotlines are free and confidential.</p>
          </div>
          <div className="desk-card p-4 space-y-3">
            {HOTLINES.map((h) => (
              <a key={h.id} href={telHref(h.phone)} className="block group">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{h.name}</p>
                <p className="font-display text-xl font-extrabold text-[var(--charcoal)] group-hover:text-[var(--red)] transition-colors">{h.phone}</p>
                <p className="text-[11px] text-[var(--muted)]">{h.hours} · {h.blurb}</p>
              </a>
            ))}
            <p className="text-[10px] text-[var(--muted)] pt-1 border-t border-[var(--line)]">Sources cited under every answer — tap to check.</p>
          </div>
        </aside>
      </div>
    </MainLayout>
  );
}
