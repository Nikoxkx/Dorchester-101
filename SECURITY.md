# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |

## Reporting a Vulnerability

DOR101 is a public-information desk. If you find a security issue, report it
privately — **do not open a public GitHub issue** for vulnerabilities.

Use GitHub's private vulnerability reporting on this repository:

https://github.com/Nikoxkx/Dorchester-101/security/advisories/new

We aim to acknowledge reports within 48 hours and respond with a plan within
5 business days.

## Security design principles

1. **No PII collection** — the app never collects, stores, or transmits personally identifiable information.
2. **No accounts** — no passwords, sessions, or tokens.
3. **Local storage only** — preferences (language, theme, font size, bookmarks) stay in the browser.
4. **No telemetry** — no analytics, tracking pixels, or third-party scripts.
5. **Public data only** — API routes proxy public government and news sources.
6. **No API keys in the client** — nothing secret ships to the browser.
7. **Input validation** — user-supplied numbers and search text are validated before use.
8. **HTTPS everywhere** — all outbound calls use HTTPS.
9. **Dependency auditing** — `npm audit` is part of the maintenance loop.
