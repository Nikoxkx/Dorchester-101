import { describe, expect, it, vi } from 'vitest';
import { fetchPublicFeed, isPublicAddress, type PublicFeedDependencies } from '@/lib/publicFeed';

const dependencies = () => ({
  resolve: vi.fn(async () => [{ address: '8.8.8.8', family: 4 }]),
  request: vi.fn(async () => ({ status: 200, body: '<rss></rss>' })),
});

describe('custom RSS public network guard', () => {
  it.each(['127.0.0.1', '10.1.2.3', '100.64.0.1', '169.254.169.254', '172.16.0.1', '192.168.1.1', '192.0.2.1', '224.0.0.1', '::1', '::ffff:127.0.0.1', 'fd00::1', 'fe80::1', '2001:db8::1', '64:ff9b::c0a8:101'])('rejects reserved IP %s', (address) => {
    expect(isPublicAddress(address)).toBe(false);
  });

  it('accepts publicly routable addresses', () => {
    expect(isPublicAddress('8.8.8.8')).toBe(true);
    expect(isPublicAddress('2001:4860:4860::8888')).toBe(true);
  });

  it.each(['file:///etc/passwd', 'http://localhost/', 'http://127.0.0.1/', 'http://2130706433/', 'http://169.254.169.254/latest/meta-data/', 'http://user:password@example.org/', 'https://example.org:8443/feed', 'https://server.internal/'])('does not fetch unsafe URL %s', async (url) => {
    const deps = dependencies();
    await expect(fetchPublicFeed(url, deps)).rejects.toThrow();
    expect(deps.request).not.toHaveBeenCalled();
  });

  it('pins a validated DNS result to the request and rejects mixed public/private answers', async () => {
    const deps = dependencies();
    expect(await fetchPublicFeed('https://example.org/feed', deps)).toBe('<rss></rss>');
    expect(deps.resolve).toHaveBeenCalledWith('example.org');
    expect(deps.request.mock.calls[0][1]).toEqual({ address: '8.8.8.8', family: 4 });
    const mixed: PublicFeedDependencies = { ...deps, resolve: async () => [{ address: '8.8.8.8', family: 4 }, { address: '10.0.0.2', family: 4 }] };
    deps.request.mockClear();
    await expect(fetchPublicFeed('https://example.org/feed', mixed)).rejects.toThrow('not publicly routable');
    expect(deps.request).not.toHaveBeenCalled();
  });

  it('revalidates redirects before connecting to the destination', async () => {
    const deps: PublicFeedDependencies = {
      resolve: async () => [{ address: '8.8.8.8', family: 4 }],
      request: vi.fn(async () => ({ status: 302, location: 'http://169.254.169.254/latest/meta-data/' })),
    };
    await expect(fetchPublicFeed('https://example.org/feed', deps)).rejects.toThrow('not publicly routable');
    expect(deps.request).toHaveBeenCalledTimes(1);
  });

  it('limits redirect loops', async () => {
    const deps: PublicFeedDependencies = { resolve: async () => [{ address: '8.8.8.8', family: 4 }], request: async () => ({ status: 301, location: '/same' }) };
    await expect(fetchPublicFeed('https://example.org/feed', deps)).rejects.toThrow('Too many feed redirects');
  });
});
