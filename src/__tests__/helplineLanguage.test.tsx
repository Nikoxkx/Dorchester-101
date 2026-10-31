import { createHash } from 'node:crypto';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RESOURCES, isResourceMappable } from '@/data/resources';
import { resourceDetails } from '@/i18n/resourceDetails';
import { LANGUAGES } from '@/i18n/config';
import { pick } from '@/i18n/runtime';
import { dictionaries } from '@/i18n';
import { search } from '@/lib/searchIndex';
import { useAppStore } from '@/stores/appStore';
import { globalCache } from '@/lib/cache';
import { GET } from '@/app/api/resources/route';

vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock('@/components/layout/MainLayout', () => ({ MainLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock('@/components/layout/ProjectNote', () => ({ ProjectNote: () => null }));
vi.mock('@/components/a11y/ReportProblem', () => ({ ReportProblem: () => null }));
vi.mock('@/components/a11y/ListenButton', () => ({ ListenButton: () => null }));
vi.mock('@/components/resources/QRPoster', () => ({ QRPoster: () => null }));
vi.mock('@/components/pwa/FieldNotes', () => ({ FieldNotes: () => null }));

import { ResourcesView } from '@/app/resources/ResourcesView';

const IDS = ['hcfa-helpline', 'boston-language-access'];
const byId = (id: string) => RESOURCES.find((r) => r.id === id)!;
// Change only after reviewing all language drafts against the new source facts.
const SOURCE_DIGEST = '74c4a41c011c82362e705bccb83a13291d9995c08a4cf0874b2f2aa5c292c824';

beforeEach(() => { useAppStore.getState().resetAll(); globalCache.clear(); });

describe('helpline and language-access records', () => {
  it('tracks the complete source for the first-pass translated fields', () => {
    const sources = IDS.map((id) => {
      const r = byId(id);
      return [id, r.name, r.summary.en, r.address, r.translateAddress, r.mapDestination, r.phone, r.website, r.operator, r.verification.source, r.neighborhood, r.hoursNote, r.eligibility, r.services];
    });
    expect(createHash('sha256').update(JSON.stringify(sources)).digest('hex')).toBe(SOURCE_DIGEST);
  });

  it('provides summaries and every present detail in all supported languages', () => {
    for (const id of IDS) {
      const r = byId(id);
      expect(isResourceMappable(r)).toBe(false);
      for (const { code } of LANGUAGES) {
        expect(pick(r.summary, code).used, `${id}: ${code} summary`).toBe(code);
        const detail = resourceDetails(r, code);
        for (const key of ['neighborhood', 'address', 'operator', 'source', 'hoursNote', 'eligibility', 'services'] as const) {
          const exists = key === 'source' ? Boolean(r.verification.source) : key === 'services' ? r.services.length > 0 : Boolean(r[key]);
          if (exists) expect(detail[key].used, `${id}: ${code}: ${key}`).toBe(code);
          expect(detail[key].fellBack, `${id}: ${code}: ${key}`).toBe(false);
        }
        expect(detail.services.value).toHaveLength(r.services.length);
        if (id === 'boston-language-access') {
          expect(pick(r.summary, code).value).toContain('(617) 635-3414');
          expect(detail.hoursNote.value).toContain('(617) 635-3414');
        }
      }
    }
  });

  it('distinguishes uncertain insurance hours from the 24-hour 311 line and separate complaints office', () => {
    const hcfa = byId('hcfa-helpline');
    const city = byId('boston-language-access');
    expect(hcfa.hours).toBeUndefined();
    expect(hcfa.hoursNote).toContain('confirm');
    expect(hcfa.verification.status).toBe('needs-review');
    expect(city.hours?.every((windows) => windows[0].startsAt === 0 && windows[0].endsAt === 1440)).toBe(true);
    expect(city.hoursNote).toContain('separate hours');
    expect(city.website).toContain('file-language-and-communications-access-complaint');
    expect(city.phone).toBe('(617) 635-4500');
  });

  it('uses localized copy and avoids physical accessibility or directions for phone services', () => {
    render(<ResourcesView />);
    act(() => useAppStore.getState().setLanguage('es'));
    const city = byId('boston-language-access');
    const card = screen.getByRole('heading', { name: city.name }).closest('article')!;
    expect(within(card).getByText(resourceDetails(city, 'es').address.value)).toBeTruthy();
    expect(within(card).queryByText(dictionaries.es['map.wheelchair'])).toBeNull();
    expect(card.querySelector('a[href*="google.com/maps"]')).toBeNull();
    fireEvent.click(within(card).getByRole('button', { name: dictionaries.es['directory.allHours'] }));
    expect(within(card).getByText(resourceDetails(city, 'es').hoursNote.value!)).toBeTruthy();
    expect(search('formularios de queja', { language: 'es', kinds: ['organization'], limit: 50 }).some((hit) => hit.id === 'org-boston-language-access')).toBe(true);
  });

  it('omits unknown/nonphysical accessibility and does not include phone services in the step-free filter', async () => {
    for (const id of IDS) {
      const body = await (await GET(new Request(`http://localhost/api/resources?id=${id}`))).json();
      expect(body.results[0].location).toBeNull();
      expect(body.results[0].accessibility).toBeNull();
    }
    const body = await (await GET(new Request('http://localhost/api/resources?stepFree=1'))).json();
    expect(body.results.some((r: { id: string }) => IDS.includes(r.id))).toBe(false);
  });
});
