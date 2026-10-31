import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { NEIGHBORHOOD_NAMES, NEIGHBORHOOD_SOURCE_DIGEST, neighborhoodCopy } from '@/app/neighborhood/neighborhoodTranslations';
import { LANGUAGES } from '@/i18n/config';
import type { Language } from '@/stores/appStore';

describe('neighborhood translation parity', () => {
  it('flags changed English summaries and photo captions for review', () => {
    const file = path.resolve(__dirname, '../app/neighborhood/page.tsx');
    const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const records: string[][] = [];
    const prop = (node: ts.ObjectLiteralExpression, name: string) => node.properties.find(
      (item): item is ts.PropertyAssignment => ts.isPropertyAssignment(item) && item.name.getText(source) === name,
    );
    function visit(node: ts.Node) {
      if (ts.isObjectLiteralExpression(node)) {
        const name = prop(node, 'name');
        const description = prop(node, 'description');
        const photo = prop(node, 'photo');
        if (name && description && photo && ts.isStringLiteral(name.initializer)
          && ts.isStringLiteral(description.initializer) && ts.isObjectLiteralExpression(photo.initializer)) {
          const caption = prop(photo.initializer, 'caption');
          if (caption && ts.isStringLiteral(caption.initializer)) records.push([name.initializer.text, description.initializer.text, caption.initializer.text]);
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
    expect(records.map(([name]) => name)).toEqual([...NEIGHBORHOOD_NAMES]);
    const digest = createHash('sha256').update(JSON.stringify(records)).digest('hex');
    expect(digest, 'Review translated summaries and photo captions before updating the digest').toBe(NEIGHBORHOOD_SOURCE_DIGEST);
  });

  it('provides a summary and photo caption for every neighborhood in each locale', () => {
    for (const language of LANGUAGES.filter(({ code }) => code !== 'en')) {
      for (const name of NEIGHBORHOOD_NAMES) {
        const copy = neighborhoodCopy(name, language.code as Language);
        expect(copy?.summary.length, `${language.code}: ${name} summary`).toBeGreaterThan(10);
        expect(copy?.caption.length, `${language.code}: ${name} caption`).toBeGreaterThan(10);
      }
      // These captions identify the actual location, not a distant substitute.
      expect(neighborhoodCopy('Codman Square', language.code as Language)?.caption).toContain('Codman Square');
      expect(neighborhoodCopy('Grove Hall', language.code as Language)?.caption).toContain('Grove Hall');
      expect(neighborhoodCopy('Grove Hall', language.code as Language)?.caption).toContain('2021');
    }
    expect(neighborhoodCopy('Unknown neighborhood', 'es')).toBeUndefined();
    expect(neighborhoodCopy('Fields Corner', 'en')).toBeUndefined();
    expect(neighborhoodCopy('Fields Corner', 'unsupported' as Language)).toBeUndefined();
  });
});
