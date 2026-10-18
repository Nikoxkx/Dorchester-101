import { SITE_URL } from "@/lib/site";

/**
 * Helpers to generate JSON-LD structured data for search engines.
 * All helpers are pure functions; pages call them inside server components.
 */

export interface Breadcrumb { name: string; url: string }

export function breadcrumbJsonLd(items: Breadcrumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: new URL(item.url, SITE_URL).toString(),
    })),
  };
}

export function faqJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function datasetJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  keywords?: string[];
  creator?: string;
  temporalCoverage?: string;
  distributionUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: opts.name,
    description: opts.description,
    url: new URL(opts.url, SITE_URL).toString(),
    keywords: opts.keywords,
    creator: { "@type": "Organization", name: opts.creator ?? "DOR101" },
    temporalCoverage: opts.temporalCoverage,
    distribution: opts.distributionUrl
      ? { "@type": "DataDownload", contentUrl: opts.distributionUrl }
      : undefined,
    includedInDataCatalog: { "@type": "DataCatalog", name: "DOR101" },
  };
}

export function placeJsonLd(resource: {
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string | null;
  website?: string | null;
  hoursNote?: string | null;
  neighborhood?: string;
  category?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name: resource.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: resource.address,
      addressLocality: "Dorchester",
      addressRegion: "MA",
      addressCountry: "US",
    },
    geo: { "@type": "GeoCoordinates", latitude: resource.lat, longitude: resource.lng },
    telephone: resource.phone ?? undefined,
    url: resource.website ?? undefined,
    description: resource.hoursNote ?? undefined,
    containedInPlace: resource.neighborhood ? { "@type": "Place", name: resource.neighborhood } : undefined,
    additionalType: resource.category ? `https://dor101.org/${resource.category}` : undefined,
  };
}
