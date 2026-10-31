import { createHash } from 'node:crypto';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RESOURCES } from '@/data/resources';
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
import { DirectoryView } from '@/app/directory/DirectoryView';
import { PlaceSheet } from '@/components/map/PlaceSheet';

const IDS = ['codman-square-health', 'grove-hall-library', 'metro-housing-boston', 'somali-development-center', 'vietaid', 'cpcs-boston', 'st-mark-esol', 'college-bound-dorchester'];
const byId = (id: string) => RESOURCES.find((r) => r.id === id)!;
const health = byId(IDS[0]);
const library = byId(IDS[1]);
const metro = byId(IDS[2]);
const somali = byId(IDS[3]);
const vietaid = byId(IDS[4]);
const cpcs = byId(IDS[5]);
const stMark = byId(IDS[6]);
const uncornered = byId(IDS[7]);
// A digest detects source changes, not translation quality or current service status.
const SOURCE_DIGEST = 'be3bcf650b502f8fa69f62a4d8357fc6d31525dff0cb0bb5f77d8d94f401e730';

beforeEach(() => useAppStore.getState().resetAll());

describe('community, immigrant-service and legal language drafts', () => {
  it('requires re-review when an English source changes', () => {
    const sources = IDS.map((id) => {
      const r = byId(id);
      return [id, r.summary.en, r.address, r.operator, r.verification.source, r.neighborhood, r.hoursNote, r.eligibility, r.transit, r.services];
    });
    expect(createHash('sha256').update(JSON.stringify(sources)).digest('hex')).toBe(SOURCE_DIGEST);
  });

  it('provides every present summary and detail in all nine languages', () => {
    for (const id of IDS) {
      const r = byId(id);
      for (const { code } of LANGUAGES) {
        const summary = pick(r.summary, code);
        const detail = resourceDetails(r, code);
        expect(summary.used, `${id} ${code} summary`).toBe(code);
        expect(summary.fellBack, `${id} ${code} summary`).toBe(false);
        for (const field of ['neighborhood', 'operator', 'source', 'hoursNote', 'eligibility', 'transit', 'services'] as const) {
          const present = field === 'source' ? Boolean(r.verification.source) : field === 'services' ? r.services.length > 0 : Boolean(r[field]);
          if (present) expect(detail[field].used, `${id} ${code} ${field}`).toBe(code);
          expect(detail[field].fellBack, `${id} ${code} ${field}`).toBe(false);
        }
        expect(detail.services.value).toHaveLength(r.services.length);
        if (id === 'grove-hall-library') {
          expect(detail.hoursNote.value, code).toContain('10');
          expect(detail.hoursNote.value, code).toContain('9');
        }
        if (id === 'metro-housing-boston') {
          expect(summary.value, code).toContain('(617) 425-6700');
          expect(detail.hoursNote.value, code).toContain('9');
          expect(detail.hoursNote.value, code).toContain('HCEC');
          expect(detail.hoursNote.value, code).toContain('RAFT');
        }
        if (id === 'somali-development-center') {
          expect(summary.value, code).toContain('(617) 522-0700');
          expect(detail.hoursNote.value, code).toContain('(617) 522-0700');
          expect(detail.transit.value, code).toContain('10 Malcolm X Boulevard');
          expect(detail.address.used, code).toBe(code);
          expect(detail.address.fellBack, code).toBe(false);
          expect(detail.address.value, code).toContain('10 Malcolm X Boulevard');
        }
        if (id === 'vietaid') {
          expect(summary.value, code).toContain('(617) 822-3717');
          expect(detail.hoursNote.value, code).toContain('(617) 822-3717');
          expect(detail.address.used, code).toBe(code);
          expect(detail.address.fellBack, code).toBe(false);
          expect(detail.address.value, code).toContain('Suite E');
        }
        if (id === 'cpcs-boston') {
          expect(summary.value, code).toContain('(617) 482-6212');
          expect(detail.hoursNote.value, code).toContain('(617) 482-6212');
          expect(detail.address.used, code).toBe(code);
          expect(detail.address.fellBack, code).toBe(false);
          expect(detail.address.value, code).toContain('75 Federal Street');
        }
        if (id === 'codman-square-health') {
          expect(summary.value, code).toContain('637 Washington Street');
          expect(summary.value, code).toContain('450 Washington Street');
          expect(detail.services.value[5], code).toContain('450 Washington Street');
          expect(detail.hoursNote.value, code).toContain('(617) 822-8271');
        }
      }
    }
  });

  it('updates the former College Bound record to Uncornered without inventing walk-in service', () => {
    expect(uncornered.name).toBe('Boston Uncornered');
    expect(uncornered.address).toBe('222 Bowdoin Street, Dorchester, MA 02122');
    expect(uncornered.email).toBe('info@uncornered.org');
    expect(uncornered.phone).toBeUndefined();
    expect(uncornered.hours).toBeUndefined();
    expect(uncornered.mapDestination).toBe(false);
    expect(uncornered.verification.status).toBe('needs-review');
  });

  it('corrects St. Mark class fees and avoids treating its contact address as a class venue', () => {
    expect(stMark.summary.en).toContain('free English');
    expect(stMark.summary.en).toContain('Class locations and registration vary');
    expect(stMark.website).toContain('class-registration');
    expect(stMark.eligibility).not.toContain('$40');
    expect(stMark.accessibility).toBeUndefined();
    expect(stMark.mapDestination).toBe(false);
    expect(stMark.verification.status).toBe('needs-review');
  });

  it('distinguishes the two Codman addresses and avoids a single misleading open status', () => {
    expect(health.address).toBe('637 Washington Street, Dorchester, MA 02124');
    expect(health.hours).toBeUndefined(); // departments and appointments have different schedules
    expect(health.hoursNote).toContain('confirm hours and appointments');
    expect(health.eligibility).toContain('no one will be denied services for inability to pay');
    expect(health.eligibility).toContain('family size and income');
    expect(health.services).toContain('Community Market (food), 450 Washington Street');
    expect(health.verification.status).toBe('needs-review');
    expect(health.transit).not.toMatch(/\b47\b|\b51\b/);
  });

  it('uses BPL coordinates, qualifies printing fees and warns about schedule exceptions', () => {
    expect([library.lat, library.lng]).toEqual([42.3078687, -71.0812124]);
    expect(library.summary.en).toContain('printing fees may apply');
    expect(library.services).toContain('Printing (fees may apply)');
    expect(library.services).not.toContain('Free printing');
    expect(library.hoursNote).toContain('holidays or events');
    expect(library.hours).toBeUndefined(); // holidays and early closures make a computed badge misleading
    expect(library.hoursNote).toContain('Tuesday noon–8 PM');
    expect(library.hoursNote).toContain('Sunday closed');
    expect(library.verification.status).toBe('needs-review');
  });

  it('distinguishes the Metro Housing Resource Line, lobby and appointment rules', () => {
    expect(metro.hours).toBeUndefined(); // phone, lobby and appointments have different access
    expect(metro.hoursNote).toContain('Monday–Thursday, 9 AM–1 PM');
    expect(metro.hoursNote).toContain('Monday walk-ins begin at 9 AM until capacity');
    expect(metro.hoursNote).toContain('9 AM–3 PM');
    expect(metro.summary.en).toContain('usually requires an appointment');
    expect(metro.transit).toContain('Roxbury Crossing');
    expect([metro.lat, metro.lng]).toEqual([42.331733, -71.096389]);
    expect(metro.services).not.toContain('Landlord mediation');
    expect(metro.verification.status).toBe('needs-review');
  });

  it('uses the Somali center address and avoids unconfirmed schedules, accessibility and eligibility promises', () => {
    expect(somali.address).toBe('10 Malcolm X Boulevard, 2nd Floor, Roxbury, MA 02119');
    expect([somali.lat, somali.lng]).toEqual([42.32931, -71.08638]);
    expect(somali.hours).toBeUndefined();
    expect(somali.hoursNote).toContain('(617) 522-0700');
    expect(somali.accessibility?.stepFree).toBeUndefined();
    expect(somali.eligibility).toContain('eligibility, costs and availability vary');
    expect(somali.transit).not.toMatch(/5 min|Roxbury Crossing/);
    expect(somali.services).toContain('Interpretation and translation (confirm availability)');
    expect(somali.verification.status).toBe('needs-review');
  });

  it('separates VietAID programs from other organizations and does not assert unconfirmed hours', () => {
    expect(vietaid.address).toBe('42 Charles Street, Suite E, Dorchester, MA 02122');
    expect([vietaid.lat, vietaid.lng]).toEqual([42.29993, -71.06354]);
    expect(vietaid.hours).toBeUndefined();
    expect(vietaid.hoursNote).toContain('(617) 822-3717');
    expect(vietaid.accessibility?.stepFree).toBeUndefined();
    expect(vietaid.eligibility).toContain('cost requirements');
    expect(vietaid.services).toContain('Housing counseling and first-time homebuyer education');
    expect(vietaid.services).not.toContain('Citizenship classes'); // VACA is a separate organization
    expect(vietaid.services).not.toContain('HUD-approved housing counselling');
    expect(vietaid.verification.status).toBe('needs-review');
  });

  it('qualifies CPCS representation and sends eligibility and waiver questions to the court', () => {
    expect(cpcs.address).toBe('75 Federal Street, 6th Floor, Boston, MA 02110');
    expect([cpcs.lat, cpcs.lng]).toEqual([42.3551, -71.0567]);
    expect(cpcs.summary.en).toContain('when you have a right to one');
    expect(cpcs.summary.en).not.toContain('at your first appearance');
    expect(cpcs.eligibility).toContain('The court decides eligibility');
    expect(cpcs.eligibility).toContain('Fees or contributions may apply');
    expect(cpcs.eligibility).toContain('ask the court about waivers');
    expect(cpcs.hours).toBeUndefined();
    expect(cpcs.accessibility?.stepFree).toBeUndefined();
    expect(cpcs.services).toContain('Interpretation for clients (ask your lawyer)');
    expect(cpcs.verification.status).toBe('needs-review');
  });

  it('renders and indexes Spanish-language CPCS guidance', () => {
    useAppStore.getState().setLanguage('es');
    render(<ResourcesView />);
    fireEvent.change(screen.getByPlaceholderText(dictionaries.es['resources.search']), { target: { value: cpcs.name } });
    const card = screen.getByRole('heading', { name: cpcs.name }).closest('article')!;
    const detail = resourceDetails(cpcs, 'es');
    expect(within(card).getByText(pick(cpcs.summary, 'es').value).getAttribute('lang')).toBe('es');
    expect(within(card).getByText(detail.address.value).getAttribute('lang')).toBe('es');
    expect(within(card).getByText(detail.eligibility.value!).getAttribute('lang')).toBe('es');
    fireEvent.click(within(card).getByRole('button', { name: dictionaries.es['directory.allHours'] }));
    expect(within(card).getByText(detail.hoursNote.value!).getAttribute('lang')).toBe('es');
    expect(search('abogado de oficio', { language: 'es', kinds: ['organization'], limit: 50 }).some((item) => item.id === 'org-cpcs-boston')).toBe(true);
  });

  it('renders and indexes Vietnamese-language VietAID details', () => {
    useAppStore.getState().setLanguage('vi');
    render(<ResourcesView />);
    fireEvent.change(screen.getByPlaceholderText(dictionaries.vi['resources.search']), { target: { value: vietaid.name } });
    const card = screen.getByRole('heading', { name: vietaid.name }).closest('article')!;
    const detail = resourceDetails(vietaid, 'vi');
    expect(within(card).getByText(pick(vietaid.summary, 'vi').value).getAttribute('lang')).toBe('vi');
    expect(within(card).getByText(detail.address.value).getAttribute('lang')).toBe('vi');
    expect(within(card).getByText(detail.eligibility.value!).getAttribute('lang')).toBe('vi');
    fireEvent.click(within(card).getByRole('button', { name: dictionaries.vi['directory.allHours'] }));
    expect(within(card).getByText(detail.hoursNote.value!).getAttribute('lang')).toBe('vi');
    expect(search('người mua nhà lần đầu', { language: 'vi', kinds: ['organization'], limit: 50 }).some((item) => item.id === 'org-vietaid')).toBe(true);
  });

  it('renders and indexes Somali-language immigrant-service details', () => {
    useAppStore.getState().setLanguage('so');
    render(<ResourcesView />);
    fireEvent.change(screen.getByPlaceholderText(dictionaries.so['resources.search']), { target: { value: somali.name } });
    const card = screen.getByRole('heading', { name: somali.name }).closest('article')!;
    const detail = resourceDetails(somali, 'so');
    expect(within(card).getByText(pick(somali.summary, 'so').value).getAttribute('lang')).toBe('so');
    expect(within(card).getByText(detail.eligibility.value!).getAttribute('lang')).toBe('so');
    expect(within(card).getByText(detail.address.value).getAttribute('lang')).toBe('so');
    fireEvent.click(within(card).getByRole('button', { name: dictionaries.so['directory.allHours'] }));
    expect(within(card).getByText(detail.hoursNote.value!).getAttribute('lang')).toBe('so');
    expect(search('diyaar-garow shaqo', { language: 'so', kinds: ['organization'], limit: 50 }).some((item) => item.id === 'org-somali-development-center')).toBe(true);
  });

  it('renders and indexes Metro Housing appointment details in the selected language', () => {
    useAppStore.getState().setLanguage('es');
    render(<ResourcesView />);
    fireEvent.change(screen.getByPlaceholderText(dictionaries.es['resources.search']), { target: { value: metro.name } });
    const card = screen.getByRole('heading', { name: metro.name }).closest('article')!;
    const detail = resourceDetails(metro, 'es');
    expect(within(card).getByText(pick(metro.summary, 'es').value).getAttribute('lang')).toBe('es');
    fireEvent.click(within(card).getByRole('button', { name: dictionaries.es['directory.allHours'] }));
    expect(within(card).getByText(detail.hoursNote.value!).getAttribute('lang')).toBe('es');
    expect(search('derivaciones para obtener ayuda legal', { language: 'es', kinds: ['organization'], limit: 50 }).some((item) => item.id === 'org-metro-housing-boston')).toBe(true);
  });

  it('does not call a community resource a transit estimate in the map sheet', () => {
    useAppStore.getState().setLanguage('es');
    render(<PlaceSheet target={{ kind: 'place', id: metro.id }} arrivals={[]} arrivalsLive={false} userPosition={null} onClose={() => {}} onSelectStop={() => {}} onLocate={() => {}} />);
    const detail = resourceDetails(metro, 'es');
    expect(screen.getByText(detail.hoursNote.value!).getAttribute('lang')).toBe('es');
    expect(screen.getByText(detail.transit.value!).getAttribute('lang')).toBe('es');
    expect(screen.queryByText(dictionaries.es['map.sourceTimetable'])).toBeNull();
    expect(screen.getByText(dictionaries.es['map.sourceCredits'])).toBeTruthy();
  });

  it('shows localized details in resources and indexes their translated wording', () => {
    useAppStore.getState().setLanguage('es');
    render(<ResourcesView />);
    fireEvent.change(screen.getByPlaceholderText(dictionaries.es['resources.search']), { target: { value: library.name } });
    const card = screen.getByRole('heading', { name: library.name }).closest('article')!;
    const detail = resourceDetails(library, 'es');
    expect(within(card).getByText(pick(library.summary, 'es').value).getAttribute('lang')).toBe('es');
    expect(within(card).getByText(detail.transit.value!).getAttribute('lang')).toBe('es');
    expect(within(card).queryByText(dictionaries.es['lang.detailsEnglish'])).toBeNull();
    fireEvent.click(within(card).getByRole('button', { name: dictionaries.es['directory.allHours'] }));
    expect(within(card).getByText(detail.hoursNote.value!).getAttribute('lang')).toBe('es');
    expect(search('impresión puede tener costo', { language: 'es', kinds: ['organization'], limit: 50 }).some((item) => item.id === 'org-grove-hall-library')).toBe(true);
    expect(search('incapacidad de pago', { language: 'es', kinds: ['organization'], limit: 50 }).some((item) => item.id === 'org-codman-square-health')).toBe(true);
  });

  it('shows translated library schedules in the printable directory', () => {
    useAppStore.getState().setLanguage('pt');
    render(<DirectoryView />);
    const card = screen.getByRole('heading', { name: library.name }).closest('article')!;
    fireEvent.click(within(card).getByRole('button', { name: dictionaries.pt['directory.allHours'] }));
    expect(within(card).getByText(resourceDetails(library, 'pt').hoursNote.value!).getAttribute('lang')).toBe('pt');
  });

  it('shows translated health eligibility and distinct market address in the map sheet', () => {
    useAppStore.getState().setLanguage('ar');
    render(<PlaceSheet target={{ kind: 'place', id: health.id }} arrivals={[]} arrivalsLive={false} userPosition={null} onClose={() => {}} onSelectStop={() => {}} onLocate={() => {}} />);
    const detail = resourceDetails(health, 'ar');
    expect(screen.getByText(detail.eligibility.value!).getAttribute('lang')).toBe('ar');
    expect(screen.getByText(detail.services.value.slice(0, 6).join(' · ')).getAttribute('lang')).toBe('ar');
    expect(screen.queryByText(dictionaries.ar['lang.detailsEnglish'])).toBeNull();
  });
});
