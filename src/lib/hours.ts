/**
 * Opening hours as structured data.
 *
 * The previous pages stored strings such as "Mon-Fri 10 AM-2 PM" and then
 * guessed whether a place was open, with a code comment admitting the real
 * parser had not been written. For a food pantry that guess is the difference
 * between a trip that works and one that does not, so hours are now modelled
 * and evaluated.
 */

export interface HourWindow {
  /** 24h local time, minutes from midnight. */
  startsAt: number;
  endsAt: number;
  /** True when the window crosses midnight, e.g. a 24h drop-in. */
  overnight?: boolean;
}

/** Index 0 = Monday ... 6 = Sunday. Empty array means closed that day. */
export type WeeklyHours = HourWindow[][];

export const CLOSED_DAY: HourWindow[] = [];

/**
 * Parse a 24-hour clock string used in the hand-checked datasets.
 *
 * Throwing is deliberate: these values come from strings typed into a data
 * file, and a silent zero used to turn a typo into a pantry that appears open
 * at midnight. A bad value must fail the build, not a resident's afternoon.
 */
const CLOCK_24H = /^(?:[01]?\d|2[0-3]):[0-5]\d$|^24:00$/;

export function hhmm(value: string): number {
  const text = value.trim();
  if (!CLOCK_24H.test(text)) {
    throw new Error(`Expected a 24-hour "HH:MM" time, received "${value}"`);
  }
  if (text === "24:00") return 1440; // end-of-day marker, valid only as a closing time
  const [hours, minutes] = text.split(":");
  return Number(hours) * 60 + Number(minutes);
}

/** One clock time, for a "opens at 9 AM" line that has no range to show. */
export function formatClockMinutes(minutes: number, twelveHour = true): string {
  const total = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return twelveHour
    ? clock(total)
    : `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

export function formatWindow(window: HourWindow, twelveHour = true): string {
  if (!twelveHour)
    return `${pad(Math.floor(window.startsAt / 60))}:${pad(window.startsAt % 60)}-${pad(Math.floor(window.endsAt / 60))}:${pad(window.endsAt % 60)}`;
  return `${clock(window.startsAt)}-${clock(window.endsAt)}`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function clock(minutes: number): string {
  const total = ((minutes % 1440) + 1440) % 1440;
  const h24 = Math.floor(total / 60);
  const m = total % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return m === 0 ? `${h12} ${suffix}` : `${h12}:${pad(m)} ${suffix}`;
}

/** Builds a week from a compact spec: { 0: ['09:00-17:00'], 5: [] }. */
export function buildWeek(spec: Record<number, string[]>): WeeklyHours {
  const week: WeeklyHours = Array.from({ length: 7 }, () => [] as HourWindow[]);
  for (const [dayRaw, ranges] of Object.entries(spec)) {
    const day = Number(dayRaw);
    week[day] = ranges.map((range) => {
      const [start, end] = range.split("-");
      const startsAt = hhmm(start.trim());
      const endsAt = hhmm(end.trim());
      return { startsAt, endsAt, overnight: endsAt <= startsAt };
    });
  }
  return week;
}

export type OpenStatus =
  | { state: "open"; closesAt: number; minutesUntilClose: number }
  | { state: "closing-soon"; closesAt: number; minutesUntilClose: number }
  | {
      state: "closed";
      opensAt: number;
      opensOnDayOffset: number;
      dayName: "today" | "tomorrow" | "weekday";
    };

const CLOSING_SOON_MINUTES = 60;

function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

const SHORT_WEEKDAY: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

/**
 * Wall-clock parts of an instant in a named zone. A pantry on Columbia Road
 * closes at 4:30 PM *Boston* time, so a server hosted in Frankfurt, or a
 * traveller whose device is set elsewhere, must not be allowed to decide that
 * it is still open. Pass the resource's own zone.
 */
export function zonedParts(
  now: Date,
  timeZone: string,
): { weekday: number; minutes: number; iso: string } {
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = fmt.formatToParts(now);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    const weekday = SHORT_WEEKDAY[get("weekday")] ?? mondayIndex(now);
    const hh = Number(get("hour")) || 0;
    const mm = Number(get("minute")) || 0;
    return {
      weekday,
      minutes: hh * 60 + mm,
      iso: `${get("year")}-${get("month")}-${get("day")}`,
    };
  } catch {
    // Unknown zone (a bad env override): fall back to the host clock.
    return {
      weekday: mondayIndex(now),
      minutes: now.getHours() * 60 + now.getMinutes(),
      iso: now.toISOString().slice(0, 10),
    };
  }
}

/** Boston-local parts, the default for every Dorchester record. */
export const BOSTON_TZ = "America/New_York";

/**
 * Evaluates the week against "now". Crossing-midnight windows are handled, and
 * the search for the next opening looks forward up to seven days so a Sunday
 * visitor sees Monday's time rather than a bare "Closed".
 *
 * `zone` accepts an IANA name (preferred, e.g. 'America/New_York') or a fixed
 * offset in minutes for callers that already know theirs.
 */
export function statusFor(
  week: WeeklyHours,
  now: Date = new Date(),
  zone: string | number = BOSTON_TZ,
): OpenStatus {
  // A number is a fixed UTC offset in minutes (Boston in summer is -240), for
  // callers that would rather not carry the IANA name. Readings are taken in
  // UTC on the shifted instant so the host machine's timezone stays out of it.
  const { weekday: day, minutes } =
    typeof zone === "number"
      ? (() => {
          const local = new Date(now.getTime() + zone * 60_000);
          return {
            weekday: mondayIndex(local),
            minutes: local.getUTCHours() * 60 + local.getUTCMinutes(),
          };
        })()
      : zonedParts(now, zone);

  for (const window of week[day]) {
    if (window.overnight) {
      if (minutes >= window.startsAt) {
        const remaining = 1440 - minutes + window.endsAt;
        return remaining <= CLOSING_SOON_MINUTES
          ? {
              state: "closing-soon",
              closesAt: window.endsAt,
              minutesUntilClose: remaining,
            }
          : {
              state: "open",
              closesAt: window.endsAt,
              minutesUntilClose: remaining,
            };
      }
      if (minutes < window.endsAt) {
        const remaining = window.endsAt - minutes;
        return remaining <= CLOSING_SOON_MINUTES
          ? {
              state: "closing-soon",
              closesAt: window.endsAt,
              minutesUntilClose: remaining,
            }
          : {
              state: "open",
              closesAt: window.endsAt,
              minutesUntilClose: remaining,
            };
      }
      continue;
    }
    if (minutes >= window.startsAt && minutes < window.endsAt) {
      const remaining = window.endsAt - minutes;
      return remaining <= CLOSING_SOON_MINUTES
        ? {
            state: "closing-soon",
            closesAt: window.endsAt,
            minutesUntilClose: remaining,
          }
        : {
            state: "open",
            closesAt: window.endsAt,
            minutesUntilClose: remaining,
          };
    }
  }

  // A window that started yesterday and runs past midnight is still open now.
  // Without this, an overnight drop-in centre reads as closed at 12:30 AM.
  for (const window of week[(day + 6) % 7] ?? []) {
    if (!window.overnight) continue;
    const remaining = window.endsAt - minutes;
    if (remaining > 0) {
      return remaining <= CLOSING_SOON_MINUTES
        ? {
            state: "closing-soon",
            closesAt: window.endsAt,
            minutesUntilClose: remaining,
          }
        : {
            state: "open",
            closesAt: window.endsAt,
            minutesUntilClose: remaining,
          };
    }
  }

  // Still to open today?
  const laterToday = week[day]
    .filter((w) => w.startsAt > minutes)
    .sort((a, b) => a.startsAt - b.startsAt)[0];
  if (laterToday)
    return {
      state: "closed",
      opensAt: laterToday.startsAt,
      opensOnDayOffset: 0,
      dayName: "today",
    };

  for (let offset = 1; offset <= 7; offset++) {
    const nextDay = (day + offset) % 7;
    const next = [...week[nextDay]].sort((a, b) => a.startsAt - b.startsAt)[0];
    if (next)
      return {
        state: "closed",
        opensAt: next.startsAt,
        opensOnDayOffset: offset,
        dayName: offset === 1 ? "tomorrow" : "weekday",
      };
  }

  return {
    state: "closed",
    opensAt: 0,
    opensOnDayOffset: -1,
    dayName: "weekday",
  };
}

export function isOpenNow(
  week: WeeklyHours,
  now?: Date,
  zone: string | number = BOSTON_TZ,
): boolean {
  const s = statusFor(week, now ?? new Date(), zone);
  return s.state === "open" || s.state === "closing-soon";
}

/** Windows open at a given weekday index, used by "today" listings. */
export function windowsForDay(week: WeeklyHours, day: number): HourWindow[] {
  return week[day] ?? [];
}

/** True when the place serves at all on this weekday. */
export function opensOn(week: WeeklyHours, day: number): boolean {
  return (week[day] ?? []).length > 0;
}

export function weekHasService(week: WeeklyHours): boolean {
  return week.some((day) => day.length > 0);
}

/** Short human line for a single day, e.g. "9 AM-5 PM" or "Closed". */
export function describeDay(
  week: WeeklyHours,
  day: number,
  closedLabel = "Closed",
): string {
  const windows = week[day];
  if (!windows || windows.length === 0) return closedLabel;
  return windows.map((w) => formatWindow(w)).join(", ");
}
