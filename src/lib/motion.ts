import type { Transition } from 'framer-motion';

/**
 * Motion tokens — spring physics everywhere, per the design system.
 * Controls snap quickly; large surfaces move with more weight.
 * Every decorative use must be gated behind useReducedMotion().
 */

/** Buttons, pills, toggles, menu items, small state changes. */
export const springControl: Transition = { type: 'spring', stiffness: 300, damping: 30 };

/** Sheets, modals, drawers, large surfaces. */
export const springSheet: Transition = { type: 'spring', stiffness: 220, damping: 26 };

/** Nav bar expand/collapse on scroll. */
export const springNav: Transition = { type: 'spring', stiffness: 260, damping: 28 };

/** Standard durations for plain CSS transitions (kept in one place). */
export const DURATION = {
  control: 0.22,
  sheet: 0.38,
} as const;
