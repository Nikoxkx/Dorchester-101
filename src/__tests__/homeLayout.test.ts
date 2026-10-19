/** Homepage layout defaults: everything visible, shipped order, and the
 *  emergency banner can never be a removable slot. */
import { describe, expect, it } from 'vitest';
import { DEFAULT_HOME_LAYOUT, HOME_SECTION_ORDER } from '@/stores/appStore';

describe('homepage layout defaults', () => {
  it('starts with every section visible in the shipped order', () => {
    expect(DEFAULT_HOME_LAYOUT.order).toEqual(HOME_SECTION_ORDER);
    expect(DEFAULT_HOME_LAYOUT.hidden).toEqual([]);
    expect(DEFAULT_HOME_LAYOUT.cardStyle).toBe('match');
    // The live NowBar strip closes the page (4.5) instead of opening it:
    // the weather up top already carries its temperature.
    expect(HOME_SECTION_ORDER[HOME_SECTION_ORDER.length - 1]).toBe('nowbar');
    // The emergency banner is not furniture: it can never be a slot.
    expect(HOME_SECTION_ORDER).not.toContain('emergency');
  });
});
