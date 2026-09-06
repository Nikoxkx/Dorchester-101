/**
 * Opening hours are computed, not asserted from a fixed clock — but the
 * arithmetic behind them has to be right. `WeeklyHours` is Monday-first, zones
 * are offsets from the site's own timezone, and every case below is one a real
 * Dorchester kitchen or health centre produces.
 */
import { describe, expect, it } from "vitest";
import {
  BOSTON_TZ,
  CLOSED_DAY,
  buildWeek,
  describeDay,
  formatClockMinutes,
  formatWindow,
  hhmm,
  isOpenNow,
  opensOn,
  statusFor,
  weekHasService,
  windowsForDay,
  zonedParts,
  type WeeklyHours,
} from "@/lib/hours";

/** Saturday 5 September 2026, 09:30 on the wall clock. */
const SATURDAY_0930 = new Date(2026, 8, 5, 9, 30, 0);
const SATURDAY_1100 = new Date(2026, 8, 5, 11, 0, 0);
const SUNDAY_0930 = new Date(2026, 8, 6, 9, 30, 0);
const MONDAY_0730 = new Date(2026, 8, 7, 7, 30, 0);

const weekdayEvening: WeeklyHours = buildWeek({
  0: ["09:00-17:00"],
  1: ["09:00-17:00"],
  2: ["09:00-17:00"],
  3: ["09:00-17:00"],
  4: ["12:00-20:00"],
  5: ["10:00-14:00"],
  6: [],
});

const never: WeeklyHours = [
  CLOSED_DAY,
  CLOSED_DAY,
  CLOSED_DAY,
  CLOSED_DAY,
  CLOSED_DAY,
  CLOSED_DAY,
  CLOSED_DAY,
];

describe("week indexing", () => {
  it("treats Monday as day 0 and Sunday as day 6", () => {
    expect(zonedParts(MONDAY_0730, 0).weekday).toBe(0);
    expect(zonedParts(SATURDAY_0930, 0).weekday).toBe(5);
    expect(zonedParts(SUNDAY_0930, 0).weekday).toBe(6);
    expect(zonedParts(SATURDAY_0930, 0).minutes).toBe(9 * 60 + 30);
  });

  it("reads the wall clock in the named zone, so a hosted server cannot move a closing time", () => {
    const parts = zonedParts(new Date("2026-09-05T15:00:00Z"), BOSTON_TZ);
    expect(parts.minutes).toBe(11 * 60); // 11:00 in Boston, 15:00 in UTC
    expect(parts.iso).toBe("2026-09-05");
  });
});

describe("hhmm", () => {
  it("parses 24-hour clock strings", () => {
    expect(hhmm("09:00")).toBe(540);
    expect(hhmm("9:00")).toBe(540);
    expect(hhmm("23:59")).toBe(1439);
    expect(hhmm(" 00:00 ")).toBe(0);
  });

  it("throws on anything that is not a clock time, so a typo cannot become midnight service", () => {
    expect(() => hhmm("9:00 AM")).toThrow(/HH:MM/);
    expect(() => hhmm("24:30")).toThrow(/HH:MM/);
    expect(hhmm("24:00")).toBe(1440);
    expect(() => hhmm("09:60")).toThrow(/HH:MM/);
    expect(() => hhmm("")).toThrow(/HH:MM/);
  });
});

describe("buildWeek", () => {
  it('turns "HH:MM-HH:MM" into minute windows and flags ones that cross midnight', () => {
    const week = buildWeek({ 0: ["20:00-01:00", "09:00-12:00"], 1: [] });
    expect(week[0]).toHaveLength(2);
    expect(week[0][0]).toEqual({ startsAt: 1200, endsAt: 60, overnight: true });
    expect(week[0][1]).toEqual({
      startsAt: 540,
      endsAt: 720,
      overnight: false,
    });
    expect(week[1]).toEqual([]);
    expect(week).toHaveLength(7);
  });

  it("survives the strict parser for every window in the shipped data", () => {
    for (const day of weekdayEvening) {
      for (const window of day) {
        expect(window.startsAt).toBeGreaterThanOrEqual(0);
        expect(window.endsAt).toBeLessThanOrEqual(1440);
      }
    }
  });
});

describe("statusFor", () => {
  it("reports open with the minutes left in the window", () => {
    expect(statusFor(weekdayEvening, SATURDAY_1100, 0)).toEqual({
      state: "open",
      closesAt: 840,
      minutesUntilClose: 180,
    });
  });

  it('is no longer open at the closing minute itself, so "open until 2pm" never overstates', () => {
    expect(
      statusFor(weekdayEvening, new Date(2026, 8, 5, 14, 0), 0).state,
    ).toBe("closed");
  });

  it("warns in the last hour of service", () => {
    expect(
      statusFor(weekdayEvening, new Date(2026, 8, 5, 13, 20), 0).state,
    ).toBe("closing-soon");
  });

  it("names the next opening window by day offset, not by guessing", () => {
    expect(statusFor(weekdayEvening, SUNDAY_0930, 0)).toEqual({
      state: "closed",
      opensAt: 540,
      opensOnDayOffset: 1,
      dayName: "tomorrow",
    });
    const laterToday = statusFor(weekdayEvening, SATURDAY_0930, 0);
    expect(laterToday).toMatchObject({
      state: "closed",
      opensAt: 600,
      opensOnDayOffset: 0,
      dayName: "today",
    });
  });

  it("returns a sentinel offset for a listing with no hours at all", () => {
    const status = statusFor(never, SATURDAY_0930, 0);
    expect(status).toMatchObject({ state: "closed", opensOnDayOffset: -1 });
    // Callers must check the offset: 0 minutes here means "unknown", not "midnight".
    if (status.state === "closed")
      expect(status.opensOnDayOffset).toBeLessThan(0);
  });

  it("keeps an overnight window open into the small hours", () => {
    // Monday 8 PM to Tuesday 1 AM: three different clock readings, one truth.
    const lateNight = [
      [{ startsAt: 1200, endsAt: 60, overnight: true }],
      [],
      [],
      [],
      [],
      [],
      [],
    ] as WeeklyHours;
    expect(statusFor(lateNight, new Date(2026, 8, 7, 22, 0), 0)).toEqual({
      state: "open",
      closesAt: 60,
      minutesUntilClose: 180,
    });
    expect(statusFor(lateNight, new Date(2026, 8, 8, 0, 30), 0)).toEqual({
      state: "closing-soon",
      closesAt: 60,
      minutesUntilClose: 30,
    });
    expect(statusFor(lateNight, new Date(2026, 8, 8, 2, 0), 0).state).toBe(
      "closed",
    );
  });

  it("shifts with a numeric UTC offset in minutes, not the browser clock", () => {
    expect(isOpenNow(weekdayEvening, SATURDAY_1100, 0)).toBe(true);
    // UTC-5 at 11:00 UTC is 06:00 local, well before a 10:00 opening.
    expect(isOpenNow(weekdayEvening, SATURDAY_1100, -300)).toBe(false);
    expect(statusFor(weekdayEvening, SATURDAY_1100, -300)).toMatchObject({
      state: "closed",
      opensAt: 600,
    });
  });
});

describe("day helpers", () => {
  it("returns the raw windows for a day and nothing for a closed one", () => {
    expect(windowsForDay(weekdayEvening, 5)).toEqual([
      { startsAt: 600, endsAt: 840, overnight: false },
    ]);
    expect(windowsForDay(weekdayEvening, 6)).toEqual([]);
    expect(opensOn(weekdayEvening, 5)).toBe(true);
    expect(opensOn(weekdayEvening, 6)).toBe(false);
    expect(weekHasService(weekdayEvening)).toBe(true);
    expect(weekHasService(never)).toBe(false);
  });

  it("prints ranges and single times, and the caller-provided closed label", () => {
    expect(formatWindow({ startsAt: 600, endsAt: 840 })).toBe("10 AM-2 PM");
    expect(formatWindow({ startsAt: 600, endsAt: 840 }, false)).toBe(
      "10:00-14:00",
    );
    expect(formatClockMinutes(540)).toBe("9 AM");
    expect(formatClockMinutes(545)).toBe("9:05 AM");
    expect(formatClockMinutes(0)).toBe("12 AM");
    expect(formatClockMinutes(1440)).toBe("12 AM");
    expect(formatClockMinutes(1325)).toBe("10:05 PM");
    expect(formatClockMinutes(540, false)).toBe("09:00");
    expect(describeDay(weekdayEvening, 5)).toBe("10 AM-2 PM");
    expect(describeDay(weekdayEvening, 6)).toBe("Closed");
    expect(describeDay(weekdayEvening, 6, "Pèmen")).toBe("Pèmen");
    expect(describeDay(weekdayEvening, 0)).toBe("9 AM-5 PM");
  });
});
