import { NewsPageView } from './NewsPageView';
import { SITE_URL } from '@/lib/site';

/**
 * Metadata lives here, in a server component, while the feed itself is a client
 * island. That split is what lets a search engine, a link preview and a text-mode
 * browser see a real headline block instead of an empty `<div>`, which is the most
 * common structural failure of a client-rendered site.
 */
export const metadata = {
  title: 'Dorchester local news: Boston headlines with dates and sources',
  description:
    'Housing, transit, food and community coverage for Dorchester, pulled from each publisher’s own RSS feed with publication time and source named. No rewriting, no invented stories.',
  alternates: { canonical: '' },
  openGraph: {
    title: 'Dorchester local news',
    description: 'Publisher headlines with age and source attached, refreshed while the page is open.',
    url: `${SITE_URL}/news`,
    type: 'website',
  },
};

export default function NewsPage() {
  return <NewsPageView />;
}
