import type { Dict, TranslationKey } from "./en";
import { languageMeta } from "./config";

/**
 * A deliberately small message formatter. It covers exactly the two ICU shapes
 * used in this codebase, interpolation and cardinal plurals, without pulling
 * in a 40 kB runtime. Behaviour matches CLDR for these cases because the
 * plural category comes from Intl.PluralRules, not from a hand-rolled rule.
 *
 *   '{count, plural, one {# result} other {# results}}'
 *   'Verified {date}'
 */

interface Tokens {
  [name: string]: string | number | undefined;
}

/** Splits "one {a {b}} other {c}" style plural bodies on top-level braces. */
function splitBranches(body: string): Array<[string, string]> {
  const branches: Array<[string, string]> = [];
  let i = 0;
  while (i < body.length) {
    while (i < body.length && (body[i] === " " || body[i] === "\n")) i++;
    const keyStart = i;
    while (i < body.length && body[i] !== "{" && body[i] !== " ") i++;
    const key = body.slice(keyStart, i).trim();
    while (i < body.length && body[i] !== "{") i++;
    if (body[i] !== "{") break;
    let depth = 0;
    const valueStart = i + 1;
    for (; i < body.length; i++) {
      if (body[i] === "{") depth++;
      else if (body[i] === "}") {
        depth--;
        if (depth === 0) break;
      }
    }
    const value = body.slice(valueStart, i);
    if (key) branches.push([key, value]);
    i++;
  }
  return branches;
}

function findClose(s: string, from: number): number {
  let depth = 0;
  for (let i = from; i < s.length; i++) {
    if (s[i] === "{") depth++;
    else if (s[i] === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return s.length;
}

function pluralCategory(count: number, locale: string): string {
  try {
    return new Intl.PluralRules(locale).select(count);
  } catch {
    return count === 1 ? "one" : "other";
  }
}

function render(pattern: string, tokens: Tokens, locale: string): string {
  let out = "";
  let i = 0;
  while (i < pattern.length) {
    const open = pattern.indexOf("{", i);
    if (open === -1) {
      out += pattern.slice(i);
      break;
    }
    out += pattern.slice(i, open);
    const close = findClose(pattern, open);
    const inner = pattern.slice(open + 1, close);
    const comma = inner.indexOf(",");
    if (comma === -1) {
      const name = inner.trim();
      const value = tokens[name];
      out += value === undefined || value === null ? "" : String(value);
    } else {
      const name = inner.slice(0, comma).trim();
      const rest = inner.slice(comma + 1).trim();
      const kind = rest
        .slice(0, rest.indexOf(",") === -1 ? rest.length : rest.indexOf(","))
        .trim();
      // Keep the branch keywords: `one {…} other {…}` must reach splitBranches
      // whole, so the body starts after the kind, not at the first brace.
      const body = rest.slice(kind.length).replace(/^\s*,\s*/, "");
      if (kind === "plural") {
        const n = Number(tokens[name] ?? 0);
        const branches = splitBranches(body);
        const cat = pluralCategory(n, locale);
        const exact = branches.find(([k]) => k === `=${n}`);
        const chosen =
          exact ??
          branches.find(([k]) => k === cat) ??
          branches.find(([k]) => k === "other") ??
          branches[0];
        const text = chosen ? chosen[1] : "";
        out += text
          .replace(/#/g, new Intl.NumberFormat(locale).format(n))
          .replace(/\{([a-zA-Z0-9_.]+)\}/g, (_, k: string) =>
            String(tokens[k] ?? ""),
          );
      } else {
        out += body.replace(/\{([a-zA-Z0-9_.]+)\}/g, (_, k: string) =>
          String(tokens[k] ?? ""),
        );
      }
    }
    i = close + 1;
  }
  return out;
}

export interface TranslateFn {
  <K extends TranslationKey>(key: K, tokens?: Tokens): string;
  (key: string, tokens?: Tokens): string;
}

export function makeTranslator(dict: Dict, localeCode: string): TranslateFn {
  const meta = languageMeta(localeCode);
  return (key: string, tokens: Tokens = {}) => {
    const pattern = dict[key as TranslationKey] ?? key;
    if (!/[{]/.test(pattern)) return pattern;
    return render(pattern, tokens, meta.intlLocale);
  };
}

/* ── Localized content ───────────────────────────────────────────────────
 * Page content (organisation blurbs, FAQ answers, neighborhood profiles)
 * lives beside the data it describes and is keyed by language. `pick`
 * returns the reader's language when it exists and otherwise reports that it
 * fell back, so the UI can say so out loud instead of pretending.
 */

export type Localized<T> = { en: T } & Partial<Record<string, T>>;

export interface PickResult<T> {
  value: T;
  /** True when the reader's language was not available and English was used. */
  fellBack: boolean;
  used: "en" | string;
}

export function pick<T>(record: Localized<T>, lang: string): PickResult<T> {
  const value = (record as Record<string, T | undefined>)[lang];
  if (value !== undefined && value !== null)
    return { value, fellBack: false, used: lang };
  return { value: record.en, fellBack: lang !== "en", used: "en" };
}

/** Number of content records that carry a translation for `lang`. */
export function contentCoverage<T>(
  records: Array<Localized<T>>,
  lang: string,
): { translated: number; total: number } {
  const total = records.length;
  const translated = records.filter(
    (r) => (r as Record<string, unknown>)[lang] !== undefined,
  ).length;
  return { translated, total };
}
