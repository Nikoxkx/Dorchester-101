import Link from 'next/link';

/** 404 — design-system page, no framework defaults. */
export default function NotFound() {
  return (
    <div className="min-h-dvh grid place-items-center px-6">
      <div className="content-card squircle p-8 md:p-12 text-center max-w-md w-full">
        <p className="kicker">404</p>
        <h1 className="text-title1 font-bold text-1 mt-2">Page not found</h1>
        <p className="text-subhead text-text-2 mt-2">
          The address may have changed. Search or pick a section.
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <Link
            href="/"
            className="inline-flex items-center h-11 px-5 rounded-full bg-ink text-canvas text-subhead font-semibold hover:opacity-85"
          >
            Dashboard
          </Link>
          <Link
            href="/resources"
            className="inline-flex items-center h-11 px-5 rounded-full glass glass-clear glass-edge text-subhead font-semibold text-1 hover:bg-[var(--glass-clear-hover)]"
          >
            Directory
          </Link>
        </div>
      </div>
    </div>
  );
}
