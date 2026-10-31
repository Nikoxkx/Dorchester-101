/**
 * Guard against English copy creeping back into components.
 *
 * The dictionary test (`i18n.test.ts`) proves every locale carries every key.
 * It cannot see the opposite failure: a component that never asks for a key and
 * prints a literal instead. That is how the site ended up half translated in
 * the first place, so this test parses every `.tsx` under `src/app` and
 * `src/components` and looks for user-visible literals that never reach `t()`:
 *
 *   - JSX text nodes with real words in them (`<h2>How to apply</h2>`)
 *   - the attributes a screen reader or a browser surfaces as words
 *     (`aria-label`, `title`, `placeholder`, `alt`, `label`, `note`, …)
 *   - embedded FAQ and project data (but not arbitrary data modules)
 *
 * Strings that are legitimately not language: map attribution required by the
 * tile licence, `rel="noopener noreferrer"`, physical key names ("Escape"),
 * brand marks, and data that arrives from the API in English (weather text).
 *
 * `PENDING` is the honest remainder: files that still carry English prose and
 * are tracked for translation. A file leaves the list when it is converted, and
 * nothing new may join it. Keep that ratchet tight.
 */
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const SRC = path.resolve(__dirname, '..');

/** Files still carrying English copy. Shrink this list; never grow it. */
const PENDING = new Set([
  'app/faq/page.tsx',
  'app/neighborhood/page.tsx',
]);

/** Attributes whose value a person reads or hears. */
const VISIBLE_ATTRS = new Set([
  'aria-label',
  'aria-description',
  'aria-placeholder',
  'aria-valuetext',
  'aria-roledescription',
  'title',
  'placeholder',
  'alt',
  'label',
  'note',
  'description',
  'preview',
  'badge',
  'caption',
]);

/** Values that are markup, code, or a proper noun rather than copy. */
const ALLOWED_VALUE =
  /^(?:|https?:\/\/\S+|[a-z0-9-]+|rel noopener noreferrer|noopener noreferrer|Escape|Enter|Tab|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Home|End|Space|MBTA|DOR|DOR101|DORCHESTER|Commons|Wikimedia Commons|CC BY-SA|Census · ACS · B25064|AbortError|TTY|RTL|inHg|Dorchester, Boston|Dorchester 101|IMAGE-CREDITS\.md|: Sswonk · CC BY-SA 3\.0)$/;

function files(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'api') continue;
      out.push(...files(full));
    } else if (entry.name.endsWith('.tsx')) {
      out.push(full);
    }
  }
  return out;
}

/** Two or more letters, at least one capitalised or spaced word: real copy. */
function looksLikeCopy(value: string): boolean {
  const text = value.replace(/\s+/g, ' ').trim();
  if (text.length < 3) return false;
  if (ALLOWED_VALUE.test(text)) return false;
  if (!/[A-Za-z]{2}/.test(text)) return false;
  // A CSS-ish token: `text-sm`, `bg-[var(--color-bg)]`, `grid-cols-2`.
  if (!/\s/.test(text) && /^[a-z0-9:.[\]()%,/-]+$/.test(text)) return false;
  return true;
}

function literalsIn(file: string): Array<{ line: number; text: string; kind: string }> {
  const source = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const found: Array<{ line: number; text: string; kind: string }> = [];

  const insideTranslator = (node: ts.Node): boolean => {
    for (let p = node.parent; p; p = p.parent) {
      if (ts.isCallExpression(p) && /(^|\.)t$/.test(p.expression.getText(sf))) return true;
    }
    return false;
  };

  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node)) {
      const text = node.getText(sf).replace(/\s+/g, ' ').trim();
      if (looksLikeCopy(text) && !/^[Aa]a$/.test(text) && !/^&nbsp;/.test(text)) {
        found.push({
          line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1,
          text,
          kind: 'jsx text',
        });
      }
    } else if (
      file.endsWith(`${path.sep}app${path.sep}faq${path.sep}page.tsx`) &&
      ts.isPropertyAssignment(node) &&
      ['q', 'a'].includes(node.name.getText(sf)) &&
      (ts.isStringLiteral(node.initializer) || ts.isNoSubstitutionTemplateLiteral(node.initializer)) &&
      looksLikeCopy(node.initializer.text)
    ) {
      // FAQ answers currently live in component data rather than JSX. Keep
      // this page in PENDING until those answers are localized too.
      found.push({
        line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1,
        text: node.initializer.text,
        kind: 'FAQ data',
      });
    } else if (
      file.endsWith(`${path.sep}app${path.sep}projects${path.sep}page.tsx`) &&
      ts.isPropertyAssignment(node) &&
      ['description', 'parcelNote', 'unitMix', 'communityBenefits', 'howToApply'].includes(node.name.getText(sf)) &&
      ts.isStringLiteral(node.initializer) && looksLikeCopy(node.initializer.text)
    ) {
      // The original project descriptions still serve locales without translations.
      found.push({
        line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1,
        text: node.initializer.text,
        kind: 'project data',
      });
    } else if (ts.isJsxAttribute(node)) {
      const name = node.name.getText(sf);
      const init = node.initializer;
      if (VISIBLE_ATTRS.has(name) && init) {
        let text = '';
        if (ts.isStringLiteral(init)) text = init.text;
        if (ts.isJsxExpression(init) && init.expression) {
          if (ts.isStringLiteral(init.expression)) text = init.expression.text;
          if (ts.isTemplateExpression(init.expression)) {
            text = [init.expression.head.text, ...init.expression.templateSpans.map((span) => span.literal.text)].join(' ');
          }
        }
        if (looksLikeCopy(text)) {
          found.push({
            line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1,
            text,
            kind: name,
          });
        }
      }
    } else if (
      ts.isStringLiteral(node) &&
      !insideTranslator(node) &&
      ts.isConditionalExpression(node.parent) &&
      looksLikeCopy(node.text) &&
      // Prose starts with a capital and has no class-list punctuation.
      /^[A-Z]/.test(node.text) &&
      !/[\[\]():-]/.test(node.text)
    ) {
      // `condition ? 'Open now' : 'Closed'` is still copy.
      found.push({
        line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1,
        text: node.text,
        kind: 'ternary',
      });
    }
    ts.forEachChild(node, visit);
  };

  visit(sf);
  return found;
}

describe('hardcoded English', () => {
  const targets = [
    ...files(path.join(SRC, 'app')),
    ...files(path.join(SRC, 'components')),
  ].filter((file) => !file.includes(`${path.sep}api${path.sep}`));

  it('leaves no user-visible English literal outside the tracked remainder', () => {
    const offenders: string[] = [];
    for (const file of targets) {
      const rel = path.relative(SRC, file).split(path.sep).join('/');
      if (PENDING.has(rel)) continue;
      for (const hit of literalsIn(file)) {
        offenders.push(`${rel}:${hit.line} [${hit.kind}] ${hit.text.slice(0, 80)}`);
      }
    }
    expect(
      offenders,
      `Translate these, or (only if they are data rather than copy) allow them:\n${offenders.join('\n')}`,
    ).toEqual([]);
  });

  it('keeps the tracked remainder honest, so the list only ever shrinks', () => {
    for (const rel of PENDING) {
      const file = path.join(SRC, rel);
      const stillEnglish = fs.existsSync(file) && literalsIn(file).length > 0;
      expect(stillEnglish, `${rel} no longer has English copy: remove it from PENDING`).toBe(true);
    }
  });
});
