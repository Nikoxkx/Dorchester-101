import { Suspense } from 'react';
import FoodPageView from './FoodPageView';
import { SITE_URL } from '@/lib/site';

/**
 * Server wrapper so the page ships a title, a description and a preview image
 * without waiting for JavaScript; the list itself is a client island because the
 * open-now state is computed in the browser from the visitor’s clock.
 */
export const metadata = {
  title: 'Food help in Dorchester: pantries, meals and benefits',
  description:
    'Food pantries, hot meals, senior and kids programs and help applying for SNAP or WIC in Dorchester, Boston, with hours checked against each site and an open-now reading in your local time.',
  alternates: { canonical: '' },
  openGraph: {
    title: 'Food help in Dorchester',
    description: 'Every site comes from the same checked dataset the map and directory use.',
    url: `${SITE_URL}/food`,
  },
};

export default function FoodPage() {
  return (
    <Suspense>
      <FoodPageView />
    </Suspense>
  );
}
