# Custom Domain Setup — Move from dorchester-101.vercel.app to your own domain (optional)

You do **not** need a custom domain for Google indexing — `*.vercel.app` is indexable [see search docs]. But a branded apex (`dorchester101.org`) outranks it and gives you stable canonicals if you ever move off Vercel.

All of this is **free on Hobby**: up to 50 custom domains per project, auto-provisioned Let's Encrypt certs, auto-renew [Vercel Hobby docs].

## 1) Buy a domain (if you don't have one)

Recommended registrars: Cloudflare, Namecheap, Porkbun, Google Domains. Any works; cost ~$9–15/yr for `.org`.

Pick one that contains `dorchester` + `101` for exact-match SEO: e.g., `dorchester101.org`, `dor101.org`.

## 2) Add it in Vercel (1 min)

Vercel → **dorchester-101** → **Settings → Domains** → **Add**:

- `dorchester101.org`
- `www.dorchester101.org`

Vercel shows DNS instructions immediately.

## 3) Set DNS (2 min)

Either method:

**Option A — Nameserver (simplest if you're on Cloudflare)**
- Set nameservers to `ns1.vercel-dns.com`, `ns2.vercel-dns.com` (Vercel shows them).
- Vercel handles apex + www automatically.

**Option B — Records (you keep current DNS)**
Add these records where your DNS lives:

| Type | Host | Value |
|------|------|-------|
| `A`  | `@`  | `76.223.126.88` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

Wait ~1–5 min for Vercel's **Verify** button to turn green. Certificate provisions automatically (HTTP → 308 → HTTPS with HSTS we already added).

## 4) Update canonical in Vercel (30 s)

Vercel → **Settings → Environment Variables** → edit:

| Key | New value |
|-----|-----------|
| `NEXT_PUBLIC_SITE_URL` | `https://dorchester101.org` |

Scope: **Production**. Keep Preview still on `https://dorchester-101.vercel.app` (or leave Preview empty — it will then show branch aliases but that's fine for QA).

Redeploy: **Deployments → ⋯ on latest prod → Redeploy**.

## 5) Tell Vercel to redirect the old host (automatic)

Vercel → **Settings → Domains** → click `dorchester-101.vercel.app` → **Redirect to** `https://dorchester101.org` → Enable (permanent 308).

Our `vercel.json` also adds `trailingSlash: false` + `cleanUrls: true` so `/food/` → `/food`, `/index.html` → `/`.

If you used www subdomain, set **Redirect `www.dorchester101.org` → `dorchester101.org` (or vice versa)** — pick one apex and keep it consistent everywhere. Google treats them as distinct hosts until you redirect.

## 6) Re-submit sitemap

In Google Search Console add a second property: `https://dorchester101.org` (URL prefix) → re-do verification (same `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` token works) → re-submit `https://dorchester101.org/sitemap.xml`.

You can keep the old property for 90 days while Google follows the 308s, then remove it.

## 7) Checklist after domain goes live

```bash
curl -sI https://dorchester-101.vercel.app/   # → 308 Location: https://dorchester101.org/
curl -sI https://www.dorchester101.org/food/  # → 308 Location: https://dorchester101.org/food
curl -sI https://dorchester101.org/api/health # → 200 (no redirect, API stays on same host)
curl -s https://dorchester101.org/sitemap.xml | grep dorchester101.org | wc -l # → 16
curl -s https://dorchester101.org/robots.txt | grep Sitemap # → https://dorchester101.org/sitemap.xml
```

Update external links (GitHub repo description, social bios) to the new apex — link equity consolidates faster.

## 8) Cost / limits reminder

- 50 domains/project, 100 deploys/day, 1 concurrent build — all Hobby free.
- Cert auto-provisions + auto-renews; no action needed.
- If you ever need **password-protected previews** that is Pro ($20/mo per protected project) — we kept it off so Hobby stays free.
