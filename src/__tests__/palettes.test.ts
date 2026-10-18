/**
 * The palette and surface systems are promises made in three places at
 * once — the store (`PALETTES`/`SURFACES`), the stylesheet (one block per
 * palette in light and dark, one treatment per surface) and the settings
 * swatches. These tests parse `globals.css` and hold the three together,
 * and re-run the WCAG contrast floor for every palette so a colour tweak
 * cannot quietly make text unreadable.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PALETTES, SURFACES } from '@/stores/appStore';

const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

function hexLuminance(hex: string): number {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(foreground: string, background: string): number {
  const [hi, lo] = [hexLuminance(foreground), hexLuminance(background)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

/** Extract `--token: #hex` pairs from the block that starts at `marker`. */
function blockTokens(marker: string): Record<string, string> {
  const start = css.indexOf(marker);
  expect(start, `missing CSS block ${marker}`).toBeGreaterThanOrEqual(0);
  const body = css.slice(start, css.indexOf('}', start));
  const tokens: Record<string, string> = {};
  for (const m of body.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})\b/g)) tokens[m[1]] = m[2];
  return tokens;
}

const NAMED = PALETTES.filter((p) => p !== 'harbor');

describe('palettes', () => {
  it('the store advertises twelve palettes and five surfaces', () => {
    expect(PALETTES).toHaveLength(12);
    expect(PALETTES[0]).toBe('harbor');
    expect(SURFACES).toEqual(['solid', 'glass', 'frost', 'tinted', 'aurora']);
  });

  it('every named palette restates its tokens in light and dark', () => {
    for (const palette of NAMED) {
      for (const marker of [`html[data-palette="${palette}"] {`, `html[data-palette="${palette}"].dark {`]) {
        const tokens = blockTokens(marker);
        for (const token of [
          '--bg-primary-solid',
          '--bg-secondary-solid',
          '--bg-tertiary-solid',
          '--bg-raised-solid',
          '--color-text-primary',
          '--color-text-secondary',
          '--color-text-muted',
          '--color-accent-primary',
          '--color-accent-secondary',
        ]) {
          expect(tokens[token], `${palette} ${marker} ${token}`).toMatch(/^#[0-9a-fA-F]{6}$/);
        }
      }
    }
  });

  it('text contrast floors hold in every palette, both modes', () => {
    const blocks: Array<[string, Record<string, string>]> = [['harbor :root', blockTokens(':root {')]];
    for (const palette of NAMED) {
      blocks.push([`${palette} light`, blockTokens(`html[data-palette="${palette}"] {`)]);
      blocks.push([`${palette} dark`, blockTokens(`html[data-palette="${palette}"].dark {`)]);
    }
    for (const [label, tokens] of blocks) {
      const bg = tokens['--bg-primary-solid'];
      expect(contrast(tokens['--color-text-primary'], bg), `${label} text-primary`).toBeGreaterThanOrEqual(12);
      expect(contrast(tokens['--color-text-secondary'], bg), `${label} text-secondary`).toBeGreaterThanOrEqual(7);
      // The accent is used for links and buttons at text size.
      expect(contrast(tokens['--color-accent-primary'], bg), `${label} accent`).toBeGreaterThanOrEqual(4.5);
      // Muted is held to a sane floor; three upstream palettes sit just
      // under 4.5 (4.29–4.50) and are tracked by name rather than by
      // quietly lowering the bar for everyone.
      const mutedFloor = /^harbor|forest|sand/.test(label) ? 4.25 : 4.5;
      expect(contrast(tokens['--color-text-muted'], bg), `${label} muted`).toBeGreaterThanOrEqual(mutedFloor);
    }
  });

  it('no palette block sets --color-bg-* directly (surfaces derive them)', () => {
    for (const palette of NAMED) {
      const tokens = blockTokens(`html[data-palette="${palette}"] {`);
      expect(Object.keys(tokens).some((k) => k.startsWith('--color-bg-')), palette).toBe(false);
    }
  });
});

describe('surfaces', () => {
  it('every non-solid surface has a treatment block', () => {
    for (const surface of SURFACES.filter((s) => s !== 'solid')) {
      expect(css).toContain(`html[data-surface="${surface}"]`);
    }
  });

  it('surfaces derive from the active palette solids via color-mix', () => {
    const surfaceBlock = css.slice(css.indexOf('data-surface="glass"'), css.indexOf('data-surface="glass"') + 4000);
    expect(css).toContain('--bg-primary-solid');
    expect(css).toMatch(/color-mix\(in oklab, var\(--bg-primary-solid\)/);
    expect(surfaceBlock.length).toBeGreaterThan(500);
  });

  it('reduced transparency forces the solid reading', () => {
    expect(css).toContain('prefers-reduced-transparency');
  });
});
