export interface CalendarEventInput {
  title: string;
  description: string;
  location?: string;
  url?: string;
  /** ISO date or datetime string (defaults to tomorrow 9 AM ET if omitted) */
  start?: string | Date;
  /** ISO date or datetime string (defaults to 1 hour after start) */
  end?: string | Date;
}

function toIcsUtcStamp(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function resolveDates(input: CalendarEventInput): { start: Date; end: Date } {
  const start = input.start
    ? new Date(input.start)
    : (() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        d.setHours(13, 0, 0, 0);
        return d;
      })();
  const end = input.end ? new Date(input.end) : new Date(start.getTime() + 60 * 60 * 1000);
  return { start, end };
}

export function buildIcs(input: CalendarEventInput): string {
  const { start, end } = resolveDates(input);
  const stamp = toIcsUtcStamp(new Date());
  const uid = `dor101-${start.getTime()}-${Math.random().toString(36).slice(2, 8)}@dorchester-101.vercel.app`;
  const desc = input.url ? `${input.description}\n\n${input.url}` : input.description;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DOR101//Dorchester 101 Community Hub//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${toIcsUtcStamp(start)}`,
    `DTEND:${toIcsUtcStamp(end)}`,
    `SUMMARY:${escapeIcsText(input.title)}`,
    `DESCRIPTION:${escapeIcsText(desc)}`,
    ...(input.location ? [`LOCATION:${escapeIcsText(input.location)}`] : []),
    ...(input.url ? [`URL:${input.url}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function googleCalendarUrl(input: CalendarEventInput): string {
  const { start, end } = resolveDates(input);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: input.title,
    dates: `${toIcsUtcStamp(start)}/${toIcsUtcStamp(end)}`,
    details: input.url ? `${input.description}\n\n${input.url}` : input.description,
    ...(input.location ? { location: input.location } : {}),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
