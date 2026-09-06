import type { MetadataRoute } from 'next';

const PATHS = [
  '/',
  '/affordable-housing',
  '/food',
  '/map',
  '/projects',
  '/market-trends',
  '/neighborhood',
  '/tools',
  '/news',
  '/resources',
  '/faq',
  '/settings',
  '/privacy',
  '/terms',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://github.com/Nikoxkx/Dorchester-101';
  const now = new Date();
  return PATHS.map((path) => ({
    url: `${base.replace(/\/$/, '')}${path}`,
    lastModified: now,
    changeFrequency: path === '/news' || path === '/map' ? 'hourly' : 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }));
}
