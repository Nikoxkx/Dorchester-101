import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { Logo } from '@/components/ui/Logo';
import { useAppStore } from '@/stores/appStore';

beforeEach(() => useAppStore.getState().resetAll());

describe('sidebar masthead logo', () => {
  it('includes DOR101 inside the same responsive SVG image as the photo tile', () => {
    const { container } = render(<Logo size="md" animated={false} />);
    const lockup = container.querySelector('svg[role="img"]');
    const wordmark = lockup?.querySelector('text');

    expect(lockup?.getAttribute('aria-label')).toBe('DOR101');
    expect(wordmark?.textContent).toBe('DOR101');
    expect(wordmark?.querySelector('tspan')?.textContent).toBe('101');
    expect(container.textContent).toBe('DOR101');
    expect(container.querySelector('img')).toBeNull();
  });

  it('uses the selected classic photo inside the combined lockup', () => {
    useAppStore.getState().setBrandStyle('classic');
    const { container } = render(<Logo size="md" animated={false} />);

    expect(container.querySelector('svg[role="img"] image')?.getAttribute('href')).toBe('/logo-classic.png');
  });

  it('keeps the compact sidebar variant photo-only', () => {
    const { container } = render(<Logo size="sm" showText={false} animated={false} />);

    expect(container.querySelector('svg[role="img"]')).toBeNull();
    expect(container.querySelector('img')).not.toBeNull();
    expect(container.textContent).toBe('');
  });
});
