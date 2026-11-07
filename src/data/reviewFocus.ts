/**
 * Editor-facing follow-up for records with unresolved facts. These notes are
 * not promises to residents and do not turn a source check into verification.
 * Remove an entry only after checking every published field and translation.
 */
export const REVIEW_FOCUS: Readonly<Record<string, string>> = {
  'bha': 'BHA pages conflict: confirm whether the visitor needs the 52 Chauncy Housing Service Center or 56 Chauncy main office and which hours apply; verify current waitlists and exceptions.',
  'codman-square-health': 'Confirm department-specific hours and services, the separate 450 Washington Street site, insurance enrollment and step-free physical access; current pages do not resolve every clinic detail.',
  'raft-mass': 'Mass.gov publishes a current benefit cap and eligibility rules; confirm applicant-specific eligibility, covered costs, appointment options and accessible help with EOHLC or Metro Housing.',
  'gbLS-dorchester': 'The current locations page lists office, phone-intake, housing-hotline and walk-in windows; confirm case-specific intake and step-free access with GBLS.',
  'dotbdc': 'Contact pages confirm the address, phone and walk-in/appointment days; current youth-workforce and technology offerings and office access remain unconfirmed.',
  'fields-corner-main-street': 'Current contact and business pages confirm the address, phone and small-business support but publish no public hours; verify appointment availability and second-floor access.',
  'grove-hall-library': 'The current BPL page confirms regular hours and listed closures; confirm branch accessibility and live availability or cost of device lending, conversation/citizenship groups and printing.',
  'college-bound-dorchester': 'Uncornered’s current contact page offers email and a form but no visitor hours; official pages list conflicting addresses (218 Adams Street/PO Box 220605 and 222 Bowdoin Street). Confirm program eligibility and service location by contact.',
  'columbia-savin-hill-civic': 'The current site says meetings are monthly, usually the first Monday except summer recess and holidays, with minutes through June 2026; confirm the next date/location, current contact and accessibility.',
  'uphams-corner-health': 'Confirm department locations and hours, WIC service mode, urgent-care availability, insurance enrollment and physical access; some online service-mode notes may be stale.',
  'hcfa-helpline': 'The official HelpLine page confirms 1-800-272-4232, insurance support/referrals and supported languages, but publishes no operating hours; confirm hours directly.',
  'fair-foods-lena-park': 'Fair Foods’ site list, last updated September 6, 2026, gives Lena Park Tuesdays 2–4 PM in fall–spring; confirm seasonal availability, exact price and site access. Its program page says no eligibility, registration or ID checks.',
  'vietaid': 'The current site confirms the address and main phone; confirm senior-day schedule, program availability, eligibility, costs, office hours and physical access.',
  'st-mark-esol': 'Official pages confirm free adult English classes and Fall 2026 citizenship registration; confirm each class schedule, prerequisites, site, fees/materials and accessibility.',
  'city-life-vida-urbana': 'The official homepage lists Jamaica Plain Tuesday and East Boston Wednesday meetings, but some schedule pages are old; confirm the next meeting, interpretation, venue and access.',
  'dorchester-food-coop': 'Current pages confirm the address, phone, regular hours, public access and SNAP/EBT; holiday hours differ. Confirm step-free entry; WIC is not listed on current official pages.',
  'cpcs-boston': 'The official directory confirms 75 Federal Street, 6th Floor and 617-482-6212; it does not publish public intake hours. Confirm appointment/use and accessibility.',
  'work-inc-dorchester': 'Current location/contact pages confirm the address and phone; most Family Support services require DDS eligibility. Confirm office hours, employment-program eligibility and accessibility.',
  'codman-square-community-market': 'The Community Market page lists Tue 8–1, Wed 2–7 and Thu 8–1; a separate food-resources page lists a Tue 8–11 pantry at the same address. Confirm whether these are separate services, visit rules and access.',
  'metro-housing-boston': 'The current contact page distinguishes Resource Line (Mon–Thu 9–1), lobby (9–3), appointments and Monday walk-ins until capacity; confirm live capacity and physical access before visiting.',
  'metrolist-boston': 'Metrolist is an online listing/digest tool and property managers handle applications. The 26 Court Street/617-635-3880 hours are separate Mayor’s Office contact information; verify online links and partner referrals, not walk-in service.',
  'somali-development-center': 'Official pages list the 10 Malcolm X Boulevard second-floor office and service contacts 617-522-0700/617-938-7573; confirm which number covers each service, current hours, program availability and second-floor access.',
  'yawkey-center-adult-ed': 'Current Catholic Charities pages confirm ESOL for ages 18+, day/evening classes, GED/ABE for ages 16+ with intermediate English, and weekday pantry hours 10–12 and 1–2; confirm enrollment schedules and entrance.',
  'abcd-esol': 'The current ESOL page confirms three free class levels for eligible Massachusetts residents and lists ABCD Central at 19 Temple Place with enrollment contact 508-203-7670, plus other sites; confirm the current class location and enrollment.',
  'abcd-dorchester-nsc': 'Confirm center and clothing-program hours, enrollment, partner referral criteria and current stock with ABCD.',
  'cradles-to-crayons': 'Confirm current age/income rules and partner referral process; the Giving Factory is not a direct family pickup site.',
  'st-francis-house': 'Confirm current Fresh Threads clothing access, stock and hours, separate from day-shelter hours.',
  'womens-lunch-place': 'Confirm shelter hours, eligibility, clothing access and whether coats are currently in stock.',
  'rosies-place': 'Confirm current advocacy hours and whether staff can make clothing referrals; on-site clothing is unconfirmed.',
  'yawkey-basic-needs': 'Confirm whether the Basic Needs team offers clothing or referrals and its current hours; do not represent this as a verified coat pickup.',
  'kroc-center': 'Confirm assistance boundaries, appointment and seasonal registration rules, and whether clothing is available.',
  'coats4vets': 'Confirm the next coat event, eligibility and pickup details; empowerment-center appointment rules may differ from events.',
};
