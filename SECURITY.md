# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 4.0.x   | :white_check_mark: |
| 3.x     | :x:                |
| 2.x     | :x:                |
| 1.0.x   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in DOR101, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, use one of:

- **GitHub Security Advisory** (preferred): open a private advisory under
  **Security → Report a vulnerability** on the repository.
- **Email**: **security@dor101.org** (PGP not currently published).

We will acknowledge your report within 48 hours and provide a detailed response within 5 business days. Please include the affected version, the URL or route involved, and a minimal reproduction if possible. We do not pay bounties, but we will credit you in the release notes (unless you prefer not to be named).

## Security Design Principles

DOR101 is designed with the following security principles:

1. **No PII Collection**: The application never collects, stores, or transmits personally identifiable information.
2. **No Authentication Required**: No user accounts, no passwords, no session tokens.
3. **Local Storage Only**: User preferences (language, theme, font size) are stored in browser localStorage only.
4. **No External Telemetry**: No analytics, tracking pixels, or third-party scripts that could fingerprint users.
5. **Public Data Only**: Server-side fetches go to public government and publisher feeds (MBTA GTFS-realtime, HUD workbooks, Census/FRED, publisher RSS). No private or commercial API data is used.
6. **Keys Stay Server-Side**: Optional API keys (`MBTA_API_KEY`, `CENSUS_API_KEY`, `HUD_API_KEY`) are read from environment variables on the server; the browser never receives them, and no key is required for the site to function.
7. **URL Parametrisation**: RSS added in Settings is restricted to `http(s)` URLs, and upstream HTML is stripped server-side before any excerpt is rendered.
8. **Content Security Policy**: `script-src 'self'`, `img-src 'self'` plus the explicit tile hosts, `connect-src 'self'`, no third-party frames (`frame-ancestors 'self'` in production builds).
9. **Input Validation**: All API query parameters are validated with Zod schemas before use.
10. **HTTPS Only**: All external API calls use HTTPS exclusively.
11. **Dependency Auditing**: `npm audit` is run in CI and on release; dependencies are pinned and lockfile-hash verified.
12. **Trusted Sources Only**: A news feed or data source is only enabled after a live fetch returns real content; broken or empty feeds are removed rather than left configured.

## Threats the app is *not* designed to resist

- It is a static, read-only community resource: it holds no accounts and no personal data, so it is not a target for credential theft.
- Browser-side calculators (rent burden, AMI) run entirely client-side and are convenience tools, not legal determinations.
- The service worker caches the app shell for offline use; it never caches form input or location.
