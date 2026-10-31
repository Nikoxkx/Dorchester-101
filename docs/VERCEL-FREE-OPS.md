# Vercel Free-Tier Operations — What’s on, what it costs (nothing), and how to not hit caps

This is a historical operations guide. Check current Vercel plan limits, pricing and deployed configuration; the estimates below are not guarantees.

## Caps you’ll actually encounter

| Resource | Hobby free | DOR101 usage (est.) | Headroom |
|----------|-----------|---------------------|----------|
| Fast Data Transfer | 100 GB/mo | ~0.3 GB/mo at 500 visits/mo (2 MB avg) | 99 GB |
| Fast Origin Transfer | 10 GB/mo | ~0.1 GB/mo (most hits are CDN HITs) | 9 GB |
| CDN Requests | 1 M/mo | ~8 k/mo (500 visits × 16 requests) | 992 k |
| Function Invocations | 1 M/mo | ~15 k/mo (API calls: news/mbta/market ~hourly warm) | 985 k |
| Active CPU | 4 h (14 400 s) | ~0.02 h/mo (avg 40 ms × 15 k invocations) | 3.9 h |
| Provisioned Memory | 360 GB-hrs | ~2 GB-hrs | 358 |
| Image Transforms | 5 000/mo | ~30/mo (AVIF/WebP per deploy, cached 31 d) | 4 970 |
| Web Analytics Events | 50 000/mo | ~500/mo | 49.5 k |
| Speed Insights Events | 10 000/30 d | ~500/30 d | 9.5 k |
| Deployments | 100/day, 1 concurrent | ~3/day (main push + PRs) | 97 |
| WAF Custom rules | 3 | 3 configured | 0 |
| Cron executions | 100 crons, 1/day each | 2 crons × 30/mo = 60 invocations | — |

Usage and limits can change; monitor the actual project rather than assuming these estimates will remain under plan limits. The one that could trip is **Fast Origin Transfer** if you accidentally mark API responses `no-store` forever — we fixed those to 60–3600 s `s-maxage` so they cache.

## What’s automatic on Vercel (cost: $0, you don’t touch it)

- **Git → Deploy**: push to `main` = prod, PR = preview (+ auto `X-Robots-Tag: noindex` on previews)
- **HTTPS**: Let's Encrypt cert auto-provisions + rotates; HSTS header we added upgrades every request to HTTPS
- **DDoS**: Vercel edge scrubs L3/L4
- **Build cache**: deps cached between builds (1 GB/30 days)
- **Preview Comments**: enabled (`previewCommentsEnabled: true`) — teammates comment on previews in Figma-like UI
- **Rollback**: **Deployments → ⋯ → Rollback** (instant, no rebuild)

## What we configured deliberately

### vercel.json
- `cleanUrls: true`, `trailingSlash: false` → one canonical per page (no duplicate `/food/` vs `/food` indexing)
- `headers` → HSTS, DNS prefetch, CDN cache times for `_next/static`, `img/`, `sw.js`, `api/health`
- `redirects` → `/home`→`/`, `/index.html`→`/`, normalised trailing slashes
- `rewrites` → `/.well-known/security.txt` → `/security.txt` (RFC 9116 path)
- `crons` → `/api/cron/refresh` daily 09:00 UTC, `/api/health` daily 12:00 UTC
- `github.silent: true` → fewer bot comments on PRs

### middleware.ts (Edge)
- Strips `utm_*`, `gclid`, `fbclid` → 308 to clean URL (saves CDN cache keys)
- Sets `Vary: Accept-Language`
- Forces `X-Robots-Tag: noindex` on `/api/*` (belt-and-braces)

### next.config.ts headers
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-DNS-Prefetch-Control: on`, `X-Permitted-Cross-Domain-Policies: none`
- Prod CSP tightens `script-src` (drops `unsafe-eval` needed only in dev)
- `Cache-Control` for `/_next/static` (immutable = 1 year), `img/`, `icons/`, `sw.js`, `manifest.json`, `.well-known/security.txt`
- `images.minimumCacheTTL = 86400` (1 day edge image cache)

### Env vars (must exist in Vercel UI)
Set these in **Settings → Environment Variables** (Production scope):

| Var | Example | Why |
|-----|---------|-----|
| `NEXT_PUBLIC_SITE_URL` | `https://dorchester-101.vercel.app` | Canonical/sitemap/OG/JSON-LD host |
| `CENSUS_API_KEY` | `a1b2c3…` | 8× faster market-data; get at api.census.gov/data/key_signup.html |
| `CRON_SECRET` | `openssl rand -hex 32` | Auth cron route; Vercel sends it automatically |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | `AbC123…` | Google Search Console verification meta |
| `NEXT_PUBLIC_BING_SITE_VERIFICATION` | `AbCdEf…` | Bing Webmaster Tools |
| `NEXT_PUBLIC_CONTACT_EMAIL` | `you@example.com` | Overrides Contact fallback URL |

No secret is committed to git.

## Manual steps still needed (one-time clicks in Vercel UI)

1. **WAF rules** (Security → Firewall → Custom Rules → Create — free tier 3):
   - Block empty UA: `http.user_agent == ""` → Block
   - Rate-limit API: `http.request.uri.path contains "/api/"` → Enforce rate limit 100 req / 60 s → Challenge
   - Block bad probes: `http.request.uri.path contains "/.env"` → Block
2. **Web Analytics & Speed Insights** require the host to enable the services and the visitor to opt in. Verify actual deployed behaviour and consent withdrawal; do not assume a visit automatically produces events.
3. **Custom domain** (optional) → see `docs/DOMAIN-SETUP.md`.

## What we deliberately did NOT add

- **Blob, KV, Postgres**: file-backed datasets (`src/data/*.ts`) are faster + cheaper (0 invocations) for a read-mostly directory.
- **Password-protected previews**: Pro-only; we kept Standard protection (`ssoProtection: all_except_custom_domains`) so Hobby stays free.
- **Multi-region functions / elastic concurrency**: Pro.

## Logs & debug (Hobby: 1 hr retention)

- Vercel → **Logs** → filter `level:error` or `host: dorchester-101.vercel.app`
- `/api/health` → machine-readable deploy self-check (database, feeds, verification age, MBTA key, transit age)
- Browser console → `[DOR101] route error` with `digest` ties to server log
