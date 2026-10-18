'use client';

import { Calendar, Download, ExternalLink } from 'lucide-react';
import { buildIcs, googleCalendarUrl, type CalendarEventInput } from '@/lib/calendar';
import { useBadgeStore } from '@/stores/badgeStore';

export function AddToCalendar({
  event,
  label = 'Reminder (.ics)',
}: {
  event: CalendarEventInput;
  label?: string;
}) {
  const earn = useBadgeStore((s) => s.earn);

  const handleDownloadIcs = () => {
    earn('housing-scout');
    const ics = buildIcs(event);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`;
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
        {label}
      </button>
      <a
        href={googleCalendarUrl(event)}
        target="_blank"
        rel="noreferrer noopener"
        onClick={() => earn('housing-scout')}
        className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2.5 py-1 font-heading text-[11px] font-bold text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
      >
        <Calendar className="h-3 w-3" aria-hidden="true" />
        Google Calendar
        <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
      </a>
    </div>
  );
}
