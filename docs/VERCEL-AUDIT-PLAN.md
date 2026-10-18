# DOR101 — Vercel Free-Tier Maximization Plan
### Deep Research Audit + Implementation Roadmap
**Date:** 2026-10-18 (UTC) · **Project:** `dorchester-101` (`prj_URHaWEF9vbsCfuk2e7CL3Ivch8hd`) · **Team:** `team-tung-tung-yaya` (Hobby) · **Production URL:** `dorchester-101.vercel.app` · **GitHub:** `Nikoxkx/Dorchester-101` (branch `main` → production)

This is the **“what we will add” list you asked for before any code changes**. Every item below is **free on Vercel Hobby** [1](https://vercel.com/docs/plans/hobby). Nothing here requires a paid upgrade, a Pro seat, or a credit-card meter.

---

## 0) Executive Summary — what “fully functional” means here

You asked for 4 things:

1. **Up and running on Vercel** — green production deploy, CI from GitHub, automatic preview URLs for PRs, no manual `vercel --prod`.
2. **Shows up when you search it** — Google/Bing can crawl it, the sitemap + robots are correct, structured data is present, canonical is not localhost, pages have unique titles/descriptions, performance is ≥90.
3. **Uses every relevant Vercel free feature** — CDN caching, image optimization, analytics, Speed Insights, edge middleware, cron, environment variables, security headers, etc., without exceeding Hobby caps (100 GB transfer, 1 M CDN requests, 1 M function invocations, 5 K image transforms/month) [2](https://temps.sh/blog/vercel-pricing-complete-guide-2026).
4. **Works as a website *and* as an app** — PWA installable, offline-capable via service worker (`sw.js`), Electron desktop download served from latest GitHub release already works.

**Current verdict:** the site *deploys* (last production `dpl_A2aQ8j...` is `READY`/`PROMOTED`), but it is **not indexable as written** because `SITE_URL` defaults to `http://localhost:3000` when no `NEXT_PUBLIC_SITE_URL` env var is set on Vercel — so sitemap, robots, OG images and JSON-LD all point at localhost. We will fix that and layer on the rest.

---

## 1) Audit — what exists today (keep / fix / add)

### 1A. What’s good (keep)
- **Framework:** Next.js 16.3 App Router with `reactStrictMode`, Turbopack, `optimizePackageImports` for lucide/framer/recharts/date-fns — already ideal for Vercel.
- **Routing:** All pages are filesystem routes under `src/app/` (about, affordable-housing, food, map, market-trends, neighborhood, news, projects, resources, tools, etc.).
- **SEO primitives:** `src/app/layout.tsx` already emits `metadataBase`, OpenGraph, Twitter card, `alternates.canonical`, `robots`, JSON-LD (`WebSite` + `Organization` with `SearchAction`), and `viewport`.
- **Sitemap + Robots:** `src/app/sitemap.ts` and `src/app/robots.ts` are dynamic route handlers (standard `/sitemap.xml`, `/robots.txt`), with `lastModified` tied to real verification dates.
- **OG image:** `src/app/api/og/route.tsx` generates a 1200×630 `ImageResponse`; static fallback `public/og.png` also exists.
- **PWA:** `public/manifest.json` (icons 192–512 + maskable + shortcuts), `public/sw.js` (versioned caches `dor101-shell/manifest`, `dor101-live`, `dor101-tiles`, trim logic), `public/offline.html`, `public/icons/*`, `public/icon.svg`.
- **Error UX:** `not-found.tsx` (404), `error.tsx`, `global-error.tsx`, `loading.tsx` skeletons — all localized.
- **API routes:** 11 handlers under `src/app/api/` (news, mbta, market-data, resources, health, docs, download, etc.) — already set `dynamic = 'force-dynamic'` and some set `Cache-Control` (mbta, search, og).
- **Security baseline:** `next.config.ts` emits `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, CSP (`default-src 'self'` + inline styles/scripts for Leaflet), `X-Frame-Options: SAMEORIGIN` in prod only, plus `Cache-Control` for `/img/*` and `sw.js`.
- **CI/CD:** `.github/workflows/ci-cd.yml` (lint → typecheck → test → build → e2e → deploy via `amondnet/vercel-action@v25`), gated on secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- **Vercel project linkage:** GitHub repo auto-creates preview deployments per branch; production is `dorchester-101.vercel.app` (+ `dorchester-101-team-tung-tung-yaya.vercel.app` alias). Web Analytics is enabled in Vercel dashboard (`webAnalytics.id = xDSqoor...`) and Speed Insights slot exists but has no data yet.
- **Design system:** CSS tokens in `globals.css` handle 8 palettes × light/dark without extra JS — lightweight for Core Web Vitals.

### 1B. What’s broken / misconfigured (fix before adding anything else)
| # | Gap | Impact | Source |
|---|-----|--------|--------|
| B1 | **No `NEXT_PUBLIC_SITE_URL` env var on Vercel** → `SITE_URL` falls back to `http://localhost:3000` at build time | Sitemap URLs are `http://localhost:3000/...`, canonical is localhost, OG `metadataBase` is localhost, JSON-LD `url` is localhost — **Google discards these**; social previews 404. | `src/lib/site.ts:12`, `vercel list_env_vars → []` |
| B2 | **No `vercel.json`** → Vercel uses defaults only | Missing: global redirects (apex ↔ www), cleanUrls/trailingSlash policy, extra security headers (HSTS), cron definition, `headers` for static assets, `rewrites` for well-known files. | repo root |
| B3 | **Web Analytics installed via dashboard but not in repo** — latest preview branch `vercel/install-vercel-web-analytics-9zwo5l` added `@vercel/analytics` + `<Analytics/>` but never merged to `main`; current `main` branch `package.json` has no `@vercel/analytics` and `src/app/layout.tsx` in this branch has no import | Vercel dashboard shows Web Analytics “enabled” but production build isn’t emitting the script — **events = 0**. Speed Insights similarly not wired (`@vercel/speed-insights` absent). | `package.json`, `src/app/layout.tsx`, project `latestDeployments` |
| B4 | **No Speed Insights component** | Core Web Vitals (LCP/CLS/INP) not measured on real users; can’t prove “fully functional” or tune performance. Free on Hobby: 10 k events/30 days [1](https://vercel.com/docs/plans/hobby). | `package.json` |
| B5 | **API cache headers incomplete** | Only 3 of 11 API routes set `Cache-Control`; others are `no-store` by default → every navigation hits origin → burns 10 GB Fast Origin Transfer quota faster than needed [2](https://temps.sh/blog/vercel-pricing-complete-guide-2026). | `src/app/api/*/route.ts` |
| B6 | **Image optimization under-used** | `next.config.ts` `images` block is good but no loader tuning; no explicit `remotePatterns` guard; no `unoptimized: false` declaration. Vercel gives 5 K transforms/month free — we should claim them. | `next.config.ts` |
| B7 | **HSTS and extra security headers missing** | `Strict-Transport-Security` is the #1 “production readiness” header Vercel recommends via `next.config.headers()`. Also missing: `X-DNS-Prefetch-Control`, `X-Permitted-Cross-Domain-Policies`, stricter `Permissions-Policy` (already partial). | `next.config.ts:securityHeaders` |
| B8 | **No favicon/metadata completeness** | `manifest.json` references `apple-touch-icon.png` but no `favicon.ico` fallback; no `browserconfig.xml`; no legacy `<link rel="icon">` sizes audit. Small SEO signal loss. | `public/` |
| B9 | **No verification files** | No `google-site-verification` meta or file, no `BingSiteAuth`, no `IndexNow` key — you can’t submit sitemap to Search Console without verifying. | `src/app/layout.tsx` |
| B10 | **No `llms.txt` / `security.txt` / `humans.txt` / `.well-known` routing** | Modern crawlers + AI indexers + security researchers look for these at standard paths. | `public/` |
| B11 | **No structured data beyond org/website** | Single JSON-LD block (good) but missing: `BreadcrumbList` per page, `FAQPage` for `/faq`, `Dataset` for market/housing, `Place` + `OpeningHoursSpecification` for resources — rich results not triggered. | `src/app/layout.tsx` |
| B12 | **No Vercel Cron** | Free: 100 crons/project at 1×/day on Hobby [5](https://musayilmaz.dev/en/blog/vercel-free-tier-production). Could warm news/MBTA/market caches daily without visitor request. | `vercel.json` missing |
| B13 | **CI deploy uses legacy action but secrets absent in repo UI path** | Workflow already handles missing secrets gracefully (“Deploy skipped”), but we will add a Vercel-native Git integration path that needs 0 secrets (Vercel auto-deploys from GitHub `main`). | `.github/workflows/ci-cd.yml` |

### 1C. What Vercel shows right now
- **Project:** `dorchester-101` · framework `nextjs` · Node 24.x · region `iad1` (US East) · `prod` target is `dpl_A2aQ8j...` at `https://dorchester-101.vercel.app` (`READY`, `PROMOTED`). Latest preview is the analytics-install branch `dorchester-101-git-vercel-install-ve-0eb7cc...` (`READY`, `STAGED`). [Vercel API]
- **Env vars:** 0 on project [Vercel API `list_env_vars`].
- **Domains:** 0 custom [Vercel API `list_domains`]. Only `*.vercel.app` aliases.
- **Hobby caps (remember for design):** 100 GB Fast Data Transfer, 1 M CDN Requests, 1 M Function Invocations, 4 CPU-hrs Active CPU, 360 GB-hrs Provisioned Memory, 5 K Image Transforms, 50 K Web Analytics events, 10 K Speed Insights events, 200 projects, 100 deploys/day, 1 concurrent build, 3 WAF custom rules [1](https://vercel.com/docs/plans/hobby) [2](https://temps.sh/blog/vercel-pricing-complete-guide-2026).

---

## 2) Full Inventory — every free Vercel feature we *can* activate

> Checked against official Hobby docs + Sept/Oct 2026 pricing revisions. Only items marked “✓ Hobby (free)” are in scope. “No” = Pro/Enterprise only, so deliberately excluded.

| Category | Feature | Hobby (free) | What it does for DOR101 | Will we add? |
|----------|---------|:------------:|-------------------------|--------------|
| **Hosting** | Automatic Git → Deploy (push to `main` = prod, PR = preview) | ✓ | Zero-config CD already partly wired; we’ll complete it | **Yes — verify & document** |
| | Preview Deployments (with `X-Robots-Tag: noindex` auto-set by Vercel) | ✓ | Stakeholders review without polluting Google index [4](https://swapbiswas.com/blog/vercel-google-indexing/) | **Yes — keep default** |
| | Deployment Protection (Standard: previews locked, prod public) | ✓ | Prevent strangers indexing previews; prod stays crawlable | **Yes — confirm `ssoProtection: all_except_custom_domains`** |
| | Automatic HTTPS + automatic cert renewal | ✓ | Trust + SEO ranking signal | **Yes — automatic** |
| | Zero-config Next.js detection (build command, output dir auto) | ✓ | No custom build command needed | Keep auto |
| | Build Cache (deps cache 1 GB/1 mo between builds) | ✓ | Faster deploys | Automatic |
| **Domains** | Custom domains (up to 50/project free) | ✓ | Branded domain outranks `*.vercel.app` in SERP | **Yes — guide, + add placeholder hook** |
| | Automatic apex ↔ www redirect (308) | ✓ | Consolidates duplicate host signal for Google | **Yes via `vercel.json` redirects** |
| | Clean URLs / trailing slash normalization | ✓ | Avoids `page` vs `page/` duplicate indexing | **Yes** |
| **Performance** | Global Edge CDN (cache on `s-maxage` + `stale-while-revalidate`) | ✓ | Sub-50 ms TTFB for repeat visitors | **Yes — headers everywhere** |
| | ISR (Incremental Static Regeneration) | ✓ | Static-fast + live-fresh without redeploy | **Yes for news/resources** |
| | Vercel Data Cache (global purge < 300 ms) | ✓ | Revalidate without full rebuild [5](https://vercel.com/docs/caching/runtime-cache/data-cache) | **Yes** |
| | Image Optimization (next/image → on-demand, edge-cached 31 days) | ✓ 5 K transforms/mo | AVIF/WebP responsive images — saves ~40 % bandwidth [3](https://raymartin.es/en/blog/nextjs-vercel-deployment) | **Yes — tune `next.config.images`** |
| | Font Optimization (next/font auto-subset, self-host) | ✓ | Already using `@fontsource` — complements | Keep |
| | Edge Middleware (`middleware.ts` on Edge Runtime) | ✓ | Geo, i18n, auth at edge before origin | **Yes — lightweight i18n + security** |
| | `Vary` header control (geo, locale) | ✓ | Cache variants correctly [4](https://vercel.com/docs/caching/cdn-cache) | **Yes if needed** |
| **Security** | DDoS mitigation (automatic, always on) | ✓ | Resilience | Automatic |
| | Web Application Firewall (managed + 3 custom rules free) | ✓ up to 3 | Block bad bots, SQLi probes, scraper abuse | **Yes — 3 rules** |
| | Security headers via `next.config.headers()` | ✓ | HSTS + CSP + X-XXX hardening — ranking + A+ on securityheaders.com | **Yes** |
| | Isolated builds & env var encryption | ✓ | Secrets never in bundle | **Yes — move CENSUS_API_KEY to Vercel env** |
| **Observability** | Runtime logs (1 hr retention Hobby) | ✓ | Debug prod without SSH | Automatic |
| | Health endpoint already (`/api/health`) — keep | ✓ | Uptime monitor | Keep |
| | Vercel Web Analytics (privacy-friendly, no cookie) | ✓ 50 K events/mo, 1 mo retention [1](https://vercel.com/docs/plans/hobby) | Pageviews without tracking residents | **Yes** |
| | Vercel Speed Insights (Core Web Vitals) | ✓ 10 K events/30 days shared | Real-user LCP/CLS/INP to fix [1](https://vercel.com/docs/plans/hobby) | **Yes** |
| | Deployment comments (GitHub PR integration) | ✓ | Preview link in PR | Already on |
| **Search & SEO** | Automatic `X-Robots-Tag: noindex` on previews/old proms | ✓ | Prevents duplicate-index penalty [4](https://swapbiswas.com/blog/vercel-google-indexing/) | Automatic |
| | Custom `robots.txt` + `sitemap.xml` | ✓ | You own crawl budget | **Yes — enhance** |
| | `llms.txt`, `security.txt`, `humans.txt`, `/.well-known/*` | ✓ | AI crawlers + security disclosure + humans | **Yes** |
| | IndexNow / Search Console verification support | ✓ (you add the file/meta) | Push indexing signal | **Yes — plumbing** |
| **Compute** | Serverless Functions (Node) | ✓ 1 M invocations, 4 CPU-hrs, timeout 300 s [1](https://vercel.com/docs/plans/hobby) | All 11 API routes already fit well | Keep + optimize |
| | Edge Functions (geo-distributed, low latency) | ✓ (within same invocation quota) | Middleware/rewrite tier | **Yes — middleware** |
| | Cron Jobs | ✓ 100/proj, 1/day [5](https://musayilmaz.dev/en/blog/vercel-free-tier-production) | Daily cache warm / health ping | **Yes — 2 crons** |
| **Storage** | Vercel Blob (public file store) | ✓ 1 GB, 10 GB transfer [2](https://temps.sh/blog/vercel-pricing-complete-guide-2026) | Host downloadable reports without GitHub | **Optional — placeholder** |
| | Edge Config (feature flags, fast reads) | ✓ 100 K reads, 100 writes [1](https://vercel.com/docs/plans/hobby) | Toggle maintenance banner in < 10 ms | **Optional — 1 flag** |
| | KV / Postgres | ✓ tiny free quota (hundreds of MB) | Could replace `globalCache` — but current file-backed data is simpler & cheaper (0 invocations) | **No — not needed for DOR101’s static JSON architecture** |
| **DX** | Vercel Toolbar (feedback comments) | ✓ | Visitors leave comments on previews | **Yes — enable** |
| | Instant rollback | ✓ | One-click revert | Already there |
| | Checks (build passes → deploys) | ✓ | CI gate | Already wired |

---

## 3) Proposed Changes — organized so you can approve by section

### Section A — “Up and running” (deploy + env + build)

**A1. Add `.env.example` → `src/lib/site.ts` contract**
Already correct: `SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'`. No code change; we will **set `NEXT_PUBLIC_SITE_URL=https://dorchester-101.vercel.app` in Vercel** (Production + Preview + Development envs). This alone fixes sitemap/canonical/OG/JSON-LD.

**A2. Create `vercel.json` (new file, project root)**
This is the single biggest unlock for free-tier completeness:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "X-DNS-Prefetch-Control", "value": "on" },
        { "key": "X-Permitted-Cross-Domain-Policies", "value": "none" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }
      ]
    },
    {
      "source": "/_next/static/(.*)",
      "headers": [ { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" } ]
    },
    {
      "source": "/img/(.*)",
      "headers": [ { "key": "Cache-Control", "value": "public, max-age=604800, stale-while-revalidate=2592000" } ]
    },
    {
      "source": "/icons/(.*)",
      "headers": [ { "key": "Cache-Control", "value": "public, max-age=604800, stale-while-revalidate=2592000" } ]
    },
    {
      "source": "/sw.js",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" },
        { "key": "Service-Worker-Allowed", "value": "/" }
      ]
    },
    {
      "source": "/api/health",
      "headers": [ { "key": "Cache-Control", "value": "no-store" } ]
    },
    {
      "source": "/.well-known/security.txt",
      "headers": [ { "key": "Content-Type", "value": "text/plain; charset=utf-8" } ]
    }
  ],
  "redirects": [
    { "source": "/home", "destination": "/", "permanent": true },
    { "source": "/index.html", "destination": "/", "permanent": true },
    { "source": "/resources/", "destination": "/resources", "permanent": true }
  ],
  "rewrites": [
    { "source": "/.well-known/security.txt", "destination": "/security.txt" }
  ],
  "crons": [
    { "path": "/api/cron/refresh", "schedule": "0 9 * * *" },
    { "path": "/api/health",       "schedule": "0 * * * *" }
  ],
  "github": { "silent": true }
}
```

Why each line: `cleanUrls` kills `/page.html` duplicates; `trailingSlash:false` picks one canonical form so Google doesn’t index both `/food` and `/food/`; the top `Strict-Transport-Security` header is what SSL Labs / securityheaders check for; static-asset `max-age=31536000 immutable` is what Vercel CDN uses to serve `_next/static` forever (fingerprinted by hash); `crons` are free daily/hourly triggers (Hobby = once/day, hourly schedule degrades to daily auto — we’ll set daily + hourly and Vercel enforces the tier).

**A3. Wire Vercel Environment Variables (via dashboard / API — not committed to git)**
- `NEXT_PUBLIC_SITE_URL` = `https://dorchester-101.vercel.app` (Production + Preview). Falls back to `http://localhost:3000` in dev — so no `CORS` change locally.
- `CENSUS_API_KEY` — optional but we’ll add a placeholder instruction (free from https://api.census.gov/data/key_signup.html) so market-data uses direct `api.census.gov` + single-call path instead of scraping `data.census.gov` (8× faster).
- `NEXT_PUBLIC_CONTACT_EMAIL` / `NEXT_PUBLIC_CONTACT_URL` — optional, already read by `site.ts`.
- `CRON_SECRET` — protects cron endpoints (Vercel auto-sends `Authorization: Bearer <CRON_SECRET>` for cron invocations).
No secrets will be committed; `.env.example` will be updated with comments only.

**A4. Add `src/app/api/cron/refresh/route.ts` (new)**
A tiny authenticated GET that touches the in-memory `globalCache` warm paths: news snapshot, market-data fallback, resources list. On Hobby it runs **once per day** at 9 AM Boston time (cron UTC `0 9 * * *` is 5 AM ET; we’ll document the ET offset). Verified with `Authorization: Bearer ${process.env.CRON_SECRET}` + Vercel’s own `x-vercel-cron` header guard.

**A5. Keep Git integration = auto-deploys (already done)**
Project `link.type = github` → Vercel creates a deployment for every push. No changes to `.github/workflows/ci-cd.yml` except: add a `vercel.json`-aware build note and keep the “deploy skipped if no secrets” branch — the Git-integration deploy already happens even when `VERCEL_TOKEN` is empty (it’s the manual `amondnet/vercel-action` that needs secrets; Git deploy does not). We’ll add a comment explaining this so future readers don’t think “deploy skipped” means “site is down”.

---

### Section B — “Shows up when you search it” (SEO & Indexability)

This is the largest section — it’s where “fully functional website” is won or lost.

**B1. Fix canonical + metadataBase (zero-code, via A3 env var)**
Once `NEXT_PUBLIC_SITE_URL` is `https://dorchester-101.vercel.app`, every existing handler automatically emits:
- `<link rel="canonical">` = `https://dorchester-101.vercel.app/<page>`
- `sitemap.xml` URLs = `https://dorchester-101.vercel.app/...`
- `robots.txt` host + sitemap = same origin
- `og:image` absolute URL resolves.

**B2. Enhance `sitemap.ts` (no new routes, just richer signals)**
Keep current `PUBLIC_ROUTES` list but update:
- `changeFrequency` logic keeps `news` + `map` as `hourly`, directories as `weekly` — correct.
- Add `video` / `image` hints: include `/og.png` as image for `/` explicitly (Next `MetadataRoute.Sitemap` supports `images?: string[]`).
- Ensure `lastModified` never lies: already uses `lastReviewedOn()` for `/about`/`/faq`; we’ll keep that and add `lastReviewedOn()` for `/resources` too.

**B3. Enhance `robots.ts`**
Add explicit `Sitemap:` line (already there via `host`) + `clean-param` note; keep `Disallow: /api/` (critical: prevents crawler burning MBTA quota). Add comment explaining Vercel’s automatic `X-Robots-Tag: noindex` on previews [4](https://swapbiswas.com/blog/vercel-google-indexing/) so readers don’t add a manual noindex that would block preview testing.

**B4. Add missing well-known files (new files, public + rewrites)**
- `public/llms.txt` — AI-crawler allowlist + sitemap pointer (OpenAI, Anthropic, Google-Extended all read this now).
- `public/security.txt` (+ `/.well-known/security.txt` rewrite) per RFC 9116: `Contact: https://github.com/Nikoxkx/Dorchester-101/issues/new` + `Expires` + `Preferred-Languages: en, es, ht, pt, vi, zh, ar, so, kea`.
- `public/humans.txt` — credits humans (Yeisbel) + tech.
- `public/.well-known/vercel-trust.txt` — optional owner attestation hook (Vercel can verify later).

**B5. Add Search-Console verification plumbing (no hard-coded secrets)**
- Add optional env vars `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` and `NEXT_PUBLIC_BING_SITE_VERIFICATION` that, when set, emit:
  - `<meta name="google-site-verification" content="...">` in `layout.tsx:metadata.other` / `verification` block.
  - `/google<token>.html` and `/BingSiteAuth.xml` static routes via `src/app/google[Token]/route.ts` pattern (only when env var exists).
Docs (`docs/SEARCH-SETUP.md` new) will walk: “paste the 43-char Google token into Vercel env var `...`, redeploy, click Verify in https://search.google.com/search-console/welcome”.

**B6. Rich JSON-LD per page (beyond the global WebSite+Organization)**
Root `layout.tsx` already has the 2-block JSON-LD. We’ll add:
- **Global `BreadcrumbList`** injected by a small `src/lib/jsonLd.ts` helper used by every page layout.
- **`FAQPage`** structured data on `/faq` (from i18n `faq.*` keys) — triggers FAQ rich result.
- **`Dataset`** on `/market-trends` (census + HUD metadata).
- **`Place` + `OpeningHoursSpecification`** for each resource → emitted on `/resources?place=<id>` or in the resources JSON already consumed by `/api/resources`.
All JSON-LD stays server-rendered, no client JS needed.

**B7. Titles + descriptions become unique per page (not just layout template)**
Current `layout.tsx` `title.template = %s · DOR101` is correct, but sub-pages (`/food`, `/news`, `/about`, etc.) re-use `page.tsx` without exporting `metadata`. We will add a `export const metadata: Metadata = { title: '...', description: '...', openGraph: { ... }, alternates: { canonical: '/food' } }` to **each** page file. Each description is ≤ 160 chars, action-oriented (“Find free food pantries…”), and includes “Dorchester, Boston”.

**B8. Open Graph completeness**
- Ensure every page’s `openGraph.images` points to `/api/og` with per-page query (e.g., `/api/og?title=Food Resources`) falling back to `/og.png`.
- Add `src/app/opengraph-image.tsx` + `twitter-image.tsx` as Vercel’s file-based OG convention (auto-detected, edge-cached).
- Add `favicon.ico`, `apple-touch-icon.png` already exists → verify via `/icons/` and add `icon` link variants in `layout.tsx` (already there: 192/256/512).

**B9. Performance → SEO (Core Web Vitals)**
Google’s ranking heavily weights LCP/CLS/INP. Vercel Hobby gives Speed Insights 10 K events free, and Image Optimization 5 K transforms — we will:
- Wire `SpeedInsights` (B12).
- Add `loading="lazy"` + explicit `width`/`height` audit for all `next/image` (already mostly correct; we’ll verify map preview tiles aren’t layout-shifting).
- Ensure `next/image` stays optimized (no `unoptimized: true` escape).

**B10. Indexing docs & checklist (new)**
New `docs/SEARCH-SETUP.md` with the exact verification steps:
0. Set `NEXT_PUBLIC_SITE_URL` in Vercel.
1. Deploy → open `https://dorchester-101.vercel.app/sitemap.xml` (expect 200, 16 URLs, no localhost).
2. `curl -sI https://dorchester-101.vercel.app/` → expect `200` + **no** `x-robots-tag` line on prod, but `x-robots-tag: noindex` on any `*.vercel.app` preview URL [4](https://swapbiswas.com/blog/vercel-google-indexing/).
3. In Google Search Console: Add property → paste `https://dorchester-101.vercel.app` → verify via HTML tag → submit sitemap → Request Indexing on `/`.
4. Repeat in Bing Webmaster Tools.
5. Optional `IndexNow` key file (`/a1b2c3...txt`) — free push to Bing/Yandex.
6. Expect indexing in 1–14 days; check `site:dorchester-101.vercel.app` in Google.

---

### Section C — Security & Production Readiness (still free)

**C1. HSTS + extras (via vercel.json + next.config.ts)**
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (2-year HSTS — only on `https` production; Vercel terminates TLS automatically).
- `X-DNS-Prefetch-Control: on`, `X-Permitted-Cross-Domain-Policies: none`.
- Tighten CSP only if safe (add `connect-src 'self' https://tile.openstreetmap.org ...` already present; we will audit `script-src 'unsafe-eval'` — required by Leaflet/Next dev only — and scope it to `isDev` so prod CSP is stricter.

**C2. WAF — 3 free custom rules (via Vercel dashboard > Security)**
Recommended rules (we’ll document, you click “Create” — no code needed, free tier 3/3):
1. **Block empty-UA scraper** → `http.user_agent == ""` → Block + log.
2. **Rate-limit `/api/*`** → `http.request.uri.path contains "/api/"` AND `rate(60s, 100)` → Challenge (prevents MBTA quota burn).
3. **Block known bad path probes** → `http.request.uri.path contains "/.env"` OR `".git"` OR `"/wp-"` → Block.
Docs will show screenshot path: Project → Security → Firewall → Custom Rules.

**C3. Protected preview (already `ssoProtection: all_except_custom_domains` — confirm)**
Means previews need Vercel auth, prod does not — so Googlebot can crawl prod but not spam-preview hosts.

---

### Section D — Performance & Caching (use the free edge)

**D1. API route `Cache-Control` normalization (small code edits)**
Add consistent headers to **every** `/api/*` that serves public data:
- `/api/news`: `public, s-maxage=900, stale-while-revalidate=3600` (matches existing `CACHE_TTL.NEWS = 15 min`).
- `/api/mbta`: `public, s-maxage=25, stale-while-revalidate=120` (already partly there — unify).
- `/api/market-data`: `public, s-maxage=3600, stale-while-revalidate=7200` (Census snapshots hourly).
- `/api/resources`: `public, s-maxage=300, stale-while-revalidate=3600`.
- `/api/income-limits`, `/api/notifications`: same pattern.
- `/api/search`: already `s-maxage=60` — keep.
Dynamic user-specific `/api/docs` (admin check) stays `no-store`.

Why: Fast Origin Transfer free allowance is **10 GB/mo** [2](https://temps.sh/blog/vercel-pricing-complete-guide-2026); CDN cache hits don’t count toward it — so correct `s-maxage` multiplies your free quota.

**D2. `Vercel-CDN-Cache-Control` split (optional, advanced)**
Where we want edge to cache longer than browser (e.g., market data), we’ll emit both `Cache-Control` (browser) = `public, max-age=60` + `Vercel-CDN-Cache-Control: public, s-maxage=3600` so returning visitors still revalidate quickly but edge holds it for an hour. Vercel docs recommend this split [4](https://vercel.com/docs/caching/cache-control-headers).

**D3. Image Optimization tune (`next.config.ts:images`)**
Add explicit:
```ts
images: {
  formats: ['image/avif','image/webp'],
  deviceSizes: [360, 420, 640, 768, 1024, 1280, 1536],
  imageSizes: [16, 24, 32, 48, 64, 96, 128, 256],
  remotePatterns: [], // no remote hosts — all images are local /og
  minimumCacheTTL: 86400, // 1 day edge image cache (default 60s is wasteful)
}
```
No change to markup; `next/image` will now automatically request AVIF where supported, WebP otherwise, and Vercel caches the transform for 1 day [3](https://raymartin.es/en/blog/nextjs-vercel-deployment).

**D4. ISR / `revalidate` for quasi-static pages**
Add `export const revalidate = 3600` (1 hr) to:
- `src/app/news/page.tsx` — news list re-generates hourly even without redeploy.
- `src/app/market-trends/page.tsx` — census chart stays static 1 hr.
- `src/app/resources/page.tsx` — directory pages static 1 hr.
Vercel ISR stores the prerender in durable storage + CDN, so next visitor after expiry gets **stale** instantly while background regenerates [5](https://vercel.com/docs/caching).

**D5. Edge Middleware (`middleware.ts` new)**
Single file at root, runs on Edge Runtime (free, within invocation quota):
- Strip `utm_*` query pollution → redirect to clean canonical (one 308, then cached).
- Add `Vary: Accept-Language` header hint for i18n routes.
- Enforce canonical host redirect: if `host == dorchester-101-*.vercel.app` (preview alias) and `x-vercel-deployment-type == preview` → no action (let Vercel’s auto noindex handle it); if someone accesses via raw function domain in prod, we could optionally redirect — but we’ll keep it passive to avoid breaking preview tooling.
- Set `x-robots-tag` explicitly for `/api/*` → `noindex` (belt-and-braces beyond `robots.txt`).

---

### Section E — Observability (free tiers: Analytics + Insights)

**E1. Web Analytics (50 K events/month, 1-month window)**
Already provisioned in Vercel project. Implementation:
- `npm i @vercel/analytics`
- `src/app/layout.tsx`: `import { Analytics } from '@vercel/analytics/next';` → `<Analytics />` after `<ServiceWorkerRegistration/>`.
Privacy-compliant, no cookie, no consent banner needed (it hashes IP, respects DNT). Docs: https://vercel.com/docs/analytics

**E2. Speed Insights (10 K events/30 days)**
- `npm i @vercel/speed-insights`
- `src/app/layout.tsx`: `import { SpeedInsights } from '@vercel/speed-insights/next';` → `<SpeedInsights />`.
Shows Core Web Vitals breakdown per page/region in Vercel → Observability → Speed Insights. Will guide font/display swaps.

**E3. Runtime Log drain (optional, free 1 hr)**
No code; Vercel dashboard → Logs retains last hour on Hobby. We’ll add `src/lib/logger.ts` hook to emit JSON lines consumable in that Log view (already using `winston` — we’ll tighten to `vercel-log-drain` format).

---

### Section F — PWA + Offline (already strong — polish)

**F1. Service Worker already versioned (`VERSION='v4.2.0'`) — bump to `v4.3.0`**
Any new `manifest.json`/`offline.html` change requires bump so old caches purge via `activate` filter. We’ll add `/_next/static/` immutable comment already correct.

**F2. Manifest audit**
Confirm `public/manifest.json` meets Chrome’s installability 3 checks (already does: `name`+`short_name`, `start_url:/`, `display:standalone`, `icons: 192+512 inc maskable`). Add `screenshots` array (mobile + desktop) pointing to `public/img/dorchester-bay-sunset.jpg` for richer install UI on Android/Desktop — free and helps “app” feel.

**F3. Offline pre-cache expansion**
`sw.js` `SHELL_URLS = ['/', '/offline.html', '/icon.svg', ...]` — we’ll add `'/faq'` (most-visited help page) and `'/manifest.json'` already in shell. Tile cache trim already caps 480 entries.

---

### Section G — Desktop App (keep Vercel out of it, but integrate)

Electron build (`electron/`, `npm run build:exe` → `DOR101 Setup 4.0.0.exe`) is **not** hosted on Vercel (too large for Vercel’s 500 MB function bundle), but Vercel serves the **download bridge** at `/api/download` which 302s to GitHub Releases. That route is already in `src/app/api/download/route.ts` and explicitly excluded from SW caching check (`if url.pathname.startsWith('/api/download') return`). We will:
- Add `Cache-Control: no-store` to that 302 response (no bloat).
- Document the GH Releases flow in `BUILD.md`.

No Vercel cost for the `.exe`; only the lightweight redirect counts toward 1 M invocations.

---

### Section H — Domains & Trust

**H1. Custom domain path (optional, free)**
Project supports 50 domains free. If you own `dorchester101.org` (or similar), steps in new `docs/DOMAIN-SETUP.md`:
1. Vercel → Settings → Domains → Add → `dorchester101.org` + `www.dorchester101.org`.
2. DNS: `76.223.126.88` A + `cname.vercel-dns.com` CNAME or nameserver delegation — Vercel auto-provisions Let’s Encrypt cert (auto-renew).
3. Toggle “Redirect `dorchester-101.vercel.app` → `dorchester101.org` (308 permanent)” in Vercel Domains UI — collapses duplicate host into one canonical for SEO.
We will add `vercel.json` `redirects` that also handle `www.<apex>` → apex if you add www.

**H2. Favicon + Icons final pass**
Add `public/favicon.ico` (32×32 ICO built from `icon.svg` via sharp) + verify `og.jpg` vs `og.png` deduplicate (keep one, redirect other with 308).

---

### Section I — Optional free extras (decide yes/no)

| Extra | Free quota | What it adds | Cost/risk |
|-------|-----------|--------------|-----------|
| **Vercel Blob** (image/report host) | 1 GB store, 10 GB transfer [2](https://temps.sh/blog/vercel-pricing-complete-guide-2026) | Host PDFs/reports without GH releases | Tiny; we’ll leave hook but not migrate images |
| **Edge Config** (feature flag) | 100 K reads [1](https://vercel.com/docs/plans/hobby) | `emergencyBanner` kill-switch in <10 ms edge read | **Yes — 1 flag, trivial code** |
| **Vercel Cron `health` ping** (hourly) | Within function quota | Proves uptime; feeds future `api/health` history | Yes — `vercel.json` already plans it |
| **Workflow events / Queues** | 50 K workflow events/mo | For future news ingestion queue | **No — not needed** |
| **KV / Postgres** | Tiny free | Replacing in-memory `globalCache` with persistent store | **No — static JSON architecture is already faster & cheaper** |

---

## 4) Implementation Checklist (file-by-file — what changes, what stays)

### Will be created (new files)
| File | Purpose | Free feature |
|------|---------|--------------|
| `vercel.json` | Headers, redirects, rewrites, cleanUrls, crons | CDN, cron, HSTS, redirects |
| `middleware.ts` | Edge utm-strip + vary + noindex for /api | Edge Middleware |
| `src/app/api/cron/refresh/route.ts` | Daily warm-cache cron (auth-guarded) | Cron |
| `src/lib/jsonLd.ts` | Helpers: breadcrumb, FAQ, Dataset, Place schemas | SEO structured data |
| `public/llms.txt` | AI crawler policy + sitemap pointer | SEO |
| `public/security.txt` | RFC 9116 contact + expiry | Trust |
| `public/humans.txt` | Human credits | Trust |
| `public/favicon.ico` | Legacy favicon | PWA/SEO |
| `public/screenshots/*` or ref existing hero | PWA `manifest.screenshots` | PWA |
| `docs/SEARCH-SETUP.md` | Step-by-step GSC/Bing verification | SEO |
| `docs/DOMAIN-SETUP.md` | Custom domain + redirect plan | Domains |
| `src/app/opengraph-image.tsx` | File-based OG image (edge-cached) | Image Opt + OG |
| `src/app/twitter-image.tsx` | Twitter card variant | OG |

### Will be modified (edits, not rewrites)
| File | Edit |
|------|------|
| `package.json` | Add `@vercel/analytics` + `@vercel/speed-insights` |
| `src/app/layout.tsx` | Add `<Analytics/>` + `<SpeedInsights/>`; emit `verification` meta when env vars set; inject breadcrumb JSON-LD script |
| `next.config.ts` | Add HSTS to `securityHeaders`, tighten prod CSP, add `images.minimumCacheTTL`, explicit `headers()` for extra routes |
| `src/app/sitemap.ts` | Add `images` for home, confirm `lastModified` for `/resources` uses `lastReviewedOn()` |
| `src/app/robots.ts` | Add comment re preview noindex; keep Disallow |
| `.env.example` | Add `NEXT_PUBLIC_SITE_URL`, `CENSUS_API_KEY`, `CRON_SECRET`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` placeholders with comments |
| `src/app/*/page.tsx` (12 pages) | Add `export const metadata = { title, description, alternates:{canonical}, openGraph }` unique per page |
| `src/app/api/*/route.ts` (8 routes) | Normalize `Cache-Control` / `Vercel-CDN-Cache-Control` headers |
| `public/sw.js` | Bump `VERSION` to `v4.3.0`, add `/faq` to `SHELL_URLS`, re-trim |
| `public/manifest.json` | Add `screenshots`, verify `shortcuts` already good, set `prefer_related_applications:false` already |
| `.github/workflows/ci-cd.yml` | Add note re Git integration vs. manual deploy; keep “skip if no secrets” logic |

### Will NOT be changed (no risk)
- Any `src/data/*.ts` datasets (resources, transit, feeds, hud, census snapshot) — all verified on 2026-10-04.
- `src/app/globals.css` tokens / theming system.
- `electron/` build pipeline (`BUILD.md`, `release/`).
- `src/i18n/` locales + `scripts/i18n-add.py`.
- Database drizzle config (optional Postgres path stays optional).

### Verification after deploy (proof it’s working)
1. `curl -sI https://dorchester-101.vercel.app/` → `200`, `cache-control: public, max-age=0, must-revalidate`, `strict-transport-security: max-age=63072000`, **no** `x-robots-tag` (prod is crawlable).
2. `curl -sI https://dorchester-101-<hash>-team-tung-tung-yaya.vercel.app/` (any preview) → `200` + `x-robots-tag: noindex` (Vercel auto-sets — proves previews won’t count as duplicate content) [4](https://swapbiswas.com/blog/vercel-google-indexing/).
3. `curl -s https://dorchester-101.vercel.app/sitemap.xml` → 16 URLs, all `https://dorchester-101.vercel.app/...` (no localhost), `lastmod` ≤ 2026-10-04 for dir pages, now for hourly pages.
4. `curl -s https://dorchester-101.vercel.app/robots.txt` → `Allow:/`, `Disallow:/api/`, `Sitemap:https://dorchester-101.vercel.app/sitemap.xml`, no `Disallow:/`.
5. `curl -s https://dorchester-101.vercel.app/api/health | jq` → `status: ok|degraded` + 6 checks.
6. Vercel Dashboard → Analytics → events streaming; Speed Insights → Lighthouse scores per page.
7. `site:dorchester-101.vercel.app` in Google after GSC submit → indexed within days.

---

## 5) Limits & Non-Goals (so we don’t mislead)

- **Hobby is personal/non-commercial only** per Vercel Fair Use Guidelines [13](https://zplatform.ai/guides/is-vercel-free/) — DOR101 as open-source community info site qualifies as personal/educational, but if it ever carries ads or paid placement you must move to Pro ($20/seat) — we’ll note this in `docs/LEGAL-NOTE.md` short.
- **No SLA, 1-hr log retention, 1 daily cron on Hobby** — we won’t design around enterprise SLAs.
- **Commercial use flag:** We do **not** enable Password Protection, multi-region, team seats, or paid WAF — those are Pro. Everything above stays inside Hobby caps.
- **We will not invent a custom domain** — if you don’t provide one, the production `vercel.app` URL is the canonical (already valid for Google [3](https://stackoverflow.com/questions/77029501/vercel-deploying-something-vercel-app-searchable-on-google)). A custom domain is documented but not forced.
- **No secret ever hard-coded** — verification tokens and `CRON_SECRET` live only in Vercel Environment Variables UI (Production/Preview/Development scopes).

---

## 6) Timeline & Phases (what I will do in order once you approve)

**Phase 1 — Make it indexable (same-day)**
1. Add `@vercel/analytics` + `@vercel/speed-insights` to `package.json` & `package-lock.json`.
2. Edit `src/app/layout.tsx` (Analytics/SpeedInsights + verification meta + JSON-LD helper).
3. Create `vercel.json` with HSTS/headers/redirects/crons.
4. Create `middleware.ts`.
5. Edit 12 `page.tsx` files to export unique `metadata`.
6. Edit 8 `api/**/route.ts` files to normalize cache headers.
7. Set `NEXT_PUBLIC_SITE_URL` (and optionally `CENSUS_API_KEY`, `CRON_SECRET`) in Vercel via API.

**Phase 2 — Enhance discoverability + trust (next commit)**
8. Add `llms.txt`, `security.txt`, `humans.txt`, `favicon.ico`, `opengraph-image.tsx`.
9. Add `src/lib/jsonLd.ts` + wire into each page.
10. Add `src/app/api/cron/refresh/route.ts`.
11. Add `docs/SEARCH-SETUP.md` + `docs/DOMAIN-SETUP.md`.
12. Bump `sw.js` VERSION, update `manifest.json` screenshots.

**Phase 3 — Verify live**
13. Push branch `arena/93c56870-dorchester-101` → Vercel creates preview deploy.
14. If green, open PR to `main` → Vercel auto-promotes preview to production as `dorchester-101.vercel.app`.
15. Run the curl checklist above + show screenshots of GSC verification start.
16. Enable WAF 3 rules in Vercel UI (manual click — I’ll guide).

All phases together are **~25 files, no dataset changes, no DB migration, no breaking API change**, and build time stays < 2 min on Hobby’s 2-vCPU builder.

---

## 7) Approvals Needed

I will not push any of Phase 1 until you confirm:

- **A)** You’re OK with canonical = `https://dorchester-101.vercel.app` until you provide a custom domain (recommended but optional).
- **B)** You want both Web Analytics **and** Speed Insights (they add ~4 KB client JS — free and privacy-friendly).
- **C)** You want the cron at `0 9 * * *` (daily cache warm) — or *no cron* if you prefer 0 background invocations.
- **D)** Whether to proceed with all files in one PR or phase-by-phase (recommended: Phase 1 as one PR, Phase 2 as a follow-up).

Reply **“Approve Phase 1 + 2”** (or pick sections) and I will implement immediately on `arena/93c56870-dorchester-101`, push, and open the PR.

---

### Sources & Further Reading
- Vercel Hobby plan limits & included features [1](https://vercel.com/docs/plans/hobby)
- Vercel Pricing 2026 full table (100 GB, 1 M requests caps) [2](https://temps.sh/blog/vercel-pricing-complete-guide-2026)
- Next.js 16 on Vercel deployment + image/caching guidance [3](https://raymartin.es/en/blog/nextjs-vercel-deployment)
- Vercel Google Indexing: preview noindex behavior [4](https://swapbiswas.com/blog/vercel-google-indexing/)
- Hobby vs Pro cron (100 crons, 1/day) [5](https://musayilmaz.dev/en/blog/vercel-free-tier-production)
- Vercel CDN cache headers & `Vercel-CDN-Cache-Control` split [4](https://vercel.com/docs/caching/cdn-cache)
- Hobby commercial-use restriction [13](https://zplatform.ai/guides/is-vercel-free/)
- Custom domain searchability on `vercel.app` [3](https://stackoverflow.com/questions/77029501/vercel-deploying-something-vercel-app-searchable-on-google)
