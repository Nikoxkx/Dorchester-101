/**
 * The translation layer is the contract the whole UI depends on: every locale
 * must carry every key, the translator must never fall through to English
 * silently, and the plural and placeholder handling has to actually interpolate.
 * These are the checks that catch a key added in en.ts and forgotten elsewhere.
 */
import { describe, expect, it } from "vitest";
import { LANGUAGES, isRtl, languageMeta, detectLanguage } from "@/i18n/config";
import {
  dictionaries,
  missingKeys,
  localeCoverage,
  translationKeys,
  TOTAL_KEYS,
} from "@/i18n";
import { en, placeholdersOf, type TranslationKey } from "@/i18n/en";
import { makeTranslator, pick } from "@/i18n/runtime";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatWeekday,
  weekdayIndex,
} from "@/i18n/formatters";

const codes = LANGUAGES.map((l) => l.code);

describe("i18n dictionaries", () => {
  it("covers every configured language with a dictionary", () => {
    for (const code of codes) {
      expect(dictionaries[code], `no dictionary for ${code}`).toBeTruthy();
    }
    expect(Object.keys(dictionaries).sort()).toEqual([...codes].sort());
  });

  it("keeps every locale at full key parity, so no English leaks through", () => {
    for (const code of codes) {
      const missing = missingKeys(code);
      expect(
        missing,
        `${code} is missing: ${missing.slice(0, 6).join(", ")}`,
      ).toEqual([]);
      expect(localeCoverage(code).percent).toBe(100);
    }
  });

  it("does not let a locale invent keys English does not have", () => {
    const canonical = new Set(translationKeys);
    for (const code of codes) {
      const extra = Object.keys(dictionaries[code]).filter(
        (key) => !canonical.has(key as TranslationKey),
      );
      expect(
        extra,
        `${code} has keys absent from en.ts: ${extra.join(", ")}`,
      ).toEqual([]);
    }
    expect(TOTAL_KEYS).toBe(translationKeys.length);
    expect(TOTAL_KEYS).toBeGreaterThan(400);
  });

  it("carries the strings the map and transit screens depend on", () => {
    for (const key of [
      "map.title",
      "map.legend",
      "map.arrivalMinutes",
      "resources.count",
      "common.results",
      "settings.minutesValue",
      "food.opensTomorrow",
      "time.opensAt",
      "time.opensOn",
      "news.autoRefreshed",
    ] as const) {
      expect(
        en[key as TranslationKey],
        `${key} was renamed or deleted`,
      ).toBeTruthy();
    }
  });
});

describe("makeTranslator", () => {
  const t = makeTranslator(dictionaries.en, "en");

  it("substitutes named placeholders", () => {
    expect(t("resources.count", { count: 28 })).toBe("28 organizations");
  });

  it('renders the plural category for the locale instead of appending "s"', () => {
    expect(t("common.results", { count: 1 })).toBe("1 result");
    expect(t("common.results", { count: 0 })).toBe("0 results");
    expect(t("common.results", { count: 12 })).toBe("12 results");
    expect(t("settings.minutesValue", { count: 1 })).toBe("1 minute");
    expect(t("settings.minutesValue", { count: 5 })).toBe("5 minutes");
  });

  it("returns the key itself when a string is missing, never a silent English fallback", () => {
    const partial = makeTranslator({ greeting: "Hola" } as never, "es");
    expect(partial("not.a.key" as never)).toBe("not.a.key");
    expect(partial("greeting")).toBe("Hola");
  });

  it('never prints "undefined" or "NaN" when a caller forgets a token', () => {
    expect(t("resources.count")).not.toMatch(/undefined|NaN/);
    expect(t("time.opensAt", { time: "9 AM" })).toBe("Opens at 9 AM");
  });

  it("supports Arabic and Cape Verdean dictionaries end to end", () => {
    const ar = makeTranslator(dictionaries.ar, "ar");
    const kea = makeTranslator(dictionaries.kea, "kea");
    expect(ar("resources.count", { count: 3 })).not.toBe("3 organizations");
    expect(kea("map.title")).toBe(dictionaries.kea["map.title"]);
    expect(kea("map.title")).not.toBe(en["map.title"]);
  });
});

describe("pick()", () => {
  it("returns the requested locale and reports when it had to fall back", () => {
    const record = { en: "Food pantry", es: "Dispensario de comida" };
    expect(pick(record, "es")).toEqual({
      value: "Dispensario de comida",
      fellBack: false,
      used: "es",
    });
    const result = pick(record, "ht");
    expect(result.value).toBe("Food pantry");
    expect(result.fellBack).toBe(true);
    expect(result.used).toBe("en");
  });
});

describe("locale metadata", () => {
  it("marks only Arabic as right-to-left", () => {
    expect(isRtl("ar")).toBe(true);
    for (const code of codes.filter((c) => c !== "ar"))
      expect(isRtl(code)).toBe(false);
    expect(languageMeta("ar").dir).toBe("rtl");
    expect(languageMeta("en").dir).toBe("ltr");
  });

  it("matches a browser preference to a supported language, region first", () => {
    expect(detectLanguage(["pt-BR", "en-US"])).toBe("pt");
    expect(detectLanguage(["ht-HT"])).toBe("ht");
    expect(detectLanguage(["fr-FR"])).toBe("en");
  });

  it("labels each language in its own script, with no flag emoji", () => {
    for (const language of LANGUAGES) {
      expect(language.nativeName.length).toBeGreaterThan(1);
      expect(languageMeta(language.code).intlLocale).toBe(language.intlLocale);
      expect(language.fontSet).toBeTruthy();
      // Flags are a known AI tell and pin Kreyol, Portuguese and Arabic to one country.
      expect(language.nativeName).not.toMatch(/\p{Extended_Pictographic}/u);
      expect(language.code2).not.toMatch(/\p{Extended_Pictographic}/u);
    }
    expect(languageMeta("de").code).toBe("en");
    expect(LANGUAGES.find((l) => l.code === "kea")?.intlLocale).toBe("pt-CV");
  });
});

describe("formatters", () => {
  it("formats money, numbers and dates in the locale, not en-US by default", () => {
    expect(formatCurrency(1234.5, "en")).toBe("$1,235");
    expect(formatCurrency(1234.5, "en", { cents: true })).toBe("$1,234.50");
    expect(formatNumber(1234, "vi")).toBe("1.234");
    expect(formatNumber(1234, "en")).toBe("1,234");
    expect(formatDate("2026-06-01", "en", "long")).toBe("June 1, 2026");
    expect(formatDate("2026-06-01", "zh", "long")).toContain("2026");
  });

  it("uses Monday-first weekday indexes, the convention every listing follows", () => {
    const monday = new Date(2026, 8, 7);
    const sunday = new Date(2026, 8, 6);
    expect(weekdayIndex(monday)).toBe(0);
    expect(weekdayIndex(sunday)).toBe(6);
    expect(formatWeekday(monday, "en")).toBe("Monday");
  });

  it("declares the placeholders a template uses so callers can satisfy them", () => {
    expect(placeholdersOf("{count} organizations")).toEqual(["count"]);
    expect(placeholdersOf("no tokens")).toEqual([]);
  });
});
