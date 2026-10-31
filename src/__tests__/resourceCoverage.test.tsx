import { createHash } from 'node:crypto';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RESOURCES, isResourceMappable } from '@/data/resources';
import { LANGUAGES } from '@/i18n/config';
import { dictionaries } from '@/i18n';
import { resourceDetails } from '@/i18n/resourceDetails';
import { pick } from '@/i18n/runtime';
import { search } from '@/lib/searchIndex';
import { useAppStore } from '@/stores/appStore';

vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock('@/components/layout/MainLayout', () => ({ MainLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock('@/components/layout/ProjectNote', () => ({ ProjectNote: () => null }));
vi.mock('@/components/a11y/ReportProblem', () => ({ ReportProblem: () => null }));
vi.mock('@/components/a11y/ListenButton', () => ({ ListenButton: () => null }));
vi.mock('@/components/resources/QRPoster', () => ({ QRPoster: () => null }));
vi.mock('@/components/pwa/FieldNotes', () => ({ FieldNotes: () => null }));
vi.mock('@/components/projects/SiteImagery', () => ({ SiteImagery: () => null }));

import { ResourcesView } from '@/app/resources/ResourcesView';
import { PlaceSheet } from '@/components/map/PlaceSheet';

const IDS = [
  'dotbdc', 'fields-corner-main-street', 'columbia-savin-hill-civic',
  'uphams-corner-health', 'work-inc-dorchester', 'yawkey-center-adult-ed', 'abcd-esol',
];
const byId = (id: string) => RESOURCES.find((record) => record.id === id)!;
// A change detector, not proof of translation quality or current provider facts.
const SOURCE_DIGEST = 'be36f1cc7e6513da6f341bb5f7c654875c08528cd2fb2484255c5755fda07495';

beforeEach(() => useAppStore.getState().resetAll());

describe('resource directory coverage and safer locations', () => {
  it('has no untranslated authored summary or detail field for any record in any supported language', () => {
    for (const record of RESOURCES) {
      for (const { code } of LANGUAGES) {
        const summary = pick(record.summary, code);
        expect(summary.fellBack, `${record.id}/${code} summary`).toBe(false);
        expect(summary.used, `${record.id}/${code} summary`).toBe(code);
        const details = resourceDetails(record, code);
        for (const [field, value] of Object.entries(details)) {
          expect(value.fellBack, `${record.id}/${code} ${field}`).toBe(false);
        }
        expect(details.services.value, `${record.id}/${code} services`).toHaveLength(record.services.length);
        if (code !== 'en' && record.translateAddress) {
          expect(details.address.used, `${record.id}/${code} address`).toBe(code);
        }
      }
    }
  });

  it('requires re-review if the latest English source facts or location change', () => {
    const sources = IDS.map((id) => {
      const r = byId(id);
      return [id, r.summary.en, r.address, r.operator, r.verification.source, r.neighborhood,
        r.lat, r.lng, r.mapDestination, r.phone, r.email, r.hours, r.hoursNote, r.eligibility, r.transit, r.services];
    });
    expect(createHash('sha256').update(JSON.stringify(sources)).digest('hex')).toBe(SOURCE_DIGEST);
  });

  it('separates health-center locations and after-hours advice from emergencies', () => {
    const health = byId('uphams-corner-health');
    expect([health.lat, health.lng]).toEqual([42.312969, -71.068091]);
    expect(health.address).toContain('415 Columbia Road');
    expect(health.hours).toBeUndefined();
    expect(health.accessibility).toBeUndefined();
    expect(health.verification.status).toBe('needs-review');
    for (const { code } of LANGUAGES) {
      const summary = pick(health.summary, code).value;
      const detail = resourceDetails(health, code);
      for (const address of ['415 Columbia Road', '636 Columbia Road', '547 Columbia Road']) expect(summary, code).toContain(address);
      expect(detail.services.value[3], code).toContain('636 Columbia Road');
      expect(detail.services.value[5], code).toContain('547 Columbia Road');
      expect(detail.hoursNote.value, code).toContain('(617) 287-8000');
      expect(detail.hoursNote.value, code).toContain('911');
    }
  });

  it('uses the corrected Work Inc. address match and avoids unsupported hours and walk times', () => {
    const work = byId('work-inc-dorchester');
    expect(work.address).toBe('25 Beach Street, Dorchester, MA 02122');
    expect([work.lat, work.lng]).toEqual([42.303184, -71.054647]);
    expect(work.hours).toBeUndefined();
    expect(work.transit).toBeUndefined();
    expect(work.accessibility).toBeUndefined();
    expect(work.verification.status).toBe('needs-review');
    const stMark = byId('st-mark-esol');
    expect([stMark.lat, stMark.lng]).toEqual([work.lat, work.lng]);
    expect(isResourceMappable(stMark)).toBe(false);
  });

  it('distinguishes ESOL and basic-education eligibility and uses ABCD’s central phone', () => {
    const yawkey = byId('yawkey-center-adult-ed');
    const abcd = byId('abcd-esol');
    expect(yawkey.hours).toBeUndefined();
    expect(yawkey.address).toContain('185 Columbia Road');
    expect(abcd.phone).toBe('(617) 348-6000');
    expect(abcd.hours).toBeUndefined();
    expect(isResourceMappable(abcd)).toBe(false);
    for (const { code } of LANGUAGES) {
      const detail = resourceDetails(yawkey, code);
      expect(detail.eligibility.value, code).toContain('18');
      expect(detail.eligibility.value, code).toContain('16');
      expect(detail.hoursNote.value, code).toContain('(617) 506-6600');
      expect(resourceDetails(abcd, code).hoursNote.value, code).toContain('(617) 348-6000');
    }
  });

  it('corrects the two business-district pins and does not map an unconfirmed meeting site', () => {
    const dorchesterBay = byId('dotbdc');
    const fields = byId('fields-corner-main-street');
    const civic = byId('columbia-savin-hill-civic');
    expect([dorchesterBay.lat, dorchesterBay.lng]).toEqual([42.31725, -71.064984]);
    expect([fields.lat, fields.lng]).toEqual([42.301386, -71.059766]);
    expect(dorchesterBay.hours).toBeUndefined();
    expect(fields.transit).toBeUndefined();
    expect(isResourceMappable(civic)).toBe(false);
    expect(civic.email).toBe('president@columbiasavinhillcivic.org');
    for (const { code } of LANGUAGES) {
      expect(resourceDetails(fields, code).address.value).toContain('1444 Dorchester Avenue');
      expect(resourceDetails(dorchesterBay, code).address.value).toContain('594 Columbia Road');
      expect(resourceDetails(civic, code).neighborhood.value).toContain('Savin Hill');
    }
  });

  it('renders and indexes Spanish health-center details without an English fallback', () => {
    useAppStore.getState().setLanguage('es');
    render(<ResourcesView />);
    fireEvent.change(screen.getByPlaceholderText(dictionaries.es['resources.search']), { target: { value: "Upham's Corner Health Center" } });
    const health = byId('uphams-corner-health');
    const card = screen.getByRole('heading', { name: health.name }).closest('article')!;
    const detail = resourceDetails(health, 'es');
    expect(within(card).getByText(detail.eligibility.value!).getAttribute('lang')).toBe('es');
    expect(within(card).queryByText(dictionaries.es['lang.detailsEnglish'])).toBeNull();
    expect(search('clínicas dental y de la vista', { language: 'es', kinds: ['organization'], limit: 50 }).some((item) => item.id === 'org-uphams-corner-health')).toBe(true);
  });

  it('shows the translated floor and services on an Arabic map sheet', () => {
    useAppStore.getState().setLanguage('ar');
    render(<PlaceSheet target={{ kind: 'place', id: 'fields-corner-main-street' }} arrivals={[]} arrivalsLive={false} userPosition={null} onClose={() => {}} onSelectStop={() => {}} onLocate={() => {}} />);
    const details = resourceDetails(byId('fields-corner-main-street'), 'ar');
    expect(screen.getByText(details.address.value).getAttribute('lang')).toBe('ar');
    expect(screen.getByText(details.services.value.join(' · ')).getAttribute('lang')).toBe('ar');
    expect(screen.queryByText(dictionaries.ar['lang.detailsEnglish'])).toBeNull();
  });
});
