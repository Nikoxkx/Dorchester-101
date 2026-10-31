import { createHash } from 'node:crypto';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RESOURCES, isResourceMappable } from '@/data/resources';
import { LANGUAGES } from '@/i18n/config';
import { dictionaries } from '@/i18n';
import { resourceDetails } from '@/i18n/resourceDetails';
import { pick } from '@/i18n/runtime';
import { FOOD_FAQ_ANSWERS } from '@/app/faq/answers.food';
import { SPANISH_FAQ_ANSWERS } from '@/app/faq/answers.es';
import { search } from '@/lib/searchIndex';
import { useAppStore } from '@/stores/appStore';
import { globalCache } from '@/lib/cache';
import { GET as resourcesGET } from '@/app/api/resources/route';

vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock('@/components/layout/MainLayout', () => ({ MainLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock('@/components/layout/ProjectNote', () => ({ ProjectNote: () => null }));
vi.mock('@/components/a11y/ReportProblem', () => ({ ReportProblem: () => null }));
vi.mock('@/components/a11y/ListenButton', () => ({ ListenButton: () => null }));
vi.mock('@/components/resources/QRPoster', () => ({ QRPoster: () => null }));
vi.mock('@/components/pwa/FieldNotes', () => ({ FieldNotes: () => null }));
vi.mock('@/components/projects/SiteImagery', () => ({ SiteImagery: () => null }));

import FoodPageView from '@/app/food/FoodPageView';
import { ResourcesView } from '@/app/resources/ResourcesView';
import { DirectoryView } from '@/app/directory/DirectoryView';
import { PlaceSheet } from '@/components/map/PlaceSheet';

const IDS = ['bostons-food-district', 'gbfb-dorchester', 'codman-square-community-market', 'fair-foods-lena-park', 'dorchester-food-coop'];
const byId = (id: string) => RESOURCES.find((r) => r.id === id)!;
const hotline = byId(IDS[0]);
const foodBank = byId(IDS[1]);
const codman = byId(IDS[2]);
const fair = byId(IDS[3]);
const detailsSourceDigest = '759981ae3dcdea2144694c6dd95dd58918272f8502cf8c4ef9a107ed063f5e62';

beforeEach(() => useAppStore.getState().resetAll());

describe('food resource translation and safety', () => {
  it('tracks the complete English sources for these AI-assisted detail drafts', () => {
    const sources = IDS.map((id) => {
      const r = byId(id);
      return [id, r.summary.en, r.address, r.translateAddress, r.mapDestination, r.operator, r.verification.source, r.neighborhood, r.hoursNote, r.eligibility, r.transit, r.services];
    });
    expect(createHash('sha256').update(JSON.stringify(sources)).digest('hex'), 'Re-review food details if their English sources change').toBe(detailsSourceDigest);
  });

  it('provides all present food details in all nine languages', () => {
    for (const id of IDS) {
      const r = byId(id);
      for (const { code } of LANGUAGES) {
        const detail = resourceDetails(r, code);
        expect(pick(r.summary, code).used, `${id} ${code} summary`).toBe(code);
        expect(pick(r.summary, code).fellBack, `${id} ${code} summary`).toBe(false);
        for (const field of ['neighborhood', 'operator', 'source', 'hoursNote', 'eligibility', 'transit', 'services'] as const) {
          const exists = field === 'source' ? Boolean(r.verification.source) : field === 'services' ? r.services.length > 0 : Boolean(r[field]);
          if (exists) expect(detail[field].used, `${id} ${code} ${field}`).toBe(code);
          expect(detail[field].fellBack, `${id} ${code} ${field}`).toBe(false);
        }
        expect(detail.services.value).toHaveLength(r.services.length);
        if (r.translateAddress) {
          expect(detail.address.used, `${id} ${code} address`).toBe(code);
          expect(detail.address.fellBack).toBe(false);
        }
      }
    }
  });

  it('treats conflicting Codman schedules and Fair Foods availability as unconfirmed', () => {
    expect(codman.hours).toBeUndefined();
    expect(fair.hours).toBeUndefined();
    expect(codman.requiresId).toBeUndefined();
    expect(fair.requiresId).toBeUndefined();
    expect(codman.verification.status).toBe('needs-review');
    expect(fair.verification.status).toBe('needs-review');
    expect(codman.summary.en).toContain('ID or address requirements');
    expect(codman.summary.en).not.toContain('no ID');
    expect(fair.summary.en).toContain('Call (617) 533-8133');
    expect(fair.summary.en).toContain('$2');
    const coop = byId('dorchester-food-coop');
    expect(coop.hours).toBeUndefined(); // weekly open badges would ignore holiday closures
    expect(coop.hoursNote).toContain('Holiday hours differ');
    expect(coop.eligibility).toContain('not required');
    expect(coop.transit).toContain('15 and 17');
  });

  it('retains cautious guidance and phone numbers in every translated FAQ', () => {
    const answers = { es: SPANISH_FAQ_ANSWERS.food, ...FOOD_FAQ_ANSWERS };
    const forbiddenCodman: Record<string, string> = {
      es: 'no se requiere identificación', ht: 'pa bezwen pyès idantite', pt: 'não é exigido documento',
      vi: 'không cần giấy tờ tùy thân', zh: '无需身份证件', ar: 'لا تُطلب هوية',
      so: 'aqoonsi looma baahna', kea: 'ka mesti identifikason',
    };
    for (const [lang, answer] of Object.entries(answers)) {
      const codmanSection = answer.split('1. **Codman Square Community Market**')[1].split('2. **Salvation Army')[0];
      expect(codmanSection.toLowerCase(), lang).not.toContain(forbiddenCodman[lang]);
      expect(codmanSection, lang).toContain('(617) 825-9660');
      expect(answer, lang).toContain('(617) 533-8133');
      expect(answer, lang).toContain('$2');
      expect(answer, lang).toContain('1-800-645-8333');
    }
  });

  it('labels finder, paid-market and pantry types separately', () => {
    render(<FoodPageView />);
    for (const [r, kind] of [[hotline, 'food.type.finder'], [foodBank, 'food.type.finder'], [fair, 'food.type.market'], [byId('dorchester-food-coop'), 'food.type.market'], [codman, 'food.type.pantry']] as const) {
      const card = screen.getByRole('heading', { name: r.name }).closest('article')!;
      expect(within(card).getByText(dictionaries.en[kind])).toBeTruthy();
    }
    expect(screen.getByText(dictionaries.en['food.description'])).toBeTruthy();
  });

  it('renders translated food details, supports translated search, and changes language live', () => {
    useAppStore.getState().setLanguage('es');
    render(<FoodPageView />);
    expect(screen.getByText(dictionaries.es['clothing.translationDraft'])).toBeTruthy();
    const codmanCard = screen.getByRole('heading', { name: codman.name }).closest('article')!;
    const translated = resourceDetails(codman, 'es');
    expect(within(codmanCard).getByText(translated.hoursNote.value!).getAttribute('lang')).toBe('es');
    expect(within(codmanCard).queryByText(dictionaries.es['lang.detailsEnglish'])).toBeNull();
    const hotlineCard = screen.getByRole('heading', { name: hotline.name }).closest('article')!;
    expect(within(hotlineCard).getByText(resourceDetails(hotline, 'es').address.value).getAttribute('lang')).toBe('es');
    fireEvent.change(screen.getByPlaceholderText(dictionaries.es['food.search']), { target: { value: 'servicio telefónico' } });
    expect(screen.getByRole('heading', { name: hotline.name })).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText(dictionaries.es['food.search']), { target: { value: '' } });
    act(() => useAppStore.getState().setLanguage('ar'));
    const fairCard = screen.getByRole('heading', { name: fair.name }).closest('article')!;
    expect(within(fairCard).getByText(resourceDetails(fair, 'ar').hoursNote.value!).getAttribute('lang')).toBe('ar');
    expect(within(fairCard).getByText(fair.summary.ar!).getAttribute('lang')).toBe('ar');
    expect(search('خدمة هاتفية', { language: 'ar', kinds: ['organization'], limit: 50 }).find((hit) => hit.id === `org-${hotline.id}`)?.subtitle).toContain(resourceDetails(hotline, 'ar').address.value);
  });

  it.each([['food', FoodPageView], ['resources', ResourcesView], ['directory', DirectoryView]])(
    'does not present the hotline or warehouse finder as map destinations in %s', (_name, View) => {
      render(<View />);
      for (const r of [hotline, foodBank]) {
        const card = screen.getByRole('heading', { name: r.name }).closest('article')!;
        expect(isResourceMappable(r)).toBe(false);
        expect(within(card).queryByRole('link', { name: dictionaries.en['directory.openMap'] })).toBeNull();
      }
    },
  );

  it('suppresses directions even for a directly opened non-walk-in sheet', () => {
    render(<PlaceSheet target={{ kind: 'place', id: hotline.id }} arrivals={[]} arrivalsLive={false} userPosition={null} onClose={() => {}} onSelectStop={() => {}} onLocate={() => {}} />);
    expect(screen.queryByText(dictionaries.en['map.getThere'])).toBeNull();
    expect(screen.queryByText(dictionaries.en['map.nearestTransit'])).toBeNull();
    const hit = search('FoodSource Hotline', { kinds: ['organization'], limit: 50 }).find((item) => item.id === `org-${hotline.id}`)!;
    expect(hit.lat).toBeUndefined();
    expect(hit.lng).toBeUndefined();
  });

  it('returns no coordinates for non-destination records in the public API', async () => {
    globalCache.clear();
    try {
      for (const id of [hotline.id, foodBank.id, 'hcfa-helpline', 'boston-language-access', 'housing-navigator-ma']) {
        const response = await resourcesGET(new Request(`http://localhost/api/resources?id=${id}`));
        const body = await response.json();
        expect(body.results[0].location, id).toBeNull();
      }
    } finally {
      globalCache.clear();
    }
  });
});
