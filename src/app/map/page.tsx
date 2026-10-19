import { MapPageView } from './MapPageView';
import { SITE_URL } from '@/lib/site';

/**
 * The page itself is a server component on purpose: the metadata block and the
 * shell around the map reach the HTML without waiting for JavaScript, so a search
 * engine, a link unfurler and a slow phone all get something real. The map stays a
 * client island because Leaflet cannot run anywhere else.
 */
export const metadata = {
  title: 'Dorchester map: MBTA lines, arrivals and verified services',
  description:
    'Interactive map of Dorchester, Boston: Red Line, Mattapan Line, Fairmount Line and bus routes with live MBTA arrivals, service alerts and every verified community resource pin.',
  alternates: { canonical: '/map' },
  openGraph: {
    images: [{ url: "/api/og?title=Live+MBTA+map&desc=Real-time+buses+and+trains%2C+arrivals%2C+alerts+and+every+Dorchester+resource+on+one+map.&kicker=DOR101+%C2%B7+LIVE+MAP", width: 1200, height: 630, type: "image/png", alt: "Dorchester 101" }],
    title: 'Dorchester map: MBTA lines, arrivals and verified services',
    description: 'Live arrivals, service alerts and community resources on one map.',
    url: `${SITE_URL}/map`,
    type: 'website',
  },
};

export default function MapPage() {
  return <MapPageView />;
}
