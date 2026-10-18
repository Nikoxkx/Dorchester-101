import { SITE_URL } from '@/lib/site';

/**
 * Browser search-engine registration (OpenSearch 1.1). Chrome/Edge/Firefox
 * pick this up from the <link rel="search"> in the root layout, so anyone
 * who has visited once can search Dorchester 101 straight from their
 * address bar ("dorchester-101 → Tab → food pantry"). The target is the
 * directory search the WebSite JSON-LD SearchAction already declares.
 */
export function GET() {
  const origin = new URL(SITE_URL).origin;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>Dorchester 101</ShortName>
  <Description>Free housing, food, live MBTA map, Boston weather and winter clothing for Dorchester, Boston.</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Image width="192" height="192" type="image/png">${origin}/icons/icon-192.png</Image>
  <Url type="text/html" template="${origin}/resources?q={searchTerms}"/>
</OpenSearchDescription>`;
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/opensearchdescription+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
