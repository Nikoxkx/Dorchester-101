/**
 * Nothing ships without a name attached.
 *
 * The complaint this guards against is a credit that reads "provenance and
 * licence must be confirmed before republication" — a placeholder that appeared
 * under two photographs on the About page because the files came with no EXIF,
 * no upload record and no licence. Those two files are gone; the checks below
 * are what stops their replacements, or any future photograph, from drifting
 * back into the same state. The rule is simple and it is enforced here:
 *
 *   every image the app loads has a credit entry naming a licence and a
 *   Wikimedia Commons page, and no entry is allowed to be a placeholder.
 */
import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const CREDITS_PATH = path.join(ROOT, 'public', 'IMAGE-CREDITS.md');

/** `## \`img/foo.jpg\`` → the body that follows it, up to the next heading. */
function creditSections(): Array<{ file: string; body: string }> {
  const raw = fs.readFileSync(CREDITS_PATH, 'utf8');
  const sections: Array<{ file: string; body: string }> = [];
  let current: { file: string; body: string } | null = null;
  for (const line of raw.split(/\r?\n/)) {
    const heading = /^##\s+`?([^`]+)`?/.exec(line);
    if (heading) {
      if (current) sections.push(current);
      current = { file: heading[1].trim(), body: '' };
      continue;
    }
    if (current) current.body += `${line}\n`;
  }
  if (current) sections.push(current);
  return sections;
}

/** Every `.jpg`/`.png` under public/img, as the site-relative path. */
function shippedImages(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(jpe?g|png)$/i.test(entry.name)) out.push(path.relative(path.join(ROOT, 'public'), full));
    }
  };
  walk(path.join(ROOT, 'public', 'img'));
  return out.sort();
}

/** Every `/img/…` the source asks the browser to load. */
function referencedImages(): string[] {
  const out = new Set<string>();
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (/\.tsx?$/.test(entry.name)) {
        const text = fs.readFileSync(full, 'utf8');
        for (const match of text.matchAll(/['"`](\/img\/[^'"`]+\.(?:jpe?g|png))['"`]/g)) out.add(match[1]);
      }
    }
  };
  walk(path.join(ROOT, 'src'));
  for (const file of ['public/offline.html', 'public/sw.js']) {
    const full = path.join(ROOT, file);
    if (fs.existsSync(full)) {
      for (const match of fs.readFileSync(full, 'utf8').matchAll(/['"`](\/img\/[^'"`]+\.(?:jpe?g|png))['"`]/g)) {
        out.add(match[1]);
      }
    }
  }
  return [...out].sort();
}

describe('image credits', () => {
  it('credits every photograph the repository ships, with a licence and a Commons page', () => {
    const sections = creditSections();
    for (const image of shippedImages()) {
      const section = sections.find((entry) => entry.file === image);
      expect(section, `no credit entry for ${image}`).toBeTruthy();
      expect(section!.body, `${image} has no licence`).toMatch(/\*\*Licence:\*\*/);
      expect(section!.body, `${image} has no Commons page to check it against`).toMatch(/\*\*Commons page:\*\* https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      expect(section!.body, `${image} names no author`).toMatch(/\*\*Author:\*\*/);
    }
  });

  it('leaves no placeholder where a provenance should be', () => {
    const raw = fs.readFileSync(CREDITS_PATH, 'utf8');
    expect(raw).not.toMatch(/\*\*Status:\*\*/);
    expect(raw.toLowerCase()).not.toContain('must be confirmed');
    for (const section of creditSections()) {
      expect(section.body.toLowerCase(), `${section.file} still carries a placeholder`).not.toContain('unconfirmed');
      expect(section.body.toLowerCase(), `${section.file} still carries a placeholder`).not.toContain('must be confirmed');
    }
  });

  it('never points the app at an image that is not credited', () => {
    const sections = creditSections();
    for (const src of referencedImages()) {
      const file = src.replace(/^\//, '');
      expect(fs.existsSync(path.join(ROOT, 'public', file)), `${src} does not exist`).toBe(true);
      expect(sections.some((entry) => entry.file === file), `${src} is shown with no credit`).toBe(true);
    }
  });

  it('is reachable from the repository docs the way the About page promises', () => {
    const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
    expect(fs.existsSync(path.join(ROOT, 'docs', 'AI-USAGE.md'))).toBe(true);
    expect(readme).toContain('docs/AI-USAGE.md');
  });
});
