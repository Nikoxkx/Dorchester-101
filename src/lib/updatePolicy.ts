/**
 * When a downloaded update may apply itself — the whole contract in one
 * pure function so it can be tested without a browser.
 *
 * A PWA never needs reinstalling: the service worker swaps the app shell
 * in place. The only question is *when* a waiting worker may activate:
 *
 * - **Visible** → `prompt`. Activating (and especially reloading) under a
 *   reader's feet can wipe a half-filled form; the "Reload" tap is theirs.
 * - **Hidden** → `apply-silently`. Nobody is looking, so the worker
 *   activates in place: no reload happens, the next open or navigation is
 *   simply the new version. This is what makes updates truly zero-touch —
 *   an installed app that is only ever backgrounded (never swiped closed)
 *   still ends up current, instead of a dismissed prompt stranding it.
 * - **Nothing waiting** → `none`.
 */
export type UpdateAction = 'none' | 'prompt' | 'apply-silently';

export function updateAction(input: { waiting: boolean; visible: boolean }): UpdateAction {
  if (!input.waiting) return 'none';
  return input.visible ? 'prompt' : 'apply-silently';
}
