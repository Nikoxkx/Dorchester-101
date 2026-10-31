import { describe, expect, it } from 'vitest';
import config from '../../next.config';

describe('weather fallback security policy', () => {
  it('permits the public NWS API without allowing arbitrary connect origins', async () => {
    const groups = await config.headers!();
    const policy = groups.find((group) => group.source === '/((?!embed).*)')?.headers
      .find((header) => header.key === 'Content-Security-Policy')?.value;
    expect(policy).toBeTruthy();
    const connect = policy!.split(';').find((part) => part.trim().startsWith('connect-src'))!;
    expect(connect).toContain('https://api.weather.gov');
    expect(connect).not.toMatch(/(?:^|\s)\*(?:\s|$)/);
    expect(connect).not.toContain('http://');
  });
});
