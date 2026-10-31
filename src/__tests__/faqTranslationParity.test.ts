import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { FAQ_SOURCE_DIGEST } from '@/app/faq/answers.source';
import { FOOD_FAQ_ANSWERS } from '@/app/faq/answers.food';
import { SNAP_FAQ_ANSWERS } from '@/app/faq/answers.snap';
import { EVICTION_FAQ_ANSWERS } from '@/app/faq/answers.eviction';
import { WIC_FAQ_ANSWERS } from '@/app/faq/answers.wic';
import { RIGHTS_FAQ_ANSWERS } from '@/app/faq/answers.rights';
import { AMI_FAQ_ANSWERS } from '@/app/faq/answers.ami';
import { MASSHEALTH_FAQ_ANSWERS } from '@/app/faq/answers.masshealth';
import { TRAINING_FAQ_ANSWERS } from '@/app/faq/answers.training';
import { UNEMPLOYMENT_FAQ_ANSWERS } from '@/app/faq/answers.unemployment';
import { UTILITIES_FAQ_ANSWERS } from '@/app/faq/answers.utilities';
import { SPANISH_FAQ_ANSWERS } from '@/app/faq/answers.es';
import { FAQ_JSONLD } from '@/app/faq/faqData';
import { dictionaries } from '@/i18n';
import { LANGUAGES } from '@/i18n/config';

describe('FAQ translation parity', () => {
  it('flags changed English answers for translation review', () => {
    const file = path.resolve(__dirname, '../app/faq/page.tsx');
    const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const records: Record<string, string> = {};
    function visit(node: ts.Node) {
      if (ts.isObjectLiteralExpression(node)) {
        const prop = (name: string) => node.properties.find((item): item is ts.PropertyAssignment =>
          ts.isPropertyAssignment(item) && item.name.getText(source) === name);
        const key = prop('key');
        const answer = prop('a');
        if (key && answer && ts.isStringLiteral(key.initializer) && ts.isNoSubstitutionTemplateLiteral(answer.initializer)) {
          records[key.initializer.text] = answer.initializer.text;
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
    expect(Object.keys(records)).toHaveLength(12);
    // Search engines must not receive stale eligibility or other answers.
    for (const [key, answer] of Object.entries(records)) {
      const question = dictionaries.en[`faq.q.${key}` as keyof typeof dictionaries.en];
      const structured = FAQ_JSONLD.find((item) => item.question === question);
      expect(structured?.answer, `${key} JSON-LD must match the page`).toBe(answer.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim());
    }
    const digest = createHash('sha256').update(JSON.stringify(records)).digest('hex');
    expect(digest, 'Review all translated answers and update FAQ_SOURCE_DIGEST after English changes').toBe(FAQ_SOURCE_DIGEST);
  });

  it.each([
    ['training', TRAINING_FAQ_ANSWERS, ['18', '29', '14', '24', '(617) 442-2791', '(617) 399-3131', '(617) 635-4202', 'jvs-boston.org', 'yearupunited.org', 'boston.gov/departments/youth-employment-and-opportunity']],
    ['unemployment', UNEMPLOYMENT_FAQ_ANSWERS, ['$6,300', '30', '50%', '2026', '$1,154', '(877) 626-6800', '711', 'mass.gov/unemployment']],
    ['utilities', UTILITIES_FAQ_ANSWERS, ['60%', '65', '15', '30', 'mass.gov/heatinghelp', '(617) 357-6012', '(800) 592-2000', '(800) 322-3223', '2-1-1']],
  ] as const)('retains key %s program facts and contacts in every language', (key, drafts, values) => {
    expect(Object.keys(drafts).sort()).toEqual(LANGUAGES.map(({ code }) => code).filter((code) => code !== 'en' && code !== 'es').sort());
    for (const [language, answer] of Object.entries({ es: SPANISH_FAQ_ANSWERS[key], ...drafts })) {
      for (const value of values) expect(answer, `${language}: ${key} must retain ${value}`).toContain(value);
    }
  });

  it('retains the MassHealth coverage standard and assistance contacts in every draft', () => {
    expect(Object.keys(MASSHEALTH_FAQ_ANSWERS).sort()).toEqual(LANGUAGES.map(({ code }) => code).filter((code) => code !== 'en' && code !== 'es').sort());
    for (const [language, answer] of Object.entries({ es: SPANISH_FAQ_ANSWERS.masshealth, ...MASSHEALTH_FAQ_ANSWERS })) {
      for (const value of ['133%', '21', '64', '65', 'mahealthconnector.org', '(800) 841-2900', '711', '(800) 272-4232', '(617) 822-8162']) {
        expect(answer, `${language} must retain ${value}`).toContain(value);
      }
    }
  });

  it('retains the separate HUD and Boston income examples in each AMI draft', () => {
    expect(Object.keys(AMI_FAQ_ANSWERS).sort()).toEqual(LANGUAGES.map(({ code }) => code).filter((code) => code !== 'en' && code !== 'es').sort());
    for (const [language, answer] of Object.entries({ es: SPANISH_FAQ_ANSWERS.ami, ...AMI_FAQ_ANSWERS })) {
      for (const value of ['2026', '$164,600', '$85,700', '$137,100', '$171,400', '50%', '80%', '100%']) {
        expect(answer, `${language} must retain ${value}`).toContain(value);
      }
    }
  });

  it('retains heat thresholds and the corrected heating-season dates in every rights draft', () => {
    expect(Object.keys(RIGHTS_FAQ_ANSWERS).sort()).toEqual(LANGUAGES.map(({ code }) => code).filter((code) => code !== 'en' && code !== 'es').sort());
    for (const [language, answer] of Object.entries({ es: SPANISH_FAQ_ANSWERS.rights, ...RIGHTS_FAQ_ANSWERS })) {
      for (const value of ['15', '31', '68', '64', '110', '30']) {
        expect(answer, `${language} must retain ${value}`).toContain(value);
      }
    }
  });

  it('retains WIC eligibility dates and direct contact numbers in every draft', () => {
    expect(Object.keys(WIC_FAQ_ANSWERS).sort()).toEqual(LANGUAGES.map(({ code }) => code).filter((code) => code !== 'en' && code !== 'es').sort());
    for (const [language, answer] of Object.entries({ es: SPANISH_FAQ_ANSWERS.wic, ...WIC_FAQ_ANSWERS })) {
      for (const value of ['2026', '2027', '$61,050', 'mass.gov/wic', '(800) 942-1007', '(617) 825-3822', '(617) 825-0805']) {
        expect(answer, `${language} must retain ${value}`).toContain(value);
      }
    }
  });

  it('retains eviction aid contacts, criteria and deadlines in every draft', () => {
    expect(Object.keys(EVICTION_FAQ_ANSWERS).sort()).toEqual(LANGUAGES.map(({ code }) => code).filter((code) => code !== 'en' && code !== 'es').sort());
    for (const [language, answer] of Object.entries({ es: SPANISH_FAQ_ANSWERS.eviction, ...EVICTION_FAQ_ANSWERS })) {
      for (const value of ['$7,000', '12', '50%', '60%', '21', '(617) 425-6700', '2-1-1', '(617) 603-1807', '(617) 371-1234', '(617) 524-3541', '(617) 635-4200']) {
        expect(answer, `${language} must retain ${value}`).toContain(value);
      }
    }
  });

  it('retains SNAP contacts, amounts, dates and timeframes in every draft', () => {
    expect(Object.keys(SNAP_FAQ_ANSWERS).sort()).toEqual(LANGUAGES.map(({ code }) => code).filter((code) => code !== 'en' && code !== 'es').sort());
    for (const [language, answer] of Object.entries({ es: SPANISH_FAQ_ANSWERS.snap, ...SNAP_FAQ_ANSWERS })) {
      for (const value of ['DTAConnect.com', '(877) 382-2363', '200%', '2026', '2027', '$5,500', '60', '$306', '$562', '$808', '$1,023', '$1,217', '30', '7']) {
        expect(answer, `${language} must retain ${value}`).toContain(value);
      }
    }
  });

  it('retains key food contacts and amounts in every new translation', () => {
    expect(Object.keys(FOOD_FAQ_ANSWERS).sort()).toEqual(LANGUAGES.map(({ code }) => code).filter((code) => code !== 'en' && code !== 'es').sort());
    for (const [language, answer] of Object.entries(FOOD_FAQ_ANSWERS)) {
      for (const value of ['450 Washington St', '650 Dudley St', '150 American Legion Hwy', '617) 825-9660', '617) 318-6940', '617) 318-6900', '617) 533-8133', '1-800-645-8333', '$2', '180', 'gbfb.org/need-food']) {
        expect(answer, `${language} must retain ${value}`).toContain(value);
      }
    }
  });
});
