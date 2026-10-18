'use client';

import { useState } from 'react';
import { Printer, QrCode, Share2, X } from 'lucide-react';
import { SITE_URL } from '@/lib/site';
import { useBadgeStore } from '@/stores/badgeStore';

export interface QRPosterProps {
  id: string;
  name: string;
  address: string;
  phone?: string;
  summary: string;
}

export function QRPoster({ id, name, address, phone, summary }: QRPosterProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const earn = useBadgeStore((s) => s.earn);

  const targetUrl = `${SITE_URL.replace(/\/$/, '')}/resources?place=${encodeURIComponent(id)}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(targetUrl)}`;

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
        // user cancelled or unsupported
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
        QR Poster
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Printable QR poster for ${name}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close poster modal"
              className="absolute top-4 right-4 rounded-full border border-[var(--color-border)] p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <p className="font-heading text-[11px] font-bold uppercase tracking-wider text-[var(--color-accent-primary)]">
              DOR101 · Dorchester Community Directory
            </p>
            <h3 className="mt-1 font-heading text-lg font-extrabold leading-snug">{name}</h3>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{address}</p>
            {phone && <p className="mt-0.5 font-mono text-xs font-semibold">{phone}</p>}

            <div className="my-4 flex flex-col items-center justify-center rounded-xl border border-[var(--color-border)] bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrSrc}
                alt={`QR code linking to ${name} on DOR101`}
                width={200}
                height={200}
                className="h-48 w-48"
              />
              <p className="mt-2 text-center font-mono text-[11px] text-[#14304F]">
                Scan for live hours &amp; 9 languages
              </p>
            </div>

            <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">{summary}</p>

            <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-[var(--color-border)] pt-3">
              <button
                type="button"
                onClick={() => void handleShare()}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1.5 font-heading text-xs font-bold transition-colors hover:border-[var(--color-accent-primary)]"
              >
                <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                {copied ? 'Link copied!' : 'Share link'}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-primary)] px-3.5 py-1.5 font-heading text-xs font-bold text-white"
              >
                <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                Print poster
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
