const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

function toMinutes(hour: number, minute: number, mer: string): number {
  const m = mer.toUpperCase();
  let h = hour % 12;
  if (m === 'PM') h += 12;
  return h * 60 + minute;
}

/** Parse strings like "9:00 AM - 5:00 PM" or "Mon–Fri 8 AM–5 PM". */
export function isOpenNow(
  hours: Record<string, string> | string,
  now: Date = new Date(),
): boolean {
  if (typeof hours === 'string') {
    if (/24\/7/i.test(hours)) return true;
    if (/closed/i.test(hours) && !/\d/.test(hours)) return false;
    return false;
  }

  const day = DAYS[now.getDay()];
  const today = hours[day];
  if (!today || /closed/i.test(today) || /see /i.test(today) || /check /i.test(today)) {
    return false;
  }

  const match = today.match(
    /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\s*[-–—]\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i,
  );
  if (!match) return false;

  const start = toMinutes(Number(match[1]), Number(match[2] || 0), match[3]);
  const end = toMinutes(Number(match[4]), Number(match[5] || 0), match[6]);
  const current = now.getHours() * 60 + now.getMinutes();
  return current >= start && current < end;
}
