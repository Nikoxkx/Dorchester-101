import { Suspense } from 'react';
import { ResourcesView } from './ResourcesView';
import { SITE_URL } from '@/lib/site';

/**
 * The boundary is a server component so the metadata reaches the HTML; the list
 * itself is a client island because its filters, its open-now computation and its
 * saved-places state all need the browser. `useSearchParams` inside that island
 * requires a Suspense boundary above it, or the whole route becomes dynamic.
 */
export const metadata = {
  title: 'Resource directory: Dorchester organizations and services',
  description:
    'Housing, food, health, legal and community services in Dorchester, Boston, each with hours, phone, languages, accessibility and the date it was last checked against its source.',
  alternates: { canonical: '' },
  openGraph: {
    title: 'Dorchester resource directory',
    description: 'Every listing carries its own verification date. Nothing is presented as checked when it is not.',
    url: `${SITE_URL}/resources`,
  },
};

export default function ResourcesPage() {
  return (
    <Suspense>
      <ResourcesView />
    </Suspense>
  );
}
