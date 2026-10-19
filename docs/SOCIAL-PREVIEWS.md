# Screenshot-led social previews

The site shares a **1200 × 630 JPEG** (about 120 KB) featuring a real homepage
screenshot, the site's own fonts, navy/cream branding and a concise promise.
No image generator, external font service, live API or browser is needed when a
social crawler requests it. The screenshot is an editorial capture, not a live
view of today's date, hours, weather or availability.

## Files and metadata

- `public/social/homepage.png`: original 1440 × 800 browser capture.
- `public/social/dorchester-101-<hash>.jpg`: finished social card.
- `src/lib/social-image.json`: image path, dimensions, MIME type and alt text.
- `src/lib/social.ts`: shared Open Graph / X (Twitter) metadata builder.
- `scripts/lib/social-card.html`: card layout, using bundled Fontsource fonts.
- `scripts/refresh-social-preview.mjs`: capture and composition script.

Every public page that declares social metadata calls `socialMetadata(...)`.
Next.js **replaces**, rather than deep-merges, nested metadata, so each section
must supply the image and Twitter fields as well as its own title and description.
The homepage defaults live in the helper. Both image URLs are absolute and use
`NEXT_PUBLIC_SITE_URL` (default: `https://dorchester-101.vercel.app`), never a
visitor's host header or a local capture URL. Sections intentionally use the
same **homepage** card; the alt text accurately identifies it as such.

There are no `opengraph-image.tsx` / `twitter-image.tsx` files competing with the
explicit metadata. Old `/opengraph-image`, `/twitter-image` and `/api/og` URLs
redirect to the static card for compatibility; old API title/description query
parameters no longer personalize the image. The sitemap also uses the static
image, outside the robots-blocked `/api/` tree. Existing `public/og.png` and
`public/og.jpg` remain available for legacy consumers but aren't advertised in
metadata.

## Refresh after a visual redesign

```sh
npm ci
npx playwright install --with-deps chromium
npm run build
npm run start -- --hostname 0.0.0.0
# In a second terminal:
npm run refresh:social
```

For a different server or production domain:

```sh
SOCIAL_CAPTURE_URL=http://localhost:3000 \
NEXT_PUBLIC_SITE_URL=https://your-production-domain.example \
npm run refresh:social
```

`SOCIAL_CAPTURE_URL` chooses the running site to photograph.
`NEXT_PUBLIC_SITE_URL` controls the domain printed on the card and must match
the deployment's setting. A development server also works; the script hides
only Next's developer overlay, not application content. An optional
`CHROMIUM_EXECUTABLE_PATH` supports a preinstalled browser;
`CHROMIUM_NO_SANDBOX=1` is for sandboxed CI environments that require it, not
normal desktop use.

The script opens a fresh light-mode, English browser context, dismisses the real
privacy notice through its button, waits for the hero photo/fonts/animations,
and screenshots the actual page. It does not inject fake resources, weather,
counts or mock interface elements. The screenshot is then placed in a decorative
browser frame. It generates the card and updates the manifest; **rebuild/restart
the app after refreshing**, since metadata and legacy redirects use that manifest.
Review both images before shipping. Update the capture date in
`public/IMAGE-CREDITS.md` when recapturing. The photograph's attribution and
CC BY-SA 3.0 licence travel with the screenshot/card.

The JPEG filename contains a content hash and is served with immutable caching.
Keep previously deployed hashed JPEGs when refreshing so older cached posts
continue to load. Do not overwrite a deployed hashed filename with new bytes.
The original screenshot is not served with immutable caching.

## Checks

```sh
npm run typecheck
npx vitest run src/__tests__/social.test.ts
npm run build
# The Playwright config starts the production app if no server is running:
npx playwright test e2e/social-preview.spec.ts --project=chromium --workers=2
```

The crawler tests fetch HTML without JavaScript and verify one image per
platform, matching section titles/descriptions, canonical URLs, dimensions,
alt text, public image access, and legacy redirects. The image test checks
actual JPEG dimensions, the size budget and the filename hash.

## Deploy and refresh platform caches

1. Deploy the branch through the normal production workflow. Local changes alone
   don't update previews of the live URL. Ensure the production deployment is
   publicly accessible; Vercel preview protection blocks social crawlers.
2. Confirm `NEXT_PUBLIC_SITE_URL` names the final public HTTPS origin, not a
   temporary deployment URL. Rebuild if it changes; recapture to update the
   domain printed in the artwork.
3. Inspect page source on `/`, `/food` and another section. The `og:image` and
   `twitter:image` should be the same absolute `/social/...jpg` URL, which must
   return HTTP 200 and `image/jpeg` without authentication.
4. Use [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   and [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) to
   request a new scrape. Other apps may require a newly sent message/link or time
   for their cache to expire. Already-sent cards may never update in place.

Open Graph and `summary_large_image` improve previews on supporting platforms,
but no site can force a platform to show a card or choose its crop. Some apps
use small square thumbnails; some placements (including many Instagram captions)
do not unfurl ordinary URLs at all. This change does not claim identical display
on every social surface.
