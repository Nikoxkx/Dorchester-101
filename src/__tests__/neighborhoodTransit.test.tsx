import { createHash } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { LANGUAGES } from '@/i18n/config';
import { dictionaries, translationKeys } from '@/i18n';
import { makeTranslator } from '@/i18n/runtime';
import { useAppStore } from '@/stores/appStore';
import { DORCHESTER_BUS_ROUTES } from '@/data/transit';
import {
  FAIRMOUNT_STATIONS, GUIDE_BUS_ROUTES, MATTAPAN_STATIONS, RED_STATIONS, TRANSIT_GUIDE_SOURCE_DIGEST,
} from '@/app/neighborhood/transitGuideData';
import { TransitGuide } from '@/app/neighborhood/TransitGuide';

// Prevent animations delaying accessible queries.
vi.mock('framer-motion', () => ({
  motion: { div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div> },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

beforeEach(() => { window.localStorage.clear(); useAppStore.getState().resetAll(); });

const sourceKeys = translationKeys.filter((key) => key.startsWith('neighborhoodTransit.'));

describe('neighborhood transit guide', () => {
  it('flags English source and shared route changes for translation synchronization', () => {
    const referenceRoutes = GUIDE_BUS_ROUTES.map(({ id }) => DORCHESTER_BUS_ROUTES.find((route) => route.id === id));
    expect(referenceRoutes.every(Boolean)).toBe(true);
    const source = [RED_STATIONS, MATTAPAN_STATIONS, FAIRMOUNT_STATIONS, GUIDE_BUS_ROUTES,
      referenceRoutes.map((route) => [route!.id, route!.longName]), sourceKeys.map((key) => [key, dictionaries.en[key]])];
    expect(createHash('sha256').update(JSON.stringify(source)).digest('hex')).toBe(TRANSIT_GUIDE_SOURCE_DIGEST);
  });

  it('does not describe nearby street routes as direct station connections', () => {
    expect(RED_STATIONS.find((station) => station.name === 'Savin Hill')?.connections).toEqual([]);
    expect(RED_STATIONS.find((station) => station.name === 'Shawmut')?.connections).toEqual([]);
    expect(FAIRMOUNT_STATIONS.find((station) => station.name === 'Four Corners/Geneva')?.connections).toEqual([{ type: 'bus', routes: '19' }]);
  });

  it.each(LANGUAGES)('localizes the transit guide and qualified fares in $nativeName', ({ code }) => {
    useAppStore.getState().setLanguage(code);
    const t = makeTranslator(dictionaries[code], code);
    const { container } = render(<TransitGuide />);
    expect(container.firstElementChild?.getAttribute('lang')).toBe(code);
    expect(container.firstElementChild?.getAttribute('dir')).toBe(code === 'ar' ? 'rtl' : 'ltr');
    if (code !== 'en') expect(screen.getByText(t('neighborhoodTransit.draft'))).toBeTruthy();

    const expand = (key: 'redTitle' | 'mattTitle' | 'fairTitle' | 'busTitle' | 'faresTitle') => {
      const button = screen.getByRole('button', { name: (name) => name.includes(t(`neighborhoodTransit.${key}`)) });
      fireEvent.click(button);
      return within(button.parentElement!);
    };
    const red = expand('redTitle');
    expect(red.getByText(t('neighborhoodTransit.redFare'))).toBeTruthy();
    expect(red.getByText(t('neighborhoodTransit.scheduleNotice'))).toBeTruthy();
    expect(t('neighborhoodTransit.redFare')).toContain('$2.40');
    expect(t('neighborhoodTransit.redFare')).toContain('$1.10');
    expect(red.getByText('Fields Corner')).toBeTruthy();
    expect(red.queryByText(/Every 4 minutes/i)).toBeNull();

    const mattapan = expand('mattTitle');
    expect(mattapan.getByText(t('neighborhoodTransit.mattNote'))).toBeTruthy();
    expect(t('neighborhoodTransit.mattNote')).toContain('Valley Road');
    expect(mattapan.getByText(t('neighborhoodTransit.mattFare'))).toBeTruthy();
    const fairmount = expand('fairTitle');
    expect(fairmount.getByText(t('neighborhoodTransit.fairFare'))).toBeTruthy();
    expect(t('neighborhoodTransit.fairFare')).toContain('1A');

    const buses = expand('busTitle');
    const description = t('neighborhoodTransit.routeVia', { from: 'Ashmont', to: 'Ruggles', via: 'Washington Street' });
    const route = buses.getByRole('link', { name: t('neighborhoodTransit.busRouteLabel', { number: '23', route: description }) });
    expect(route.getAttribute('href')).toBe('https://www.mbta.com/schedules/23/line');
    expect(within(route).getByText(description)).toBeTruthy();

    const fares = expand('faresTitle');
    for (const key of ['charlieBody', 'm7Body', 'reducedBody', 'incomeBody', 'seniorBody'] as const) {
      expect(fares.getByText(t(`neighborhoodTransit.${key}`))).toBeTruthy();
    }
    const senior = t('neighborhoodTransit.seniorBody');
    for (const fact of ['75', 'RMV', 'Mass ID', 'The RIDE']) expect(senior).toContain(fact);
    expect(fares.getByRole('link', { name: 'Car-Free Seniors' }).getAttribute('href')).toBe('https://www.mbta.com/fares/reduced/senior-charliecard');
    expect(fares.queryByText('Reloadable fare card with discounted fares')).toBeNull();
  });
});
