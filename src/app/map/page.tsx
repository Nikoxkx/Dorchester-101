import { socialMetadata } from "@/lib/social";
import { MapPageView } from './MapPageView';
import { SITE_URL } from '@/lib/site';

/**
 * The page itself is a server component on purpose: the metadata block and the
 * shell around the map reach the HTML without waiting for JavaScript, so a search
 * engine, a link unfurler and a slow phone all get something real. The map stays a
 * client island because Leaflet cannot run anywhere else.
 */
export const metadata = {
  title: 'Dorchester map: MBTA lines, arrivals and community services',
  description:
    'Interactive map of Dorchester, Boston: Red Line, Mattapan Line, Fairmount Line and bus routes with live MBTA arrivals, service alerts and community resource pins; some listings need further review.',
  alternates: { canonical: '/map' },
  ...socialMetadata({
    title: 'Dorchester map: MBTA lines, arrivals and community services',
    description: 'Live arrivals, service alerts and community resources on one map.',
    url: `${SITE_URL}/map`,
  }),
};

export default function MapPage() {
  return <MapPageView />;
}
