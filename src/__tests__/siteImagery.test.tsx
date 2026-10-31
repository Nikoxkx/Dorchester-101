import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SiteImagery } from '@/components/projects/SiteImagery';
import { STATION_PHOTOS } from '@/data/stationPhotos';

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
});
