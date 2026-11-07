'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, QrCode, Share2, X } from 'lucide-react';
import { resourceUrl } from '@/lib/site';
import { useBadgeStore } from '@/stores/badgeStore';
import { useTranslation } from '@/lib/i18n';

export interface QRPosterProps {
  id: string;
  name: string;
  address: string;
  phone?: string;
  summary: string;
}

const PRINTING_CLASS = 'qr-poster-printing';

export function QRPoster({ id, name, address, phone, summary }: QRPosterProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const earn = useBadgeStore((s) => s.earn);

  const targetUrl = resourceUrl(id);
  const printableUrl = targetUrl.replace(/^https?:\/\//, '');

  useEffect(() => {
    if (!open) return;
    document.body.classList.add(PRINTING_CLASS);
    return () => document.body.classList.remove(PRINTING_CLASS);
  }, [open]);

  const handleOpen = () => {
    earn('qr-sharer');
    setOpen(true);
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: `${name} · DOR101`, text: summary, url: targetUrl });
        return;
      } catch {
        // A cancelled share falls through to the copy option when available.
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(targetUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        setCopied(false);
      }
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2.5 py-1 font-heading text-[11px] font-bold text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
      >
        <QrCode className="h-3 w-3" aria-hidden="true" />
        {t('qr.title')}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('qr.aria', { name })}
          data-qr-poster-root
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => setOpen(false)}
        >
          <div
            data-qr-poster-card
            className="relative w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-6 text-[var(--color-text-primary)] shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('qr.close')}
              data-qr-poster-close
              className="absolute right-4 top-4 rounded-full border border-[var(--color-border)] p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <section data-qr-poster-content className="mx-auto max-w-sm text-center">
              <p className="font-heading text-[11px] font-bold uppercase tracking-wider text-[var(--color-accent-primary)]">
                {t('qr.directory')}
              </p>
              <h3 className="mt-1 font-heading text-lg font-extrabold leading-snug">{name}</h3>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{address}</p>
              {phone && <p className="mt-0.5 font-mono text-xs font-semibold">{phone}</p>}

              <div className="my-4 flex flex-col items-center justify-center rounded-xl border border-[var(--color-border)] bg-white p-4">
                <QRCodeSVG
                  data-testid="qr-poster-code"
                  value={targetUrl}
                  size={224}
                  level="M"
                  marginSize={4}
                  bgColor="#FFFFFF"
                  fgColor="#14304F"
                  title={t('qr.alt', { name })}
                  className="h-56 w-56 max-w-full"
                />
                <p className="mt-2 text-center font-mono text-[11px] text-[#14304F]">
                  {t('qr.caption')}
                </p>
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-2 max-w-full break-all text-center font-mono text-[10px] leading-relaxed text-[#14304F] underline underline-offset-2"
                >
                  {printableUrl}
                </a>
              </div>

              <p className="text-left text-xs leading-relaxed text-[var(--color-text-secondary)]">{summary}</p>
            </section>

            <div data-qr-poster-actions className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-[var(--color-border)] pt-3">
              <button
                type="button"
                onClick={() => void handleShare()}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1.5 font-heading text-xs font-bold transition-colors hover:border-[var(--color-accent-primary)]"
              >
                <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                {copied ? t('qr.copied') : t('qr.share')}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-primary)] px-3.5 py-1.5 font-heading text-xs font-bold text-white"
              >
                <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                {t('qr.print')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
