import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  RESOURCES,
  findResource,
  lastReviewedOn,
  reviewBacklog,
  verificationAge,
  verificationLevel,
  type ResourceRecord,
} from '@/data/resources';
import { BOSTON_TZ, isOpenNow, statusFor, windowsForDay } from '@/lib/hours';
import { globalCache, CACHE_TTL } from '@/lib/cache';
import { ApiError } from '@/lib/errors';

/**
 * The directory as JSON.
 *
 * This route used to carry its own hand-written copy of every organization, which
 * meant two files had to be edited for one phone number to change and the copy here
 * still claimed `lastVerified: '2026-06-01'` long after the dataset moved on. It now
 * serializes `src/data/resources.ts` — the same records the pages, the map and the
 * print view render — so a correction lands once and every consumer sees it.
 *
 * The verification stamp is computed per request from each record's own `checkedOn`
 * date rather than stored as a sentence, so nothing can assert "verified" that the
 * data cannot support.
 */

export const dynamic = 'force-dynamic';

const query = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
  open: z.enum(['1', 'true']).optional(),
  stepFree: z.enum(['1', 'true']).optional(),
  /** include records whose check is older than `staleDays`, or only those */
  staleOnly: z.enum(['1', 'true']).optional(),
  staleDays: z.coerce.number().int().min(1).max(3650).default(180),
  limit: z.coerce.number().int().min(1).max(200).default(100),
  id: z.string().optional(),
});

function serialize(record: ResourceRecord, now: Date) {
  const status = record.hours ? statusFor(record.hours, now, BOSTON_TZ) : null;
  const dayIndex = (now.getDay() + 6) % 7;
  return {
    id: record.id,
    name: record.name,
    category: record.category,
    operator: record.operator ?? null,
    neighborhood: record.neighborhood,
    address: record.address,
    location: { lat: record.lat, lng: record.lng },
    phone: record.phone ?? null,
    tty: record.tty ?? null,
    email: record.email ?? null,
    website: record.website ?? null,
    services: record.services,
    languages: record.languages ?? [],
    acceptsEbt: record.acceptsEbt ?? false,
    requiresId: record.requiresId ?? false,
    eligibility: record.eligibility ?? null,
    transit: record.transit ?? null,
    accessibility: record.accessibility ?? { stepFree: false },
    hours: {
      today: windowsForDay(record.hours ?? [], dayIndex),
      week: record.hours ?? null,
      note: record.hoursNote ?? null,
    },
    openNow: record.hours ? isOpenNow(record.hours, now, BOSTON_TZ) : null,
    status,
    verification: {
      checkedOn: record.verification.checkedOn,
      source: record.verification.source,
      status: record.verification.status,
      ageDays: verificationAge(record, now),
      level: verificationLevel(record, now),
    },
    detailHref: record.detailHref ?? `/resources?place=${record.id}`,
    summary: {
      en: record.summary.en,
      availableLanguages: Object.keys(record.summary).sort(),
    },
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = query.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    throw new ApiError('Invalid directory query', 400, 'BAD_REQUEST');
  }
  const { category, q, open, stepFree, staleOnly, staleDays, limit, id } = parsed.data;

  // The dataset is static and the clock only needs minute-level accuracy, so a
  // short shared cache keeps a page of 28 records from re-serializing on every hit.
  const cacheKey = `resources:${category ?? 'all'}:${q ?? ''}:${open ?? ''}:${stepFree ?? ''}:${staleOnly ?? ''}:${staleDays}:${limit}:${id ?? ''}`;
  const hit = globalCache.get(cacheKey);
  if (hit) {
    return NextResponse.json(hit, {
      headers: { 'cache-control': 'public, s-maxage=1800, stale-while-revalidate=3600' },
    });
  }

  const now = new Date();
  let records = id ? [findResource(id)].filter(Boolean) as ResourceRecord[] : RESOURCES;

  if (category && category !== 'all') records = records.filter((record) => record.category === category);
  if (stepFree) records = records.filter((record) => record.accessibility?.stepFree === true);
  if (open) records = records.filter((record) => (record.hours ? isOpenNow(record.hours, now, BOSTON_TZ) : false));
  if (staleOnly) records = records.filter((record) => verificationAge(record, now) > staleDays);
  if (q) {
    const needle = q.trim().toLowerCase();
    records = records.filter((record) =>
      [record.name, record.address, record.neighborhood, record.summary.en, record.services.join(' '), record.operator ?? '']
        .join(' ')
        .toLowerCase()
        .includes(needle)
    );
  }

  const total = id ? records.length : RESOURCES.length;
  const payload = {
    count: Math.min(records.length, limit),
    total,
    results: records.slice(0, limit).map((record) => serialize(record, now)),
    categories: RESOURCES.reduce<Record<string, number>>((acc, record) => {
      acc[record.category] = (acc[record.category] ?? 0) + 1;
      return acc;
    }, {}),
    updatedAt: now.toISOString(),
    review: { lastReviewedOn: lastReviewedOn(), ...reviewBacklog(now), staleAfterDays: staleDays },
    timezone: BOSTON_TZ,
    note: 'Open/closed values are computed in America/New_York from each record’s own hours. Nothing here is estimated.',
  };

  globalCache.set(cacheKey, payload, CACHE_TTL.RESOURCES);

  return NextResponse.json(payload, {
    headers: { 'cache-control': 'public, s-maxage=1800, stale-while-revalidate=3600' },
  });
}
