import { describe, expect, it } from 'vitest';
import { updateAction } from '@/lib/updatePolicy';

/**
 * The zero-touch update contract: updates may install themselves, but
 * never reload a page somebody is using.
 */
describe('updateAction', () => {
  it('does nothing when no update is waiting', () => {
    expect(updateAction({ waiting: false, visible: true })).toBe('none');
    expect(updateAction({ waiting: false, visible: false })).toBe('none');
  });

  it('asks first while the resident is looking at the page', () => {
    expect(updateAction({ waiting: true, visible: true })).toBe('prompt');
  });

  it('applies silently once the app is backgrounded', () => {
    expect(updateAction({ waiting: true, visible: false })).toBe('apply-silently');
  });
});
