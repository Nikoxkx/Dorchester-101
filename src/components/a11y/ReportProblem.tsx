'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Flag, X } from 'lucide-react';
import { useI18n } from '@/i18n/hook';
import { useAnnounce } from '@/components/providers/LiveRegion';
import { CONTACT_EMAIL, CONTACT_FALLBACK_URL, hasEmailContact } from '@/lib/site';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * Report-a-problem dialog.
 *
 * The honest version of "contact us" without a backend: the message is
 * assembled here, handed to the visitor's own mail client, and kept in this
 * browser until it is sent. Nothing is POSTed to a server we do not run, and the
 * copy says so instead of pretending a form was submitted.
 */
const DRAFT_KEY = 'dor101:report-draft';

interface Draft {
  place: string;
  detail: string;
  page: string;
  savedAt: string;
}

function readDraft(): Draft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

export function ReportProblem({ triggerClass }: { triggerClass?: string }) {
  const { t, format } = useI18n();
  const announce = useAnnounce();
  const [open, setOpen] = useState(false);
  const placeId = useId();
  const detailId = useId();
  const [initialDraft] = useState(() => (typeof window === 'undefined' ? null : readDraft()));
  const [place, setPlace] = useState(initialDraft?.place ?? '');
  const [detail, setDetail] = useState(initialDraft?.detail ?? '');
  const [hadDraft, setHadDraft] = useState(Boolean(initialDraft && (initialDraft.place || initialDraft.detail)));
  const [copied, setCopied] = useState(false);
  const firstField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) window.setTimeout(() => firstField.current?.focus(), 40);
  }, [open]);

  const body = [
    `Page: ${typeof window !== 'undefined' ? window.location.pathname : ''}`,
    `Place: ${place || '-'}`,
    '',
    detail,
    '',
    `Sent from DOR101 v${process.env.NEXT_PUBLIC_APP_VERSION ?? 'dev'} on ${format.date(new Date(), 'medium')}`,
  ].join('\n');

  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t('feedback.subject'))}&body=${encodeURIComponent(body)}`;

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      announce(t('common.copied'), 'polite');
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // No clipboard permission (http, or a locked-down browser): selecting the
      // preview is the fallback rather than failing silently.
      const node = document.querySelector<HTMLPreElement>('[data-report-preview]');
      if (node) window.getSelection()?.selectAllChildren(node);
    }
    saveDraft();
  }

  function saveDraft() {
    const draft: Draft = {
      place,
      detail,
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      savedAt: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setHadDraft(true);
      announce(t('feedback.draftSaved'), 'polite');
    } catch {
      /* storage disabled: the message is still in the textarea */
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex items-center gap-1.5 text-xs font-heading font-medium',
          'text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] underline-offset-2',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] rounded-[var(--radius-sm)]',
          triggerClass
        )}
      >
        <Flag className="w-3.5 h-3.5" aria-hidden="true" />
        {t('error.reportProblem')}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[85] flex items-end sm:items-center justify-center p-0 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <button
              type="button"
              aria-label={t('common.close')}
              className="absolute inset-0 bg-[var(--color-scrim)] cursor-default"
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="report-title"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 0.84, 0.44, 1] }}
              className="relative w-full sm:max-w-lg rounded-t-[var(--radius-lg)] sm:rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-raised)] p-5 shadow-[var(--shadow-lg)] max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 id="report-title" className="font-display text-lg font-bold">
                  {t('error.reportProblem')}
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={t('common.close')}
                  className="rounded-[var(--radius-sm)] p-1.5 hover:bg-[var(--color-bg-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <p className="text-sm text-[var(--color-text-muted)] mt-1">{t('feedback.body')}</p>
              {hadDraft && (
                <p className="mt-2 text-xs text-[var(--color-accent-green)]">{t('feedback.draftSaved')}</p>
              )}

              <div className="mt-4 space-y-3">
                <div>
                  <label htmlFor={placeId} className="block text-xs font-heading font-semibold mb-1">
                    {t('feedback.fieldPlace')}
                  </label>
                  <input
                    ref={firstField}
                    id={placeId}
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    placeholder={t('food.search')}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
                  />
                </div>
                <div>
                  <label htmlFor={detailId} className="block text-xs font-heading font-semibold mb-1">
                    {t('feedback.fieldDetail')}
                  </label>
                  <textarea
                    id={detailId}
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    rows={4}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
                  />
                </div>
              </div>

              <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3">
                <span className="block text-[10px] font-heading font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                  {t('feedback.preview')}
                </span>
                <pre data-report-preview className="mt-1 whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
                  {body}
                </pre>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                {hasEmailContact ? (
                  <a href={mailto} onClick={saveDraft} className="flex-1">
                    <Button variant="primary" className="w-full">
                      {t('feedback.mailto')}
                    </Button>
                  </a>
                ) : (
                  <p className="flex-1 text-xs text-[var(--color-text-muted)] self-center">{t('feedback.issuesOnly')}</p>
                )}
                <a
                  href={CONTACT_FALLBACK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] px-4 py-2 text-center font-heading text-sm font-medium hover:bg-[var(--color-bg-tertiary)]"
                >
                  {t('about.openSource')}
                </a>
                <Button variant="ghost" onClick={() => copy(body)}>
                  {copied ? t('common.copied') : t('common.copy')}
                </Button>
              </div>

              <p className="mt-3 text-[11px] text-[var(--color-text-muted)]">{t('settings.noDataCollected')}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
