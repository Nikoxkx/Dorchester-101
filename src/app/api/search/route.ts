import { NextResponse } from 'next/server';
import { z } from 'zod';
import { search, type SearchKind } from '@/lib/searchIndex';

export const dynamic = 'force-dynamic';

/**
 * Site search.
 *
 * The index is bundled and in-process, so this route works with no database and
 * no third-party search service, and answers in the visitor's own words: a phone
 * number typed as digits finds the organization that owns it.
 */

const KINDS: SearchKind[] = ['page', 'organization', 'stop', 'route'];

const schema = z.object({
  q: z.string().min(1).max(120),
  kinds: z
    .string()
    .optional()
    .transform((raw) => {
      if (!raw) return undefined;
      const picked = raw
        .split(',')
        .map((value) => value.trim())
        .filter((value): value is SearchKind => (KINDS as string[]).includes(value));
      return picked.length ? picked : undefined;
    }),
  limit: z.coerce.number().int().min(1).max(40).default(14),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = schema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: 'q must be 1-120 characters', results: [] }, { status: 400 });
  }
  const { q, kinds, limit } = parsed.data;
  const hits = search(q, { kinds, limit });

  return NextResponse.json(
    {
      query: q,
      total: hits.length,
      pages: hits.filter((h) => h.kind === 'page'),
      organizations: hits.filter((h) => h.kind === 'organization'),
      stops: hits.filter((h) => h.kind === 'stop'),
      routes: hits.filter((h) => h.kind === 'route'),
    },
    { headers: { 'cache-control': 'public, max-age=60, stale-while-revalidate=600' } }
  );
}
