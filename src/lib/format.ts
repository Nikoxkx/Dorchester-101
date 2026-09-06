/**
 * DOR101 — Design format system
 * Spacing, type, radius, and color tokens for the "community
 * greenline" identity. Kept in sync with src/app/globals.css.
 */

export const FORMAT = {
  type: {
    display: { size: 'clamp(2.75rem, 6vw, 5.5rem)', leading: '0.98', weight: 900, tracking: '-0.025em' },
    headline: { size: 'clamp(1.75rem, 3vw, 2.75rem)', leading: '1.05', weight: 800, tracking: '-0.02em' },
    subhead: { size: '1.2rem', leading: '1.25', weight: 700, tracking: '-0.01em' },
    body: { size: '1rem', leading: '1.6', weight: 400, tracking: '0' },
    caption: { size: '0.72rem', leading: '1.35', weight: 700, tracking: '0.14em', case: 'uppercase' as const },
    mono: { size: '0.8rem', leading: '1.4', weight: 500, tracking: '-0.01em' },
    huge: { size: 'clamp(3.5rem, 9vw, 7rem)', leading: '0.92', weight: 900, tracking: '-0.03em' },
  },
  space: {
    micro: '0.25rem',
    small: '0.5rem',
    medium: '1rem',
    large: '1.5rem',
    xl: '2.5rem',
    xxl: '4rem',
    massive: '6rem',
  },
  grid: {
    main: '1.25fr 0.75fr',
    split: '1fr 1fr',
    feature: '1.5fr 0.5fr',
    narrow: '0.35fr 1.65fr',
  },
  border: {
    hair: '0.5px',
    thin: '1px',
    medium: '2px',
    heavy: '3px',
    bold: '4px',
  },
  radius: {
    sharp: '0px',
    small: '6px',
    card: '10px',
    panel: '14px',
    pill: '999px',
  },
  shadow: {
    soft: '0 4px 18px rgba(21,36,29,0.10)',
    deep: '0 14px 40px rgba(21,36,29,0.16)',
    inset: 'inset 0 0 0 1px rgba(21,36,29,0.08)',
  },
  colorMap: {
    paper: '#f6f7f4',
    wax: '#edf0eb',
    parchment: '#dfe4dc',
    charcoal: '#15241d',
    ink: '#23332a',
    red: '#d7261e',
    harbor: '#1e6fa5',
    leaf: '#217a4c',
    amber: '#b7791f',
    line: '#cfd7d0',
  },
};

// Utility to apply format to any component via Tailwind arbitrary values
export function fmtClass(type: keyof typeof FORMAT.type, extra = ''): string {
  const t = FORMAT.type[type];
  return `font-display text-[${t.size}] leading-[${t.leading}] tracking-[${t.tracking}] ${extra}`;
}
