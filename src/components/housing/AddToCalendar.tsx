'use client';

import { Calendar, Download, ExternalLink } from 'lucide-react';
import { buildIcs, googleCalendarUrl, type CalendarEventInput } from '@/lib/calendar';
import { useBadgeStore } from '@/stores/badgeStore';
import { useTranslation } from '@/lib/i18n';

export function AddToCalendar({
  event,
  label,
}: {
  event: CalendarEventInput;
  label?: string;
}) {
  const { t } = useTranslation();
  const earn = useBadgeStore((s) => s.earn);

  const handleDownloadIcs = () => {
    earn('housing-scout');
    const ics = buildIcs(event);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Keep letters from every supported writing system in the downloaded file name.
    const filename = event.title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '');
    a.download = `${filename || 'dor101-reminder'}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="inline-flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={handleDownloadIcs}
        className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2.5 py-1 font-heading text-[11px] font-bold text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
      >
        <Download className="h-3 w-3" aria-hidden="true" />
        {label ?? t('calendar.reminder')}
      </button>
      <a
        href={googleCalendarUrl(event)}
        target="_blank"
        rel="noreferrer noopener"
        onClick={() => earn('housing-scout')}
        className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2.5 py-1 font-heading text-[11px] font-bold text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
      >
        <Calendar className="h-3 w-3" aria-hidden="true" />
        {t('calendar.google')}
        <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
      </a>
    </div>
  );
}
