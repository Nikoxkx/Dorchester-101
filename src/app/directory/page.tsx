import { DirectoryView } from './DirectoryView';
import { SITE_URL } from '@/lib/site';

export const metadata = {
  title: 'All Dorchester services: the complete list',
  description:
    'Every organization DOR101 lists in one filterable table: hours, phone, accessibility and the date each entry was last checked against its own source.',
  alternates: { canonical: '' },
  openGraph: { title: 'All Dorchester services', description: 'The complete, printable DOR101 list.', url: `${SITE_URL}/directory` },
};

export default function DirectoryPage() {
  return <DirectoryView />;
}
