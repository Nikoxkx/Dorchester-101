import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SiteImagery, type ProjectVisual } from '@/components/projects/SiteImagery';
import { STATION_PHOTOS } from '@/data/stationPhotos';
import { useAppStore } from '@/stores/appStore';

describe('site photo and fallback', () => {
  it('does not present a satellite crop or an unrelated photo as a project photo', () => {
    const { container } = render(<SiteImagery lat={42.304} lng={-71.0625} label="1234 Washington St" sourceUrl="https://example.org/project" />);
    expect(screen.getByText('No verified photo available')).toBeTruthy();
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByRole('link', { name: /View project source/ }).getAttribute('href')).toBe('https://example.org/project');
    const url = new URL(screen.getByRole('link', { name: /Open in Google Maps/ }).getAttribute('href')!);
    expect(url.searchParams.get('query')).toBe('42.304,-71.0625');
  });

  it('labels and credits an accurately identified contextual photo', () => {
    const caption = 'Shawmut station next to the site; not the proposed building';
    render(<SiteImagery lat={42.29273} lng={-71.06595} label="150 Centre Street" contextPhoto={{ ...STATION_PHOTOS['place-smmnl'], caption }} />);
    expect(screen.getByAltText(caption)).toBeTruthy();
    expect(screen.getByText(caption)).toBeTruthy();
    expect(screen.getByText('Pi.1415926535')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'CC BY-SA 3.0' }).getAttribute('href')).toBe('https://creativecommons.org/licenses/by-sa/3.0/');
    expect(screen.getByRole('link', { name: 'Wikimedia Commons' }).getAttribute('href')).toContain('Shawmut_station_headhouse');
  });

  it('shows a project-sourced photo or explicitly labeled rendering with its credit', () => {
    useAppStore.getState().setLanguage('en');
    const visual: ProjectVisual = {
      src: 'https://poah.org/example-rendering.png',
      alt: 'Rendering of Columbia Crossing at 568 Columbia Road',
      caption: 'POAH rendering of Columbia Crossing.',
      kind: 'rendering',
      sourceUrl: 'https://poah.org/project',
      sourceName: 'POAH',
    };
    render(<SiteImagery lat={42.31587} lng={-71.06951} label="Columbia Crossing" visual={visual} />);
    expect(screen.getByRole('img', { name: visual.alt }).getAttribute('src')).toBe(visual.src);
    expect(screen.getByText(visual.caption)).toBeTruthy();
    expect(screen.getByText('Architectural renderings show a proposed design; they are not photographs of the current site.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Source: POAH' }).getAttribute('href')).toBe(visual.sourceUrl);
    expect(screen.queryByText('No verified photo available')).toBeNull();
  });
});
