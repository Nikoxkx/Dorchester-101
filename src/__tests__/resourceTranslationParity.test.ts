import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { RESOURCES } from '@/data/resources';
import { LANGUAGES } from '@/i18n/config';
import { pick } from '@/i18n/runtime';

/** These eight summaries are AI-assisted drafts. Re-review every locale when the
 * English source changes; this digest cannot judge translation quality. */
const REVIEW_IDS = ['bha', 'gbfb-dorchester', 'bostons-food-district', 'raft-mass', 'fair-foods-lena-park', 'codman-square-community-market', 'gbLS-dorchester', 'city-life-vida-urbana'];
const SOURCE_DIGEST = 'e212c191feb264ff3737aa74733dcd509482c6c4c7a9edfda0adb9cf224345c8';

describe('priority resource summary translations', () => {
  it('flags English changes for review', () => {
    const source = REVIEW_IDS.map((id) => {
      const record = RESOURCES.find((item) => item.id === id);
      expect(record, id).toBeTruthy();
      return [id, record!.summary.en];
    });
    const digest = createHash('sha256').update(JSON.stringify(source)).digest('hex');
    expect(digest, 'Review translated resource summaries before updating SOURCE_DIGEST').toBe(SOURCE_DIGEST);
  });

  it('does not route people to unverified housing clinics or a combined phone number', () => {
    const raft = RESOURCES.find((record) => record.id === 'raft-mass')!;
    const legal = RESOURCES.find((record) => record.id === 'gbLS-dorchester')!;
    const cityLife = RESOURCES.find((record) => record.id === 'city-life-vida-urbana')!;
    expect(raft.phone).toBe('(617) 425-6700');
    expect(raft.address).toBe('1411 Tremont Street, Boston, MA 02120');
    expect(raft.lat).toBeCloseTo(42.331733);
    expect(raft.lng).toBeCloseTo(-71.096389);
    expect(legal.website).toBe('https://www.gbls.org/about-us/locations-and-directions');
    expect(legal.languages).toEqual(['English', 'Spanish', 'Haitian Creole', 'Portuguese', 'Mandarin', 'Cantonese']);
    expect(legal.hoursNote).toContain('(617) 603-1807');
    expect(legal.hoursNote).not.toContain('Dorchester Courthouse');
    expect(cityLife.hoursNote).toContain('6:30 PM');
    expect(cityLife.services).toContain('Tenant meetings (confirm schedule)');
    expect(cityLife.services).not.toContain('Weekly tenant clinic');
    expect(cityLife.hours).toBeUndefined();
  });

  it('uses each selected locale and retains the important amounts', () => {
    for (const id of REVIEW_IDS) {
      const record = RESOURCES.find((item) => item.id === id)!;
      for (const { code } of LANGUAGES) {
        const summary = pick(record.summary, code);
        expect(summary.used, `${id}: ${code}`).toBe(code);
        expect(summary.fellBack, `${id}: ${code}`).toBe(false);
        expect(summary.value.length, `${id}: ${code}`).toBeGreaterThan(30);
        if (id === 'raft-mass') {
          expect(summary.value.replace(/\D/g, ''), code).toContain('7000');
          expect(summary.value, code).toContain('12');
          expect(summary.value, code).toContain('2-1-1');
        }
        if (id === 'gbLS-dorchester') {
          expect(summary.value, code).toContain('(617) 603-1807');
          expect(summary.value, code).toContain('(617) 371-1234');
        }
        if (id === 'city-life-vida-urbana') expect(summary.value, code).toContain('(617) 524-3541');
        if (id === 'fair-foods-lena-park') {
          expect(summary.value, code).toContain('$2');
          expect(summary.value, code).toContain('(617) 533-8133');
        }
      }
    }
  });
});
