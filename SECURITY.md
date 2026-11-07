# Security policy

## Reporting a vulnerability

**Do not put sensitive vulnerability details or private information in a public GitHub issue.** The project owner should enable GitHub's private vulnerability reporting in the repository settings and provide a verified private contact. Private reporting is not currently enabled on the repository, and this project has no confirmed security mailbox in its configuration. Do not assume an unverified address is monitored.

Once the owner enables private reporting, use the repository's **Security → Report a vulnerability** flow. Public issues are suitable only for non-sensitive bugs and corrections. There is currently no guaranteed response time or bounty program.

## Dependency monitoring and known tooling risk

On 2026-11-06, both `npm audit` and `npm audit --omit=dev` report zero vulnerabilities. The previous full audit's 13 moderate findings all came from the `minimatch` advisory GHSA-g3hv-75wg-m249. `package.json` uses a range-qualified override (`minimatch@>=7.0.0 <11.0.1` → `11.0.5`) with the matching lockfile. It targets only advisory-affected nodes; unaffected `minimatch` 3.x and 5.x branches remain on their original versions. The override still supersedes some parents' declared 9/10 ranges, so it is a compatibility trade-off rather than an upstream dependency update. Validation in this working tree passed `npm ci`, lint, typecheck, all 583 tests, the production build, and `npm run verify:desktop` (including the electron-builder file matcher and packaged-server route checks). Re-run both audit commands after dependency changes because advisory status can change. Replace the override with upstream-compatible dependency releases when available, and do not remove it without checking the resulting audit.

These findings were in development/build tools, not dependencies used by the deployed web server. Run linting and desktop builds only on trusted repository code and trusted glob patterns; do not accept untrusted patterns or archives into build jobs. Dependabot checks for updates weekly, and CI fails on any moderate-or-higher production finding or high-or-higher finding in the full install. The remaining minimatch work is tracked in [issue #27](https://github.com/Nikoxkx/Dorchester-101/issues/27). A real Windows installer and application smoke test is still required before a new desktop release; the website test suite and package verification cannot certify the Windows executable itself.

## Current boundaries

- No account is required. Preferences and some drafts are stored on the device, but hosting providers and third-party services can still process requests and network information.
- Vercel Analytics and Speed Insights are optional and gated by a visitor's choice; verify actual behaviour in the deployed environment. Maps may fetch tiles from third parties, directions open external services, and a weather fallback can contact NWS or Open-Meteo from the browser.
- Optional translation of public news excerpts is disabled by default; an operator who enables it must configure credentials and review its privacy, pricing and security implications.
- Server-side API keys must not be placed in client-exposed variables or committed to the repository. The scheduled refresh requires a server-only `CRON_SECRET` and fails closed if it is not configured.
- A service worker can cache application pages and site assets. The current worker bypasses API and query-string requests and removes old live caches; visitors may still need browser site-data controls to clear all stored data.
- Security headers and browser permissions reduce some risks but do not prove the application is secure, private, or compliant with any particular law. Dependencies and provider integrations need regular review and updates.

The site provides informational content, not a professional, legal or medical service. Consult the draft privacy notice for more details and verify important information with the underlying provider.
