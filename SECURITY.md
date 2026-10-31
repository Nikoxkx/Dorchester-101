# Security policy

## Reporting a vulnerability

**Do not put sensitive vulnerability details or private information in a public GitHub issue.** The project owner should enable GitHub's private vulnerability reporting in the repository settings and provide a verified private contact. Private reporting is not currently enabled on the repository, and this project has no confirmed security mailbox in its configuration. Do not assume an unverified address is monitored.

Once the owner enables private reporting, use the repository's **Security → Report a vulnerability** flow. Public issues are suitable only for non-sensitive bugs and corrections. There is currently no guaranteed response time or bounty program.

## Dependency monitoring and known tooling risk

`npm audit --omit=dev` currently reports no known production advisories (checked 2026-10-31). The full development install still reports moderate minimatch advisories inherited through ESLint and electron-builder: upstream packages use incompatible legacy and current APIs and fixed, compatible releases are not yet available for all of them. These are development/build tools, not dependencies used by the deployed web server. Run linting and desktop builds only on trusted repository code and trusted glob patterns; do not accept untrusted patterns or archives into build jobs. Dependabot checks for updates weekly, and CI fails on any moderate-or-higher production finding or high-or-higher finding in the full install. Re-run `npm audit` when updating: advisory status can change at any time. Do not force an incompatible minimatch major version merely to make the audit appear clean.

The remaining minimatch work is tracked in [issue #27](https://github.com/Nikoxkx/Dorchester-101/issues/27). The desktop toolchain was updated across major versions and requires a real Windows installer and application smoke test before a new desktop release. The website test suite cannot certify the packaged executable.

## Current boundaries

- No account is required. Preferences and some drafts are stored on the device, but hosting providers and third-party services can still process requests and network information.
- Vercel Analytics and Speed Insights are optional and gated by a visitor's choice; verify actual behaviour in the deployed environment. Maps may fetch tiles from third parties, directions open external services, and a weather fallback can contact NWS or Open-Meteo from the browser.
- Optional translation of public news excerpts is disabled by default; an operator who enables it must configure credentials and review its privacy, pricing and security implications.
- Server-side API keys must not be placed in client-exposed variables or committed to the repository. The scheduled refresh requires a server-only `CRON_SECRET` and fails closed if it is not configured.
- A service worker can cache application pages and site assets. The current worker bypasses API and query-string requests and removes old live caches; visitors may still need browser site-data controls to clear all stored data.
- Security headers and browser permissions reduce some risks but do not prove the application is secure, private, or compliant with any particular law. Dependencies and provider integrations need regular review and updates.

The site provides informational content, not a professional, legal or medical service. Consult the draft privacy notice for more details and verify important information with the underlying provider.
