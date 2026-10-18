# Search Setup — Make dorchester-101.vercel.app Show Up on Google & Bing

This doc is the **playbook you run once** after the Vercel free-tier changes land (vercel.json + env vars).
It takes ~10 minutes and requires only a Google account (for Search Console) and optionally a Microsoft account (for Bing).

## 0) Prereq: env var is set

Vercel → **dorchester-101** → **Settings → Environment Variables** → confirm:

| Key | Value (example) | Scope |
|-----|-----------------|-------|
| `NEXT_PUBLIC_SITE_URL` | `https://dorchester-101.vercel.app` | Production + Preview |

If this is not set, `sitemap.xml` and canonicals are `http://localhost:3000` and Google discards them.
The `VERCEL-AUDIT-PLAN.md` explains why.

Redeploy after setting it: **Deployments → ⋯ → Redeploy** on the current production deployment.

## 1) Verify the deploy is crawlable (2 min)

Run these from any terminal (replace URL if you add a custom domain):

```bash
# 1. Prod is 200 + no x-robots-tag: noindex
curl -sI https://dorchester-101.vercel.app/ | grep -iE "HTTP|cache-control|strict-transport|robots"

# Expect: HTTP/2 200, no x-robots-tag line, strict-transport-security: max-age=63072000

# 2. Preview is noindex (so it doesn't create duplicate content)
curl -sI https://dorchester-101-git-main-team-tung-tung-yaya.vercel.app/ | grep -i robots

# Expect: x-robots-tag: noindex  (Vercel adds this automatically on previews)

# 3. Sitemap lists 16 URLs on the right host (no localhost)
curl -s https://dorchester-101.vercel.app/sitemap.xml | grep -c "dorchester-101.vercel.app"
# Expect: 16
curl -s https://dorchester-101.vercel.app/sitemap.xml | grep -c "localhost"
# Expect: 0

# 4. robots.txt points at sitemap
curl -s https://dorchester-101.vercel.app/robots.txt
# Expect: Allow: /, Disallow: /api/, Sitemap: https://dorchester-101.vercel.app/sitemap.xml

# 5. Health is OK
curl -s https://dorchester-101.vercel.app/api/health | jq .status
# Expect: ok or degraded (degraded is fine: it means some optional check is missing)
```

If any of the above fail, do not submit to Google yet — open an issue.

## 2) Google Search Console (5 min)

1. Go to https://search.google.com/search-console/welcome
2. **Add property** → choose **URL prefix** → enter `https://dorchester-101.vercel.app`
3. Verify via **HTML tag**: copy the string like `google-site-verification=AbC123...`
   - In Vercel: Settings → Environment Variables → Add:
     - Name: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
     - Value: `AbC123...` (the 43-char token only, without `google-site-verification=` prefix)
     - Scope: Production
   - Redeploy. The meta tag `google-site-verification` now appears in `<head>` on every page.
4. Back in GSC → **Verify**.
5. In the left nav: **Sitemaps** → **Add new sitemap** → enter `https://dorchester-101.vercel.app/sitemap.xml` → **Submit**.
6. **URL Inspection** → paste `https://dorchester-101.vercel.app/` → **Request indexing**. Then check a second page: `/map`, `/food`, `/news`.
7. Wait 1–14 days. GSC → **Coverage / Indexing** shows which URLs are indexed.

## 3) Bing Webmaster Tools (optional, 3 min)

1. https://www.bing.com/webmasters → **Add site** → `https://dorchester-101.vercel.app`
2. Verify via meta tag: copy Bing token → Vercel env `NEXT_PUBLIC_BING_SITE_VERIFICATION` → redeploy.
3. **Sitemaps** → Submit `https://dorchester-101.vercel.app/sitemap.xml`.
4. Bing typically picks up IndexNow automatically if GSC is green; no extra step needed.

## 4) IndexNow (optional push)

If you want near-instant Bing/Yandex push (still free):

1. Generate a key at https://www.indexnow.org/ → download the `a1b2c3.txt` host key.
2. Add it to `public/<key>.txt` in the repo, push, deploy.
3. Set `INDEXNOW_KEY` env var and add a Vercel cron or manual POST:
   ```bash
   curl -X POST https://api.indexnow.org/indexnow \
     -H "Content-Type: application/json; charset=utf-8" \
     -d '{"host":"dorchester-101.vercel.app","key":"YOUR_KEY","urlList":["https://dorchester-101.vercel.app/","https://dorchester-101.vercel.app/map"]}'
   ```

## 5) Check results

- Google: search `site:dorchester-101.vercel.app` (takes days, not minutes).
- Vercel → Analytics → events should start trickling in within hours.
- Vercel → Speed Insights → Core Web Vitals within 24 h after real visits.

## 6) Common gotchas

| Symptom | Cause | Fix |
|---------|-------|-----|
| Sitemap shows `localhost` | `NEXT_PUBLIC_SITE_URL` not set | Add it in Vercel env, redeploy |
| Preview URL shows `200` with no `noindex` | On custom domain, previews lose auto-noindex | Don't add custom domains to non-prod branches |
| GSC says "Blocked by robots.txt" | sitemap contains `/api/*` | Our sitemap only lists `PUBLIC_ROUTES`, so impossible unless you edited `src/lib/site.ts` |
| No impressions after a week | Pages have `noindex` meta | Check `src/app/layout.tsx` robots → `index:true`; confirm no preview header leaked |
