# Operator launch checklist

This is preparation for the site operator and qualified counsel, **not legal advice or a legal/compliance certification**. The public privacy notice and terms remain labelled drafts until counsel and the operator approve them for the actual deployment and audiences.

## Owner and contacts

- [ ] Identify the legal operator, jurisdiction and a monitored contact for privacy requests, corrections and accessibility. Configure a real contact only after it has been established; public GitHub issues are not a confidential channel.
- [ ] In repository Settings → Code security, enable **private vulnerability reporting**. The current GitHub integration could not change this setting. Add and verify an appropriate private contact if needed; never ask reporters to post sensitive details publicly.
- [ ] Decide who responds to requests, security reports and incidents, and document escalation and response procedures.

## Privacy, third parties and consent

- [ ] Counsel and the operator: compare `/privacy`, `/terms` and the consent notice against the real deployment, applicable requirements and provider agreements. Review data minimization, retention/deletion, sharing, user rights, children and accessibility as applicable. Do not remove the draft notice without approval.
- [ ] Inventory actual processing by the host and any enabled services. The application stores preferences, privacy choice, weather cache, read notification IDs and report drafts on the device; service workers can store site pages, assets and map tiles. Network services may process IP addresses, request metadata and logs. Verify actual host retention and processing rather than assuming the application controls it.
- [ ] In a deployed browser, inspect network requests before a choice, after declining, after allowing, and after withdrawing or changing the choice in another tab. Vercel Analytics and Speed Insights should load only after opt-in; validate current vendor behavior because unmounting does not erase a script already loaded. Query strings and fragments are filtered from app-sent analytics events.
- [ ] Review map-tile, directions, weather fallback, RSS, image, hosting and other provider terms and attribution. Browser weather fallbacks and directions can contact third parties; custom feeds are visited by the server. Confirm these uses match the notice and providers' current terms.
- [ ] Before enabling Lara, review publisher and provider terms, privacy and pricing, set a provider-side spending cap, configure server-only credentials and check machine-translation quality. Only built-in public news excerpts are eligible; the local budget is per server instance, not an account-wide billing limit. Never put keys in `NEXT_PUBLIC_*` variables, source code, chat or screenshots.

## Data quality and releases

- [ ] Work through the linked [freshness review issue](https://github.com/Nikoxkx/Dorchester-101/issues/26) and the review procedure in [DATA-REVIEW.md](DATA-REVIEW.md). Confirm uncertain facts with original providers; do not advance dates automatically.
- [ ] Have qualified reviewers assess legal, housing, benefits, health and severe-weather wording. Automated tests and numeric checks cannot establish correctness or enforceability.
- [ ] Merge and deploy only after tests and required approvals. Set the production-only `CRON_SECRET` in Vercel through its private dashboard, redeploy, then check that the scheduled request runs and review degraded results. It checks live endpoints; it does not verify or rewrite static facts.
- [ ] Verify actual production consent traffic, third-party links, security headers and the freshness workflow after deployment. Build and exercise a real Windows installer before publishing a desktop release; the repository's staging check does not test an Electron window or installer.
