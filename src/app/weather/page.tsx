import { Suspense } from 'react';
import WeatherPageView from './WeatherPageView';
import { SITE_URL } from '@/lib/site';

/**
 * Server wrapper so the page ships a title and description without waiting
 * for JavaScript; the forecast itself is a client island because it is read
 * live from the National Weather Service on every load.
 */
export const metadata = {
  title: 'Boston weather: live forecast, warnings and what to wear',
  description:
    'Live National Weather Service forecast for Dorchester, Boston: current conditions, hour-by-hour and 7-day forecast, active storm warnings, and clothing tips that follow the weather. Updated automatically, never typed in by hand.',
  alternates: { canonical: '/weather' },
  openGraph: {
    title: 'Boston weather for Dorchester',
    description: 'Live forecast, storm warnings and what-to-wear tips from the National Weather Service.',
    url: `${SITE_URL}/weather`,
  },
};

export default function WeatherPage() {
  return (
    <Suspense>
      <WeatherPageView />
    </Suspense>
  );
}
