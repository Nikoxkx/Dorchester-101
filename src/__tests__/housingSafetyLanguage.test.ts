import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { RESOURCES } from '@/data/resources';
import { SPANISH_FAQ_ANSWERS } from '@/app/faq/answers.es';
import { OTHER_FAQ_ANSWERS } from '@/app/faq/answers.multilingual';
import { FAQ_JSONLD } from '@/app/faq/faqData';
import { dictionaries } from '@/i18n';
import { LANGUAGES } from '@/i18n/config';
import { resourceDetails } from '@/i18n/resourceDetails';
import { pick } from '@/i18n/runtime';
import type { Language } from '@/stores/appStore';

const priority: Record<Language, string> = {
  en: 'generally require Priority One',
  es: 'generalmente exigen Prioridad Uno',
  ht: 'jeneralman mande Priyorite Youn',
  pt: 'geralmente exigem Prioridade Um',
  vi: 'thường yêu cầu Priority One',
  zh: '通常要求 Priority One',
  ar: 'عادةً الأولوية الأولى',
  so: 'badanaa waxay u baahan yihiin Mudnaanta Koowaad',
  kea: 'jeralmenti ta pidi Prioridadi Un',
};
const exceptions: Record<Language, string> = {
  en: 'limited exceptions', es: 'excepciones limitadas', ht: 'kèk eksepsyon',
  pt: 'exceções limitadas', vi: 'ngoại lệ hạn chế', zh: '少数例外',
  ar: 'استثناءات محدودة', so: 'ka-reebitaanno kooban', kea: 'isesons limitadu',
};
const excluded: Record<Language, string> = {
  en: 'does not list public or subsidized housing', es: 'No incluye vivienda pública ni subsidiada',
  ht: 'pa bay lojman piblik oswa sibvansyone', pt: 'Não inclui moradia pública ou subsidiada',
  vi: 'Không liệt kê nhà công cộng hoặc được trợ cấp', zh: '不包括公共住房或补贴住房',
  ar: 'لا يشمل السكن العام أو المدعوم', so: 'Kuma jiraan guryaha dadweynaha ama la kabay',
  kea: 'Ka ta inklui kaza públiku ô subsidiadu',
};

describe('housing-source translations and safety', () => {
  it('keeps key limits and exceptions in both FAQ answers and every language', () => {
    const enApply = FAQ_JSONLD.find((row) => row.question === dictionaries.en['faq.q.applyHousing'])!.answer;
    const enSection = FAQ_JSONLD.find((row) => row.question === dictionaries.en['faq.q.section8'])!.answer;
    for (const { code } of LANGUAGES) {
      const answers = code === 'en'
        ? { applyHousing: enApply, section8: enSection }
        : code === 'es' ? SPANISH_FAQ_ANSWERS : OTHER_FAQ_ANSWERS[code]!;
      expect(answers.applyHousing, code).toContain(excluded[code]);
      expect(answers.section8, code).toContain(priority[code]);
      expect(answers.section8, code).toContain(exceptions[code]);
      for (const term of ['bostonhousing.org', '(617) 988-4000']) {
        expect(answers.applyHousing, code).toContain(term);
        expect(answers.section8, code).toContain(term);
      }
      for (const term of ['CHAMP', 'MRVP', 'AHVP', 'housingapplication.mass.gov']) {
        expect(answers.section8, code).toContain(term);
      }
      // MassAccess still serves set-aside referrals; do not claim it retired.
      expect(answers.applyHousing, code).not.toContain('MassAccess');
      expect(dictionaries[code]['housing.cover.metrolist'], code).toContain(excluded[code]);
      expect(dictionaries[code]['housing.cover.navigator'], code).not.toContain('MassAccess');
    }
  });

  it('ties both housing-source drafts to their English fields', () => {
    const records = ['housing-navigator-ma', 'metrolist-boston'].map((id) => {
      const r = RESOURCES.find((row) => row.id === id)!;
      return [id, r.summary.en, r.address, r.operator, r.verification.source, r.neighborhood, r.hoursNote, r.eligibility, r.services];
    });
    expect(createHash('sha256').update(JSON.stringify(records)).digest('hex'))
      .toBe('25c49eade7b8f6d7f42f8ce819578b5d6dd9613ec222f11c63e7dd589b24aed1');
    for (const id of ['housing-navigator-ma', 'metrolist-boston']) {
      const record = RESOURCES.find((row) => row.id === id)!;
      for (const { code } of LANGUAGES) {
        expect(pick(record.summary, code).used, `${id}: ${code} summary`).toBe(code);
        const detail = resourceDetails(record, code);
        for (const field of ['neighborhood', 'operator', 'eligibility', 'services'] as const) {
          expect(detail[field].used, `${id}: ${code}: ${field}`).toBe(code);
          expect(detail[field].fellBack, `${id}: ${code}: ${field}`).toBe(false);
        }
        expect(detail.services.value).toHaveLength(record.services.length);
        if (id === 'housing-navigator-ma') expect(detail.address.used, code).toBe(code);
        if (id === 'metrolist-boston') expect(detail.hoursNote.used, code).toBe(code);
      }
    }
    const navigator = RESOURCES.find((row) => row.id === 'housing-navigator-ma')!;
    expect(navigator.mapDestination).toBe(false);
    expect(navigator.phone).toBeUndefined();
    expect(navigator.verification.status).toBe('verified');
  });

  it('retains the difference between limits and individual eligibility', () => {
    expect(dictionaries.en['primer.capBody']).toContain('Some rents depend on income');
    expect(dictionaries.en['primer.bandBody']).toContain('depend on the program');
    expect(dictionaries.en['housing.limitsSource']).toContain('estimates');
    expect(dictionaries.en['primer.step2.body']).toContain('may request');
    expect(dictionaries.en['primer.step5.tip']).toContain('any available review or appeal');
    expect(dictionaries.en['primer.step6.body']).toContain('rules vary');
  });
});
