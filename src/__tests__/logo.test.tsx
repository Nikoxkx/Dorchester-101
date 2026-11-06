import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Logo } from '@/components/ui/Logo';

describe('sidebar masthead logo', () => {
  it('keeps only the DOR101 wordmark and vertically centers it beside the photo tile', () => {
    const { container } = render(<Logo size="md" animated={false} />);
    const wordmark = container.querySelector('.font-display');
    const textLockup = wordmark?.parentElement;

    expect(wordmark?.textContent).toBe('DOR101');
    expect(container.textContent).toBe('DOR101');
    expect(textLockup?.style.minHeight).toBe('44px');
    expect(textLockup?.className).toContain('justify-center');
  });
});
