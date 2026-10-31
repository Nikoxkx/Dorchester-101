import { lookup } from 'node:dns/promises';
import { request as httpRequest, type IncomingMessage } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { isIP } from 'node:net';
import ipaddr from 'ipaddr.js';

/**
 * User-provided RSS URLs must not reach loopback, private networks, cloud
 * metadata or other reserved addresses. Each redirect is revalidated and the
 * actual connection is pinned to a checked DNS result, avoiding DNS rebinding.
 */
const MAX_BYTES = 1_000_000;
const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 8_000;
const USER_AGENT = 'DOR101 community hub (https://github.com/Nikoxkx/Dorchester-101)';

type Address = { address: string; family: number };
type NetworkResponse = { status: number; location?: string; body?: string };
export type PublicFeedDependencies = {
  resolve: (hostname: string) => Promise<Address[]>;
  request: (url: URL, address: Address, signal: AbortSignal) => Promise<NetworkResponse>;
};

export function isPublicAddress(address: string): boolean {
  try {
    // IPv4-mapped IPv6 and transition ranges are deliberately rejected too.
    return ipaddr.parse(address).range() === 'unicast';
  } catch { return false; }
}

function validateUrl(value: string): URL {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Feed URL is not permitted');
  if ((url.protocol === 'http:' && url.port && url.port !== '80') || (url.protocol === 'https:' && url.port && url.port !== '443')) throw new Error('Feed port is not permitted');
  const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (!host || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) throw new Error('Feed host is not permitted');
  return url;
}

async function withAbort<T>(operation: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) throw new Error('Feed request timed out');
  return new Promise<T>((resolve, reject) => {
    const abort = () => reject(new Error('Feed request timed out'));
    signal.addEventListener('abort', abort, { once: true });
    operation.then((value) => { signal.removeEventListener('abort', abort); resolve(value); }, (error: unknown) => { signal.removeEventListener('abort', abort); reject(error); });
  });
}

function networkRequest(url: URL, address: Address, signal: AbortSignal): Promise<NetworkResponse> {
  return new Promise((resolve, reject) => {
    const hostname = url.hostname.replace(/^\[|\]$/g, '');
    const request = url.protocol === 'https:' ? httpsRequest : httpRequest;
    // Connect to the previously validated IP, not the hostname again. The
    // original host is retained for TLS certificate checks, SNI and HTTP Host.
    const req = request({
      protocol: url.protocol,
      hostname: address.address,
      family: address.family,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: `${url.pathname}${url.search}`,
      method: 'GET',
      ...(url.protocol === 'https:' && !isIP(hostname) ? { servername: hostname } : {}),
      headers: { host: url.host, 'user-agent': USER_AGENT, accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml', 'accept-encoding': 'identity' },
      signal,
    }, (res: IncomingMessage) => {
      const status = res.statusCode ?? 0;
      const location = res.headers.location;
      if (status < 200 || status >= 300) {
        res.on('error', () => {});
        res.destroy();
        resolve({ status, location });
        return;
      }
      const encoding = res.headers['content-encoding'];
      if (encoding && encoding !== 'identity') {
        res.on('error', () => {});
        res.destroy();
        reject(new Error('Unsupported feed encoding'));
        return;
      }
      const chunks: Buffer[] = [];
      let size = 0;
      res.on('data', (chunk: Buffer) => {
        size += chunk.length;
        if (size > MAX_BYTES) { res.destroy(); reject(new Error('Feed is too large')); return; }
        chunks.push(chunk);
      });
      res.on('error', reject);
      res.on('end', () => {
        const charset = /charset\s*=\s*["']?([^;\s"']+)/i.exec(res.headers['content-type'] ?? '')?.[1] ?? 'utf-8';
        try { resolve({ status, body: new TextDecoder(charset).decode(Buffer.concat(chunks)) }); }
        catch { reject(new Error('Unsupported feed character set')); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

const DEFAULT_DEPENDENCIES: PublicFeedDependencies = {
  resolve: (hostname) => lookup(hostname, { all: true, verbatim: true }),
  request: networkRequest,
};

export async function fetchPublicFeed(rawUrl: string, deps: PublicFeedDependencies = DEFAULT_DEPENDENCIES): Promise<string> {
  const signal = AbortSignal.timeout(TIMEOUT_MS);
  let current = validateUrl(rawUrl);
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
    const host = current.hostname.replace(/^\[|\]$/g, '');
    const literal = isIP(host);
    const addresses = literal ? [{ address: host, family: literal }] : await withAbort(deps.resolve(host), signal);
    // Mixed public/private answers are rejected, not randomly selected.
    if (!addresses.length || addresses.some(({ address, family }) => !isPublicAddress(address) || (family !== 4 && family !== 6))) throw new Error('Feed host is not publicly routable');
    const response = await withAbort(deps.request(current, addresses[0], signal), signal);
    if ([301, 302, 303, 307, 308].includes(response.status) && response.location) {
      if (redirects === MAX_REDIRECTS) throw new Error('Too many feed redirects');
      current = validateUrl(new URL(response.location, current).toString());
      continue;
    }
    if (response.status < 200 || response.status >= 300 || typeof response.body !== 'string') throw new Error('Feed request failed');
    return response.body;
  }
  throw new Error('Too many feed redirects');
}
