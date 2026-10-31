# Data review and maintenance

The scheduled `Freshness review` workflow is an **editorial queue**, not an automatic fact checker. Once this branch is merged into the default branch, it runs on Mondays and can update a GitHub issue if Actions has permission to write issues. It also saves the full report as an artifact. It does not update hours, eligibility, legal advice, waitlists or translations, and a successful HTTP response means only that a page responded.

For each flagged entry:

1. Read the specific follow-up in the report. Contact the provider if its current hours, accessibility, eligibility, services, address or other claims cannot be confirmed from a current primary source. Confirm whether the address is actually a walk-in destination; a geocoded street address is not proof of an entrance.
2. If a field is unknown or sources conflict, remove the unsupported claim or leave it explicitly qualified, with `needs-review`. Do not mark a listing `verified` just to clear a queue.
3. Record the actual date and source checked in the record. A review date is not a guarantee of present availability. Recheck the meaning and numbers of all affected translations and run the relevant coverage/change-detection tests.
4. Review the report again after editing: `npx tsx scripts/audit-freshness.ts --offline`. The online version also checks source reachability but may be inconclusive when a provider blocks automated requests.

## Source review recorded 2026-10-31

- **Housing Navigator Massachusetts:** its [help center](https://housingnavigatorma.org/resources/help-center/) describes searching income-restricted rentals, rent and eligibility information, accessible-unit filters, and contacting properties for missing details. Its [search](https://search.housingnavigatorma.org/) shows property contacts and application links when available; [Candid](https://www.guidestar.org/profile/84-3542325) describes a free statewide tool. The resource is an online search, not a walk-in location; listings and eligibility must still be confirmed with each property. Its listing status was changed to `verified` for this source review, not to imply that every rental listing was checked.
- **Metrolist:** the [city page](https://www.boston.gov/metrolist) confirms the income-restricted search, weekly email and exclusion of public/subsidized housing. Office access and exceptions still need direct confirmation, so the warning remains.
- **Dorchester Bay EDC:** its [contact page](https://www.dbedc.org/contact-us/) lists 594 Columbia Road, Suite 302, the phone number, Tuesday–Thursday walk-ins and Monday/Friday appointments; its [program page](https://www.dbedc.org/resident-community-engagement/) describes technology, workforce and youth work. Availability of individual programs and office access still need confirmation.
- **Fields Corner Main Street:** its [business directory](https://www.fieldscorner.org/shop) lists 1444 Dorchester Avenue, second floor, and 617-474-1432. Confirm current program availability, visiting arrangements and access before removing its warning.

The full current queue is generated rather than copied here, so this document cannot silently become a substitute for current provider information.
