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
    'Coat programs and referral finders around Boston. Availability, eligibility and costs may vary; contact providers before travelling. A website response does not verify stock or listing details.',
  alternates: { canonical: '/winter-clothing' },
  ...socialMetadata({
    title: 'Free coats and winter clothing near Dorchester',
    description: 'Coat programs and referral finders; contact providers to confirm availability.',
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
