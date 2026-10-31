/**
 * Editor-facing follow-up for records with unresolved facts. These notes are
 * not promises to residents and do not turn a source check into verification.
 * Remove an entry only after checking every published field and translation.
 */
export const REVIEW_FOCUS: Readonly<Record<string, string>> = {
  'bha': 'Confirm the current waitlists, exceptions, temporary office arrangements, service-center hours and available languages with BHA.',
  'codman-square-health': 'Confirm department-specific hours, care and enrollment services, and step-free access with the health center.',
  'raft-mass': 'Confirm current program caps, eligibility, covered costs and where applicants can receive accessible help with Mass.gov and Metro Housing.',
  'gbLS-dorchester': 'Confirm both telephone intake schedules, offered services, language assistance and office accessibility with GBLS.',
  'dotbdc': 'Confirm that the listed youth workforce and technology programs are currently available and verify access to the office.',
  'fields-corner-main-street': 'Confirm current business programs, appointment hours and access to the second-floor office.',
  'grove-hall-library': 'Confirm regular and exceptional opening hours, accessibility and the current availability and cost of the listed services.',
  'college-bound-dorchester': 'Confirm current participation criteria, support services and whether any address is a visitor site; use the published contact form.',
  'columbia-savin-hill-civic': 'Confirm the contact phone, current meeting locations and dates directly with the association.',
  'uphams-corner-health': 'Confirm department locations, hours, insurance enrollment, urgent care and physical accessibility directly with the health center.',
  'hcfa-helpline': 'Confirm HelpLine hours, supported languages and the proper referral path with Health Care For All.',
  'fair-foods-lena-park': 'Codman and older Lena Park information may differ: call the host to confirm distribution days, price, accessibility and requirements.',
  'vietaid': 'Confirm program availability, enrollment, costs, office hours and accessibility with VietAID; distinguish other organizations in the building.',
  'st-mark-esol': 'Confirm current class sites, schedules, registration and any materials costs directly with St. Mark.',
  'city-life-vida-urbana': 'Confirm tenant meeting times, location, language support and accessibility with City Life/Vida Urbana.',
  'dorchester-food-coop': 'Confirm regular and holiday hours, SNAP acceptance and step-free entry with the co-op.',
  'cpcs-boston': 'Confirm administrative office hours and accessibility; the court, not this site, determines appointment eligibility and fee waivers.',
  'work-inc-dorchester': 'Confirm which employment and family-support programs are currently operating and their eligibility and access requirements.',
  'codman-square-community-market': 'The provider pages list conflicting schedules. Confirm opening days, visit frequency, ID/address requirements and accessibility.',
  'metro-housing-boston': 'Confirm resource-line and lobby hours, Monday walk-in capacity, appointment requirements and office accessibility.',
  'metrolist-boston': 'Confirm current office and holiday hours, application links and whether the office is a suitable in-person destination.',
  'somali-development-center': 'Confirm the current office and program hours, available services and access to the second floor.',
  'yawkey-center-adult-ed': 'Confirm separate ESOL, basic education and pantry schedules, registration requirements and the correct entrance.',
  'abcd-esol': 'Confirm the current ESOL locations, enrollment rules and availability; the central office is not necessarily a class site.',
  'abcd-dorchester-nsc': 'Confirm center and clothing-program hours, enrollment, partner referral criteria and current stock with ABCD.',
  'cradles-to-crayons': 'Confirm current age/income rules and partner referral process; the Giving Factory is not a direct family pickup site.',
  'st-francis-house': 'Confirm current Fresh Threads clothing access, stock and hours, separate from day-shelter hours.',
  'womens-lunch-place': 'Confirm shelter hours, eligibility, clothing access and whether coats are currently in stock.',
  'rosies-place': 'Confirm current advocacy hours and whether staff can make clothing referrals; on-site clothing is unconfirmed.',
  'yawkey-basic-needs': 'Confirm whether the Basic Needs team offers clothing or referrals and its current hours; do not represent this as a verified coat pickup.',
  'kroc-center': 'Confirm assistance boundaries, appointment and seasonal registration rules, and whether clothing is available.',
  'coats4vets': 'Confirm the next coat event, eligibility and pickup details; empowerment-center appointment rules may differ from events.',
};
