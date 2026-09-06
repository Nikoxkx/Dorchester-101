export interface FaqItem {
  q: string;
  a: string;
  sources: { name: string; url: string }[];
}

export interface FaqCategory {
  id: string;
  name: string;
  faqs: FaqItem[];
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: 'housing',
    name: 'Housing & rent',
    faqs: [
      {
        q: 'How do I apply for income-restricted housing in Dorchester?',
        a: `Three doors, not one:

1. Public housing — Boston Housing Authority at boston.myhousing.com or 52 Chauncy Street. Call (617) 988-4000. Public housing waitlists are open.

2. Private/nonprofit income-restricted units — MassAccess (massaccesshousingregistry.org). Lotteries open and close. Make a profile and turn on alerts for ZIP 02121–02125.

3. Local CDCs — CSNDC (617-825-9797), Dorchester Bay EDC (617-825-4200), VietAID (617-822-3717). They keep their own lists.

Bring ID, Social Security cards, pay stubs or benefit letters, bank statements, and proof of address. Use the AMI calculator here to see which % AMI band you fall in.`,
        sources: [
          { name: 'MassAccess', url: 'https://www.massaccesshousingregistry.org' },
          { name: 'Boston Housing Authority', url: 'https://www.bostonhousing.org' },
        ],
      },
      {
        q: 'Is the BHA Section 8 waitlist open?',
        a: `No. As of summer 2026 the Boston Housing Authority tenant-based Housing Choice Voucher (Section 8) waitlist is closed until further notice.

What is still open:
- BHA public housing
- Some project-based voucher and Mod Rehab lists (often Priority One only)
- Apply at boston.myhousing.com

BHA will post a public notice about two weeks before Section 8 reopens. They do not keep a “call me when it opens” list. Check bostonhousing.org and the status line (617) 988-3400 (Mon–Wed 11 AM–2 PM).

The statewide EOHLC Section 8 list has been closed since January 13, 2025.`,
        sources: [
          { name: 'Boston Housing Authority eligibility', url: 'https://www.bostonhousing.org/en/Applications/Eligibility.aspx' },
        ],
      },
      {
        q: 'What are my rights as a tenant in Massachusetts?',
        a: `Massachusetts is a strong tenant-protection state, but you still have to show up in court.

Security deposit: first, last, one month security, lock change. Security sits in an interest-bearing account and must be returned within 30 days with an itemized list.

Eviction: written notice, then a court case. Lockouts and “self-help” (dumping belongings) are illegal. 14 days for nonpayment; often 30 days otherwise.

Heat: 68°F day / 64°F night, September 15–June 15. Hot water 110°F+.

Rent increases: no statewide cap. The landlord must give proper notice (usually a full rental period). They cannot raise rent mid-lease unless the lease says so.

Retaliation: they cannot punish you for reporting code issues or organizing.

Legal help: GBLS (617) 603-1700; City Life / Vida Urbana (617) 524-3541.`,
        sources: [
          { name: 'Mass Legal Help — housing', url: 'https://www.masslegalhelp.org/housing' },
        ],
      },
      {
        q: 'I am behind on rent. What can I do this week?',
        a: `1. RAFT — up to $7,000 in a 12-month period for arrears, first/last, security, some utilities and moving costs. Income generally ≤50% AMI. Apply through Metro Housing|Boston / Mass.gov RAFT. Processing often takes weeks, not days. You usually need a notice to quit or summons now.

2. Greater Boston Legal Services — (617) 603-1700, weekday morning intake. Do not move out just because you got a notice.

3. City Life / Vida Urbana — (617) 524-3541.

4. 2-1-1 — after hours.

If you already have a court date, go. Bring the RAFT receipt or legal-aid letter if you have one.`,
        sources: [
          { name: 'RAFT', url: 'https://www.mass.gov/raft' },
          { name: 'Metro Housing|Boston', url: 'https://www.metrohousingboston.org/our-programs/homelessness-prevention/residential-assistance-for-families-in-transition/' },
        ],
      },
      {
        q: 'What is AMI?',
        a: `Area Median Income for the Boston-Cambridge-Quincy metro, published every year by HUD. Housing programs use 30%, 50%, 60%, and 80% of that number.

FY2026 examples (gross yearly income):

1 person — 50% AMI $60,000; 80% AMI $96,000
4 people — 50% AMI $85,700; 80% AMI $137,100

Wages, Social Security, unemployment, and child support usually count. SNAP and housing subsidies usually do not.

Use the calculator on the Tools page. Then apply to units at your band or higher (a 50% AMI household can often apply for 50%, 60%, and 80% units).`,
        sources: [
          { name: 'HUD Income Limits', url: 'https://www.huduser.gov/portal/datasets/il.html' },
        ],
      },
    ],
  },
  {
    id: 'food',
    name: 'Food',
    faqs: [
      {
        q: 'Where can I get food in Dorchester today?',
        a: `Call Project Bread first: 1-800-645-8333 (Mon–Fri 8 AM–5 PM). They know which pantries are actually open this week.

Standing sites (always call first):
- Codman Square Health Center pantry — 637 Washington St, Mon/Tue/Thu/Fri 10 AM–2 PM, (617) 825-9660
- Salvation Army Kroc Center — 650 Dudley St, Mon–Thu 9 AM–noon, (617) 318-6900
- St. Mark’s — 1725 Dorchester Ave, Saturday 11 AM–1 PM, hot meal, no paperwork

Greater Boston Food Bank lists mobile markets at gbfb.org/need-food.`,
        sources: [
          { name: 'Project Bread', url: 'https://www.projectbread.org' },
          { name: 'GBFB need food', url: 'https://www.gbfb.org/need-food/' },
        ],
      },
      {
        q: 'How do I apply for SNAP?',
        a: `Online: DTAConnect (dtaconnect.eohhs.mass.gov)
Phone: (877) 382-2363

Massachusetts uses 200% of the federal poverty level for the gross test. FY2026 maximum monthly benefit is $298 for one person and $994 for four — your amount depends on income and deductions.

Bring ID, income proof, address proof, and Social Security numbers. Standard decision is 30 days; expedited cases can be 7 days.

Farmers markets in season often double SNAP. Amazon and many grocers take EBT.`,
        sources: [
          { name: 'Mass.gov SNAP', url: 'https://www.mass.gov/snap' },
          { name: 'DTAConnect', url: 'https://dtaconnect.eohhs.mass.gov' },
        ],
      },
      {
        q: 'What is WIC?',
        a: `Food and nutrition for pregnant people, new parents, and children under 5. Income up to 185% of poverty, plus a nutrition screening.

Dorchester offices:
- Codman Square Health Center — (617) 825-9660
- DotHouse Health — (617) 288-3230
Statewide: (800) 942-1007

You can have SNAP and WIC at the same time.`,
        sources: [{ name: 'Massachusetts WIC', url: 'https://www.mass.gov/wic' }],
      },
    ],
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    faqs: [
      {
        q: 'How do I get MassHealth?',
        a: `Apply at mahealthconnector.org or (800) 841-2900.

Adults under 65 generally qualify up to 138% of the federal poverty level. Kids and pregnant people have higher limits. Community health centers will sit with you and fill it out.

Codman Square Health Center (617) 825-9660 and DotHouse Health (617) 288-3230 both do enrollment help and sliding-scale care if you are uninsured.`,
        sources: [{ name: 'Health Connector', url: 'https://www.mahealthconnector.org' }],
      },
    ],
  },
  {
    id: 'employment',
    name: 'Jobs',
    faqs: [
      {
        q: 'Where is job training in Dorchester?',
        a: `ABCD — (617) 357-6000 — career coaching and occupational training.
Year Up — (617) 542-1533 — ages 18–29, IT/finance, stipend.
MassHire — mass.gov/masshire-career-centers — open to anyone.
JVS Boston — ESL plus job training.

Boston’s Summer Youth Employment Program (SYEP) opens in the spring for ages 14–18. Watch boston.gov.`,
        sources: [{ name: 'MassHire', url: 'https://www.mass.gov/masshire-career-centers' }],
      },
      {
        q: 'How do I file for unemployment?',
        a: `mass.gov/unemployment or (877) 626-6800.

You generally need recent Massachusetts work, a minimum amount of earnings, a job loss that was not your quit-without-cause, and an active job search.

File the week you lose the job — it is not retroactive. First payment is often 2–3 weeks.`,
        sources: [{ name: 'Mass unemployment', url: 'https://www.mass.gov/unemployment' }],
      },
    ],
  },
  {
    id: 'utilities',
    name: 'Utilities',
    faqs: [
      {
        q: 'I cannot pay the heat or electric bill.',
        a: `LIHEAP (fuel assistance): ABCD (617) 357-6000, typically November–April.

Discount rate: automatic if you already get SNAP, MassHealth, or SSI — call Eversource (800) 592-2000 or National Grid (800) 322-3223.

Shut-off protection: November 15–March 15 if you tell the company you cannot pay. Year-round protection for elderly, disabled, or seriously ill households — you have to ask.

Good Neighbor Energy Fund (Salvation Army) for people just over the LIHEAP line.

RAFT can sometimes cover utility arrears as part of a housing crisis.`,
        sources: [{ name: 'Mass fuel assistance', url: 'https://www.mass.gov/fuel-assistance' }],
      },
    ],
  },
];
