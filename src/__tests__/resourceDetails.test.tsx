import { createHash } from 'node:crypto';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RESOURCES } from '@/data/resources';
import { RESOURCE_DETAIL_DRAFTS, resourceDetails } from '@/i18n/resourceDetails';
import { dictionaries } from '@/i18n';
import { LANGUAGES } from '@/i18n/config';
import { useAppStore } from '@/stores/appStore';
import { search } from '@/lib/searchIndex';

vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock('@/components/layout/MainLayout', () => ({ MainLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock('@/components/layout/ProjectNote', () => ({ ProjectNote: () => null }));
vi.mock('@/components/a11y/ReportProblem', () => ({ ReportProblem: () => null }));
vi.mock('@/components/a11y/ListenButton', () => ({ ListenButton: () => null }));
vi.mock('@/components/resources/QRPoster', () => ({ QRPoster: () => null }));
vi.mock('@/components/pwa/FieldNotes', () => ({ FieldNotes: () => null }));
vi.mock('@/components/projects/SiteImagery', () => ({ SiteImagery: () => null }));

import { ResourcesView } from '@/app/resources/ResourcesView';
import { DirectoryView } from '@/app/directory/DirectoryView';
import { PlaceSheet } from '@/components/map/PlaceSheet';

const bha = RESOURCES.find((record) => record.id === 'bha')!;
// Re-review every translated field if its English source changes.
const BHA_SOURCE_DIGEST = '768bba25c188a23375fc1e44bb3755994130f522e5292aa1c1d6b16f4da69985';

beforeEach(() => useAppStore.getState().setLanguage('en'));

describe('resource detail drafts', () => {
  it('tracks the complete English source and the corrected BHA contact', () => {
    const source = [bha.address, bha.operator, bha.verification.source, bha.neighborhood, bha.hoursNote, bha.eligibility, bha.transit, bha.services];
    expect(createHash('sha256').update(JSON.stringify(source)).digest('hex')).toBe(BHA_SOURCE_DIGEST);
    expect(bha.address).toBe('52 Chauncy Street, Boston, MA 02111');
    expect([bha.lat, bha.lng]).toEqual([42.3537, -71.0601]);
    expect(bha.eligibility).toContain('Anyone may apply');
    expect(bha.eligibility).not.toContain('Boston residents');
    expect(bha.verification.status).toBe('needs-review');
  });

  it('provides every field and service in each locale, with honest fallback elsewhere', () => {
    for (const { code } of LANGUAGES) {
      const details = resourceDetails(bha, code);
      for (const field of ['neighborhood', 'operator', 'hoursNote', 'eligibility', 'transit', 'services'] as const) {
        expect(details[field].used, `${code}: ${field}`).toBe(code);
        expect(details[field].fellBack, `${code}: ${field}`).toBe(false);
      }
      expect(details.services.value).toHaveLength(bha.services.length);
      if (code !== 'en') {
        expect(RESOURCE_DETAIL_DRAFTS.bha[code]?.hoursNote).toContain('9');
        expect(RESOURCE_DETAIL_DRAFTS.bha[code]?.hoursNote).toMatch(/4:30|16h30/);
      }
    }
    // Keep fallback behavior honest even when a future record has no drafts.
    const futureRecord = { ...bha, id: 'untranslated-future-record' };
    const fallback = resourceDetails(futureRecord, 'es');
    expect(fallback.hoursNote.fellBack).toBe(true);
    expect(fallback.hoursNote.used).toBe('en');
  });

  it('flags changes to the RAFT, legal-aid and tenant-union detail sources', () => {
    const records = ['raft-mass', 'gbLS-dorchester', 'city-life-vida-urbana'].map((id) => {
      const record = RESOURCES.find((item) => item.id === id)!;
      return [id, record.operator, record.verification.source, record.neighborhood, record.hoursNote, record.eligibility, record.transit, record.services];
    });
    expect(createHash('sha256').update(JSON.stringify(records)).digest('hex')).toBe('09984c77f1c35535d14fd8417273f5e6a1eec8baf901967d89f3b11ad6af5734');
  });

  it('provides the translated priority details without inventing absent fields', () => {
    for (const id of ['raft-mass', 'gbLS-dorchester', 'city-life-vida-urbana']) {
      const record = RESOURCES.find((item) => item.id === id)!;
      for (const { code } of LANGUAGES) {
        const detail = resourceDetails(record, code);
        for (const key of ['neighborhood', 'hoursNote', 'eligibility', 'transit', 'services', 'source'] as const) {
          const exists = key === 'source' ? Boolean(record.verification.source) : key === 'services' ? record.services.length > 0 : Boolean(record[key]);
          if (exists) expect(detail[key].used, `${id}: ${code}: ${key}`).toBe(code);
          expect(detail[key].fellBack, `${id}: ${code}: ${key}`).toBe(false);
        }
        expect(detail.services.value).toHaveLength(record.services.length);
        if (id === 'gbLS-dorchester') expect(detail.hoursNote.value).toContain('(617) 603-1807');
        if (id === 'city-life-vida-urbana') expect(detail.hoursNote.value).toMatch(/6:30|18h30/);
        if (id === 'raft-mass') expect(detail.operator.used).toBe(code);
      }
    }
  });

  it('shows translated RAFT operator and source, and finds translated legal-aid details', () => {
    useAppStore.getState().setLanguage('es');
    render(<ResourcesView />);
    fireEvent.change(screen.getByPlaceholderText(dictionaries.es['resources.search']), { target: { value: 'RAFT' } });
    const raft = RESOURCES.find((r) => r.id === 'raft-mass')!;
    const card = screen.getByRole('heading', { name: raft.name }).closest('article')!;
    const detail = resourceDetails(raft, 'es');
    expect(within(card).getByText(detail.operator.value!).getAttribute('lang')).toBe('es');
    expect(within(card).getByText(detail.source.value).getAttribute('lang')).toBe('es');
    expect(within(card).getByText(detail.eligibility.value!).getAttribute('lang')).toBe('es');
    expect(search('admisión de vivienda', { language: 'es', kinds: ['organization'], limit: 50 }).some((entry) => entry.id === 'org-gbLS-dorchester')).toBe(true);
  });

  it('renders localized eligibility, directions and expanded hours in resources', () => {
    useAppStore.getState().setLanguage('es');
    render(<ResourcesView />);
    fireEvent.change(screen.getByPlaceholderText(dictionaries.es['resources.search']), { target: { value: 'Boston Housing Authority' } });
    const card = screen.getByRole('heading', { name: bha.name }).closest('article')!;
    const details = resourceDetails(bha, 'es');
    expect(within(card).getByText(details.eligibility.value!).getAttribute('lang')).toBe('es');
    expect(within(card).getByText(details.transit.value!).getAttribute('lang')).toBe('es');
    expect(within(card).queryByText(dictionaries.es['lang.detailsEnglish'])).toBeNull();
    fireEvent.click(within(card).getByRole('button', { name: dictionaries.es['directory.allHours'] }));
    expect(within(card).getByText(details.hoursNote.value!).getAttribute('lang')).toBe('es');
    act(() => useAppStore.getState().setLanguage('ar'));
    expect(within(card).getByText(resourceDetails(bha, 'ar').eligibility.value!).getAttribute('lang')).toBe('ar');
  });

  it('shows localized neighborhood and hours in the printable directory', () => {
    useAppStore.getState().setLanguage('pt');
    render(<DirectoryView />);
    const details = resourceDetails(bha, 'pt');
    expect(screen.getByText(details.neighborhood.value).getAttribute('lang')).toBe('pt');
    // The directory keeps the full hours in a collapsible record.
    const card = screen.getByRole('heading', { name: bha.name }).closest('article')!;
    fireEvent.click(within(card).getByRole('button', { name: dictionaries.pt['directory.allHours'] }));
    expect(within(card).getByText(details.hoursNote.value!).getAttribute('lang')).toBe('pt');
  });

  it('renders translated details and services for different map sheets', () => {
    useAppStore.getState().setLanguage('zh');
    const { rerender } = render(<PlaceSheet target={{ kind: 'place', id: 'bha' }} arrivals={[]} arrivalsLive={false} userPosition={null} onClose={() => {}} onSelectStop={() => {}} onLocate={() => {}} />);
    const details = resourceDetails(bha, 'zh');
    expect(screen.getByText(details.eligibility.value!).getAttribute('lang')).toBe('zh');
    expect(screen.getByText(details.services.value.join(' · ')).getAttribute('lang')).toBe('zh');
    expect(screen.queryByText(dictionaries.zh['lang.detailsEnglish'])).toBeNull();
    expect(screen.queryByRole('button', { name: /JFK\/UMass/ })).toBeNull();
    rerender(<PlaceSheet target={{ kind: 'place', id: 'fields-corner-main-street' }} arrivals={[]} arrivalsLive={false} userPosition={null} onClose={() => {}} onSelectStop={() => {}} onLocate={() => {}} />);
    const fields = RESOURCES.find((record) => record.id === 'fields-corner-main-street')!;
    expect(screen.getByText(resourceDetails(fields, 'zh').services.value.join(' · ')).getAttribute('lang')).toBe('zh');
    expect(screen.queryByText(dictionaries.zh['lang.detailsEnglish'])).toBeNull();
  });

  it('indexes translated detail phrases and localizes global-search subtitles', () => {
    const hit = search('oficina principal está em reforma', { language: 'pt', kinds: ['organization'], limit: 50 }).find((entry) => entry.id === 'org-bha');
    expect(hit).toBeTruthy();
    expect(hit?.subtitle).toContain(resourceDetails(bha, 'pt').neighborhood.value);
    expect(search('public housing', { language: 'pt', kinds: ['organization'], limit: 50 }).some((entry) => entry.id === 'org-bha')).toBe(true);
  });
});
