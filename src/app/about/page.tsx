import fs from 'node:fs';
import path from 'node:path';
import { AboutView } from './AboutView';
import { APP_VERSION, REPO_URL, SITE_FULL_NAME, SITE_NAME, SITE_URL } from '@/lib/site';
import { LANGUAGES } from '@/i18n/config';

/**
 * About, licence and the data contract, in one page.
 *
 * The credits block is read from `public/IMAGE-CREDITS.md` at build time rather
 * than copied into JSX. A licence note maintained in two places is a licence note
 * that is wrong in one of them.
 */
export const dynamic = 'force-static';

export const metadata = {
  title: 'About DOR101: how this list is kept correct',
  description:
    'Who maintains the Dorchester 101 directory, how every listing is checked against its source, which feeds the site reads and how often, and the licence for each photograph.',
  alternates: { canonical: '' },
  openGraph: {
    title: `About ${SITE_FULL_NAME}`,
    description: 'Method, data sources, refresh cadence and photo credits.',
    url: `${SITE_URL}/about`,
  },
};

export interface PhotoCredit {
  file: string;
  licence: string | null;
  note: string | null;
}

function readCredits(): PhotoCredit[] {
  const file = path.join(process.cwd(), 'public', 'IMAGE-CREDITS.md');
  let raw = '';
  try {
    raw = fs.readFileSync(file, 'utf8');
  } catch {
    return [];
  }
  const credits: PhotoCredit[] = [];
  let current: PhotoCredit | null = null;
  for (const line of raw.split(/\r?\n/)) {
    const heading = /^##\s+`?([^`]+)`?/.exec(line);
    if (heading) {
      if (current) credits.push(current);
      current = { file: heading[1].trim(), licence: null, note: null };
      continue;
    }
    if (!current) continue;
    const licence = /^-\s*\*\*Licence:\*\*\s*(.+)/.exec(line);
    if (licence) current.licence = licence[1].trim();
    const status = /^-\s*\*\*Status:\*\*\s*(.+)/.exec(line);
    if (status) current.note = status[1].replace(/\*\*/g, '').trim();
    const credit = /^-\s*\*\*Credit line used in the UI:\*\*\s*(.+)/.exec(line);
    if (credit) current.note = credit[1].replace(/[“”"]/g, '').trim();
  }
  if (current) credits.push(current);
  return credits.filter((credit) => credit.file.startsWith('img/'));
}

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    alternateName: SITE_FULL_NAME,
    url: `${SITE_URL}/about`,
    description: 'A free, open-source directory of help in Dorchester, Boston.',
    areaServed: { '@type': 'AdministrativeArea', name: 'Dorchester, Boston' },
    sameAs: [REPO_URL],
    codeRepository: REPO_URL,
    softwareVersion: APP_VERSION,
    inLanguage: LANGUAGES.map((language) => language.intlLocale),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AboutView credits={readCredits()} />
    </>
  );
}
