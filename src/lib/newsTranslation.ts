/**
 * Optional server-side translation of public, built-in news-feed excerpts only.
 * Nothing from a visitor's search, feedback or custom feed is sent to the service.
 * The provider is disabled unless an operator explicitly enables it AND supplies
 * credentials and a positive per-process daily character budget.
 *
 * This limit and cache are per instance, not a distributed billing cap. Operators
 * must also configure a provider-side spending limit before enabling the service.
 */
import { createHash } from 'node:crypto';
import { AccessKey, Translator } from '@translated/lara';
import { NEWS_FEEDS } from '@/data/feeds';
import type { LanguageCode } from '@/i18n/config';
import type { Article } from '@/app/api/news/route';

const LARA_LOCALES: Record<LanguageCode, string> = {
  en: 'en-US', es: 'es-419', ht: 'ht-HT', pt: 'pt-BR', vi: 'vi-VN',
  zh: 'zh-CN', ar: 'ar-SA', so: 'so-SO', kea: 'kea-CV',
};
const BUILTIN_FEEDS = new Map(NEWS_FEEDS.map((feed) => [feed.id, feed.language]));
const TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 3000;
const MAX_PER_REQUEST = 60;
const MAX_SOURCE_CHARS = 1000;
const CONCURRENCY = 10;

interface Translation {
  title: string;
  summary: string;
}
const cache = new Map<string, { value: Translation; expires: number }>();
const inFlight = new Map<string, Promise<Translation | null>>();
let budgetDay = '';
let budgetUsed = 0;
let provider: { key: string; client: Translator } | null = null;

function configuration() {
  if (process.env.NEWS_TRANSLATION_PROVIDER !== 'lara') return null;
  const id = process.env.LARA_ACCESS_KEY_ID?.trim();
  const secret = process.env.LARA_ACCESS_KEY_SECRET?.trim();
  const rawBudget = process.env.NEWS_TRANSLATION_DAILY_CHARS ?? '';
  if (!id || !secret || !/^\d+$/.test(rawBudget)) return null;
  // An explicit positive bound is mandatory; never use an unbounded default.
  const budget = Math.min(Number(rawBudget), 250_000);
  if (!Number.isSafeInteger(budget) || budget < 1) return null;
  return { id, secret, budget };
}

function reserveCharacters(chars: number, budget: number): boolean {
  const day = new Date().toISOString().slice(0, 10);
  if (day !== budgetDay) {
    budgetDay = day;
    budgetUsed = 0;
  }
  if (budgetUsed + chars > budget) return false;
  // Reserve before making a request, including failures (the provider may bill
  // a timed-out request). One Node instance cannot oversubscribe its own budget.
  budgetUsed += chars;
  return true;
}

/** Reject translations that drop or change numeric details, allowing digit scripts
 * and reordered numbers. Conservative failures remain in the source language. */
function numberTokens(text: string): string[] {
  const ascii = text.replace(/[٠-٩۰-۹０-９]/g, (digit) => {
    const code = digit.charCodeAt(0);
    const base = code >= 0xff10 ? 0xff10 : code >= 0x06f0 ? 0x06f0 : 0x0660;
    return String(code - base);
  });
  return (ascii.match(/\d+/g) ?? []).sort();
}

async function translateOne(article: Article, target: LanguageCode): Promise<Translation | null> {
  const config = configuration();
  const source = BUILTIN_FEEDS.get(article.sourceId);
  if (!config || !source || source !== article.language || source === target) return null;
  const title = article.title.trim();
  const summary = article.summary.trim();
  if (!title || title.length + summary.length > MAX_SOURCE_CHARS) return null;
  // Hash both fields, languages and a schema version so changed stories never
  // reuse stale translations. The cached value never contains provider keys.
  const key = createHash('sha256').update(JSON.stringify([1, source, target, title, summary])).digest('hex');
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) return cached.value;
  if (cached) cache.delete(key);
  const pending = inFlight.get(key);
  if (pending) return pending;
  if (!reserveCharacters(title.length + summary.length, config.budget)) return null;

  const task = (async () => {
    try {
      const providerKey = `${config.id}\0${config.secret}`;
      if (!provider || provider.key !== providerKey) {
        provider = { key: providerKey, client: new Translator(new AccessKey(config.id, config.secret), { connectionTimeoutMs: 3500 }) };
      }
      // The title and summary belong to the same article, so they may share
      // context. Never batch unrelated articles or use HTML from a publisher.
      const input = summary ? [title, summary] : [title];
      const result = await provider.client.translate(input, LARA_LOCALES[source], LARA_LOCALES[target], {
        contentType: 'text/plain', style: 'faithful', timeoutInMillis: 3500, noTrace: true,
        adaptTo: [],
      });
      const output = result.translation;
      if (!Array.isArray(output) || output.length !== input.length || output.some((s) => typeof s !== 'string' || !s.trim() || s.length > 4000)) return null;
      if (input.some((sourceText, i) => JSON.stringify(numberTokens(sourceText)) !== JSON.stringify(numberTokens(output[i])))) return null;
      const value = { title: output[0].trim(), summary: summary ? output[1].trim() : '' };
      if (cache.size >= MAX_CACHE_ENTRIES) cache.delete(cache.keys().next().value!);
      cache.set(key, { value, expires: Date.now() + TTL_MS });
      return value;
    } catch {
      // An outage, invalid response, quota exhaustion or unsupported language
      // leaves the publisher's original intact. Never expose credentials/errors.
      return null;
    }
  })();
  inFlight.set(key, task);
  try {
    return await task;
  } finally {
    inFlight.delete(key);
  }
}

/** Return originals or translated copies; keep the original for comparison. */
export async function translateNewsArticles(articles: Article[], target: LanguageCode): Promise<Article[]> {
  if (!configuration()) return articles;
  const result = articles.slice();
  let next = 0;
  const count = Math.min(articles.length, MAX_PER_REQUEST);
  const worker = async () => {
    while (next < count) {
      const index = next++;
      const original = articles[index];
      const translated = await translateOne(original, target);
      if (translated) {
        result[index] = {
          ...original,
          title: translated.title,
          summary: translated.summary,
          language: target,
          translation: { originalTitle: original.title, originalSummary: original.summary, originalLanguage: original.language },
        };
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, count) }, () => worker()));
  return result;
}
