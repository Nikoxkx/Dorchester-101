/**
 * DOR101 — Design Format System (rebuilt from ground up)
 * Defines every spacing, typography, grid, and visual rhythm token.
 * Nothing here is generic; every value was chosen for editorial print feel.
 */

export const FORMAT = {
  // Typography scale — editorial, not UI-default
  type: {
    display: { size: 'clamp(3rem, 6vw, 7rem)', leading: '0.9', weight: 600, tracking: '-0.06em' },
    headline: { size: 'clamp(2rem, 3.5vw, 3.5rem)', leading: '1.05', weight: 600, tracking: '-0.04em' },
    subhead: { size: '1.25rem', leading: '1.25', weight: 700, tracking: '-0.02em' },
    body: { size: '1rem', leading: '1.55', weight: 400, tracking: '0' },
    caption: { size: '0.7rem', leading: '1.35', weight: 700, tracking: '0.1em', case: 'uppercase' as const },
    mono: { size: '0.8rem', leading: '1.4', weight: 500, tracking: '-0.01em' },
    huge: { size: 'clamp(4rem, 10vw, 10rem)', leading: '0.85', weight: 600, tracking: '-0.07em' },
  },
  // Spacing scale — based on 4px base, but with editorial irregularity
  space: {
    micro: '0.25rem',
    small: '0.5rem',
    medium: '1rem',
    large: '2rem',
    xl: '3rem',
    xxl: '5rem',
    massive: '8rem',
  },
  // Grid ratios — broken grid, asymmetrical
  grid: {
    main: '1.35fr 0.65fr',
    split: '1.1fr 0.9fr',
    feature: '1.6fr 0.4fr',
    narrow: '0.4fr 1.6fr',
  },
  // Border / line weights — sharp, not soft
  border: {
    hair: '0.5px',
    thin: '1px',
    medium: '2px',
    heavy: '3px',
    bold: '4px',
  },
  // Radius — minimal, not pill-shaped
  radius: {
    sharp: '0px',
    small: '2px',
    card: '3px',
    panel: '4px',
  },
  // Shadow — subtle, not bubbly
  shadow: {
    soft: '0 4px 20px rgba(26,24,20,0.08)',
    deep: '0 12px 40px rgba(26,24,20,0.15)',
    inset: 'inset 0 0 0 1px rgba(26,24,20,0.08)',
  },
  // Color functions — applied to any element
  colorMap: {
    paper: '#f0ebe3',
    wax: '#e7e0d4',
    parchment: '#ddd5c7',
    charcoal: '#1a1814',
    ink: '#2a2722',
    rust: '#a23b28',
    indigo: '#2d3e50',
    ochre: '#c4a35a',
    sage: '#5e6e5a',
    line: '#cfc6ba',
  },
};

// Utility to apply format to any component via CSS-in-JS / Tailwind arbitrary
export function fmtClass(type: keyof typeof FORMAT.type, extra = ''): string {
  const t = FORMAT.type[type];
  return `font-display text-[${t.size}] leading-[${t.leading}] tracking-[${t.tracking}] weight-[${t.weight}] ${extra}`;
}
