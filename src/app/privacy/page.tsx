import { MainLayout } from '@/components/layout/MainLayout';

export const metadata = { title: 'Privacy — DORCHESTER 101' };

export default function PrivacyPage() {
  return (
    <MainLayout>
      <article className="max-w-2xl space-y-4 text-sm leading-relaxed">
        <header className="pb-7 border-b-2 border-[var(--charcoal)]">
          <p className="masthead-date mb-3">11/12 — Legal · plain language</p>
          <h1 className="font-display font-bold uppercase leading-[0.95] tracking-[0.005em] text-[clamp(1.9rem,4vw,3rem)] text-[var(--charcoal)]">Privacy</h1>
          <p className="text-[var(--muted)] mt-3.5">Last written September 2026.</p>
        </header>
        <p>
          DOR101 is a neighborhood directory. We do not run ads, we do not sell lists, and we do not
          require an account. That is the whole privacy policy in one sentence.
        </p>
        <h2 className="font-display text-2xl pt-2">What stays on your device</h2>
        <p>
          Language, theme, type size, and onboarding flags live in local storage. Favorites and notes, if you save them, stay in the browser. We do not sync them to a server.
        </p>
        <h2 className="font-display text-2xl pt-2">What the site fetches</h2>
        <p>
          Pages call our own API routes, which in turn read published city, MBTA, HUD, and news sources. Those requests go through this host. If you install the PWA, the service worker caches pages and API JSON so DOR101 still opens on a bad T ride.
        </p>
        <h2 className="font-display text-2xl pt-2">Analytics</h2>
        <p>
          This copy of DOR101 does not ship a third-party analytics pixel. If a future operator adds one, they should name it here.
        </p>
        <h2 className="font-display text-2xl pt-2">Contact</h2>
        <p>
          Questions about this notice: the GitHub repository is the source of truth for who
          maintains the code — open an issue there and a maintainer will reply.
        </p>
      </article>
    </MainLayout>
  );
}
