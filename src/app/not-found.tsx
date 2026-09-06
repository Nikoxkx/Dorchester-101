import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';

export default function NotFound() {
  return (
    <MainLayout>
      <div className="max-w-lg py-16">
        <p className="kicker">404</p>
        <h1 className="font-display text-5xl">That page isn&apos;t on the desk.</h1>
        <p className="text-[var(--muted)] mt-3">It may have moved, or the URL is off by a letter.</p>
        <div className="flex gap-3 mt-6">
          <Link href="/" className="bg-[var(--red)] text-white px-4 py-2 text-sm font-bold">Front page</Link>
          <Link href="/resources" className="border border-[var(--ink)] px-4 py-2 text-sm font-bold">Directory</Link>
        </div>
      </div>
    </MainLayout>
  );
}
