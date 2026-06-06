# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in DOR101, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email: **security@dor101.org**

We will acknowledge your report within 48 hours and provide a detailed response within 5 business days.

## Security Design Principles

DOR101 is designed with the following security principles:

1. **No PII Collection**: The application never collects, stores, or transmits personally identifiable information.
2. **No Authentication Required**: No user accounts, no passwords, no session tokens.
3. **Local Storage Only**: User preferences (language, theme, font size) are stored in browser localStorage only.
4. **No External Telemetry**: No analytics, tracking pixels, or third-party scripts that could fingerprint users.
5. **Public Data Only**: All API endpoints fetch exclusively from public government data sources.
6. **No API Keys in Client Code**: Any API keys are kept server-side in environment variables.
7. **Content Security**: No use of `dangerouslySetInnerHTML` without sanitization, no `eval()`, no dynamic code execution.
8. **Input Validation**: All user inputs are validated and sanitized before use.
9. **HTTPS Only**: All external API calls use HTTPS exclusively.
10. **Dependency Auditing**: Regular `npm audit` scans to identify and fix vulnerable dependencies.
