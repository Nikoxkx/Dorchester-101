import { socialMetadata } from "@/lib/social";
import { Suspense } from 'react';
import WinterClothingView from './WinterClothingView';
import { SITE_URL } from '@/lib/site';

/**
 * Server wrapper so the page ships a title and description without waiting
 * for JavaScript; the list is a client island because open-now, in-season
 * and the live official-page checks are computed at read time.
 */
export const metadata = {
  title: 'Free coats and winter clothing in Dorchester and Boston',
  description:
    'Verified places in Dorchester and Boston where winter coats and warm clothing are free: walk-in clothing programs, kids coat partners, veterans coats, seasonal drives and the 24/7 Mass 2-1-1 finder. Every listing carries its check date and is re-tested when the page loads.',
  alternates: { canonical: '/winter-clothing' },
  ...socialMetadata({
    title: 'Free coats and winter clothing near Dorchester',
    description: 'Checked listings, honest hours, and what to bring — nothing guessed.',
    url: `${SITE_URL}/winter-clothing`,
  }),
};

export default function WinterClothingPage() {
  return (
    <Suspense>
      <WinterClothingView />
    </Suspense>
  );
}
