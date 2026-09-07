/**
 * Detects the Electron desktop shell.
 *
 * `electron/preload.js` exposes a `window.electron` bridge that no browser ever
 * provides, so its presence is the single reliable signal that the site is
 * running inside the packaged app rather than on the website. Components use
 * it to hide "get the app" affordances from people who already have the app —
 * offering the desktop download inside the desktop app is noise.
 *
 * Safe to call during server rendering: it returns false there, and client
 * components re-check it in an effect after mount.
 */
export function isDesktopApp(): boolean {
  if (typeof window === 'undefined') return false;
  return (window as { electron?: unknown }).electron !== undefined;
}
