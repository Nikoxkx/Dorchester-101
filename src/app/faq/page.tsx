'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

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
      <div className="max-w-3xl space-y-6">
        <header className="border-b-2 border-[var(--ink)] pb-4">
          <p className="kicker">Questions</p>
          <h1 className="font-display text-4xl">{t('faq.title')}</h1>
          <p className="text-[var(--muted)] mt-2">{t('faq.description')}</p>
        </header>

        <aside className="desk-panel p-4">
          <p className="font-semibold">Need a person tonight?</p>
          <p className="text-sm">Call <a href="tel:211" className="underline">2-1-1</a>. 24/7.</p>
        </aside>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('faq.searchPlaceholder')}
          className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--line)]"
        />

        {loading && <LoadingSpinner />}

        {q.length > 2 ? (
          <ul className="space-y-2">
            {searchHits.map((faq) => (
              <li key={faq.q} className="desk-panel">
                <button onClick={() => setOpen(open === faq.q ? null : faq.q)} className="w-full p-4 text-left flex justify-between gap-3">
                  <span><span className="kicker block mb-1">{faq.category}</span>{faq.q}</span>
                  <ChevronDown className={cn('w-4 h-4', open === faq.q && 'rotate-180')} />
                </button>
                {open === faq.q && <div className="px-4 pb-4 text-sm whitespace-pre-wrap">{faq.a}</div>}
              </li>
            ))}
          </ul>
        ) : (
          <>
            <div className="flex flex-wrap gap-1">
              <button onClick={() => setCat('all')} className={cat === 'all' ? 'bg-[var(--ink)] text-[var(--paper)] px-3 py-1 text-xs font-bold' : 'border border-[var(--line)] px-3 py-1 text-xs'}>{t('faq.allTopics')}</button>
              {cats.map((c) => (
                <button key={c.id} onClick={() => setCat(c.id)} className={cat === c.id ? 'bg-[var(--ink)] text-[var(--paper)] px-3 py-1 text-xs font-bold' : 'border border-[var(--line)] px-3 py-1 text-xs'}>{c.name}</button>
              ))}
            </div>
            {shown.map((c) => (
              <section key={c.id}>
                <h2 className="font-display text-2xl mb-2">{c.name}</h2>
                <div className="space-y-2">
                  {c.faqs.map((faq) => {
                    const id = `${c.id}-${faq.q}`;
                    return (
                      <article key={id} className="desk-panel">
                        <button onClick={() => setOpen(open === id ? null : id)} className="w-full p-4 text-left flex justify-between gap-3">
                          <span className="font-semibold">{faq.q}</span>
                          <ChevronDown className={cn('w-4 h-4 shrink-0', open === id && 'rotate-180')} />
                        </button>
                        {open === id && (
                          <div className="px-4 pb-4 border-t border-[var(--line)] pt-3">
                            <div className="text-sm whitespace-pre-wrap leading-relaxed">{faq.a}</div>
                            <div className="flex flex-wrap gap-3 mt-3 text-xs">
                              {faq.sources.map((s) => (
                                <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="underline">{s.name}</a>
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
    </MainLayout>
  );
}
