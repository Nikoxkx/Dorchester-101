'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { HelpCircle, Search, Phone, ExternalLink, ChevronDown } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import Link from 'next/link';
import { ProjectNote } from '@/components/layout/ProjectNote';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function FAQPage() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);

  const FAQ_CATEGORIES = [
  {
    id: 'housing',
    name: t('faq.topic.housing'),
    faqs: [
      {
        q: 'How do I apply for affordable housing in Dorchester?',
        a: `To apply for affordable housing in Dorchester:

1. **Check your income eligibility** — Use our AMI calculator to see if you qualify. Most affordable units require income at or below 60-80% of Area Median Income (AMI).

2. **Watch the two official listing sites** — Metrolist (boston.gov/metrolist) carries every City of Boston income-restricted lottery and waitlist; Housing Navigator Massachusetts (housingnavigatorma.org) carries income-restricted rentals statewide and has replaced the retired MassAccess registry. Both are free and need no account.

3. **Apply through the listing** — Each listing says how to apply. Applications go to the property manager named on it, never to the city or this site.

4. **Boston Housing Authority** — Public housing and project-based vouchers are open; apply at bostonhousing.org or call (617) 988-4000. The Section 8 Housing Choice Voucher waiting list is closed until further notice.

5. **Attend housing lotteries** — All Boston lotteries are advertised on Metrolist about 3–6 months before a building opens.

**Documents you'll need:**
- Government-issued ID
- Social Security cards for all household members
- Proof of income (pay stubs, tax returns, benefits letters)
- Bank statements
- Proof of current address`,
        sources: [
          { name: 'Metrolist (City of Boston)', url: 'https://www.boston.gov/metrolist' },
          { name: 'Housing Navigator Massachusetts', url: 'https://housingnavigatorma.org' },
          { name: 'Boston Housing Authority', url: 'https://www.bostonhousing.org' },
        ],
      },
      {
        q: 'What is the current Section 8 waitlist status in Boston?',
        a: `Checked on **4 October 2026**, against the Boston Housing Authority's own waiting-list pages:

**Section 8 Housing Choice Voucher (tenant-based): CLOSED** until further notice. BHA says it gives at least two weeks' public notice before reopening, and it does not keep a "notify me" list — you have to watch bostonhousing.org.

**What is open:**
- **Public housing** (federal and City-funded developments) — apply at bostonhousing.org or boston.myhousing.com; (617) 988-4000
- **Project-based vouchers and Mod Rehab** — open for applicants who can document Priority One status
- **State rental vouchers (MRVP)** — BHA's allocation is closed; the statewide list runs through CHAMP

**Good to know:**
- Income limits follow HUD's AMI bands for the Boston metro area
- Boston residency is not required for public housing, but residency and rent-burden preferences apply to many lotteries
- A criminal record is not an automatic bar; BHA screens case by case
- Wait times are long. BHA's own guidance says it can be over ten years from the date of application — apply to neighbouring housing authorities as well

**Preference categories** (which speed a wait up): homelessness or imminent risk of it, displacement by government action, domestic violence, Boston residency, and elderly or disabled households.`,
        sources: [
          { name: 'Boston Housing Authority', url: 'https://www.bostonhousing.org' },
        ],
      },
      {
        q: 'What are my rights as a tenant in Massachusetts?',
        a: `Massachusetts tenant rights are among the strongest in the country. Key protections include:

**Security Deposits:**
- Maximum: First month, last month, one month security deposit, and lock change cost
- Must be held in interest-bearing account
- Must be returned within 30 days of move-out with itemized deductions

**Eviction Protections:**
- 14 days written notice for nonpayment of rent
- 30 days notice for lease violations or no-fault evictions
- Court process required for all evictions
- "Self-help" evictions (changing locks, removing belongings) are illegal

**Habitability Requirements:**
- Heat must be maintained at 68°F daytime, 64°F nighttime (Sept 15 - June 15)
- Hot water must be at least 110°F
- All systems must be in working order
- Landlord must address lead paint hazards

**Rent Increases:**
- No limit on rent increase amounts in Massachusetts
- Must provide 30 days written notice (or one full rental period, whichever is longer)
- Cannot increase rent during lease term without agreement

**Retaliation Protection:**
- Landlord cannot evict or raise rent in response to:
  - Reporting code violations
  - Organizing with other tenants
  - Exercising legal rights`,
        sources: [
          { name: 'Mass Legal Help', url: 'https://www.masslegalhelp.org/housing' },
          { name: 'Greater Boston Legal Services', url: 'https://www.gbls.org' },
        ],
      },
      {
        q: 'How can I get help with back rent or facing eviction?',
        a: `If you're behind on rent or facing eviction, there are several resources available:

**Immediate Steps:**

1. **RAFT (Residential Assistance for Families in Transition)**
   - Up to **$7,000** per 12-month period for rent arrears, overdue utilities, moving costs or mortgage payments
   - Income must be at or below 50% AMI; for rent arrears a landlord application is also required
   - Apply online through the state RAFT portal, by calling **2-1-1**, or through Metro Housing|Boston: **(617) 425-6700**

2. **Greater Boston Legal Services**
   - Free eviction defense for low-income residents
   - Intake line: **(617) 371-1234**, Monday-Friday 9:30am-12:30pm
   - Walk-in clinic at Dorchester Courthouse (410 Washington St), 2nd and 4th Wednesday, 9am-12pm

3. **City Life / Vida Urbana**
   - Tenant organizing and free weekly legal clinic
   - Call: (617) 524-3541; meeting Tuesdays at 6:15pm

4. **Office of Housing Stability (City of Boston)**
   - Help if you are at immediate risk of losing your home: (617) 635-4200, Monday-Friday 9am-5pm

**If you receive an eviction notice:**
- You have the right to a court hearing
- Do NOT move out until ordered by a judge
- Request a jury trial (you have this right)
- Apply for emergency rental assistance immediately
- Contact legal aid for free representation`,
        sources: [
          { name: 'RAFT Program', url: 'https://www.mass.gov/how-to/apply-for-raft-emergency-help-for-housing-costs' },
          { name: 'Greater Boston Legal Services', url: 'https://www.gbls.org/get-legal-help/service-locations' },
          { name: 'City Life / Vida Urbana', url: 'https://www.clvu.org' },
        ],
      },
      {
        q: 'What is AMI and how is it calculated?',
        a: `**AMI (Area Median Income)** is the middle income for the Boston-Cambridge-Quincy metro area, calculated annually by HUD (U.S. Department of Housing and Urban Development).

**The current figures** are fetched live from HUD on the Tools page and the housing page — no ladder is copied into this text, because HUD republishes the limits every spring and a table typed here would go stale. For scale, HUD's FY2026 figures for the Boston metro area are: median family income $164,600; the 50% ("very low income") limit $85,700 for a family of four, and the 80% ("low income") limit $137,100 for a family of four. The City of Boston's 2026 schedule sets 100% AMI at $171,400 for a family of four, which is exactly twice HUD's 50% figure — that is the ladder Boston's income-restricted lotteries quote. Check the Tools page's calculator for your own household size and band.

**What counts as income:**
- Wages, salaries, tips
- Social Security benefits
- SSI/SSDI
- Unemployment benefits
- Child support received
- Interest and dividends
- Retirement/pension income

**What does NOT count:**
- Food stamps (SNAP)
- Housing subsidies
- One-time lump sum payments
- Student financial aid`,
        sources: [
          { name: 'HUD User Income Limits', url: 'https://www.huduser.gov/portal/datasets/il.html' },
        ],
      },
    ],
  },
  {
    id: 'food',
    name: 'Food Assistance',
    faqs: [
      {
        q: 'Where can I get free food in Dorchester?',
        a: `There are many free food resources in Dorchester. Here are the main options:

**Food Pantries (ongoing):**

1. **Codman Square Community Market** (the health centre's pantry)
   - 450 Washington St, Dorchester — half a mile up Washington Street from the health centre
   - Tuesday 8am-1pm, Wednesday 2-7pm, Thursday 8am-1pm
   - Choice-based shopping, once a month per household; no ID required
   - (617) 825-9660

2. **Salvation Army Kroc Center**
   - 650 Dudley St, Dorchester
   - Emergency pantry: 2nd and 4th Tuesday of the month, 10am-12pm, by appointment only
   - Call (617) 318-6940 to book; appointments once a month
   - (617) 318-6900 main line

3. **Fair Foods $2 Bag at Lena Park**
   - 150 American Legion Hwy, Dorchester
   - Tuesdays from 2pm while the produce lasts; $2 a bag, over 12 lb of fruit and vegetables
   - No ID, no proof of address, no income test
   - (617) 533-8133

**Mobile Food Markets:**
- Greater Boston Food Bank partner pantries and pop-ups rotate through Dorchester
- Check the food finder at gbfb.org/need-food for the schedule nearest your address

**For immediate help:**
Call Project Bread FoodSource Hotline: **1-800-645-8333**
- Free, confidential
- Interpreters on the line (180+ languages)
- Monday-Friday 8am-7pm, Saturday 10am-2pm`,
        sources: [
          { name: 'Greater Boston Food Bank', url: 'https://www.gbfb.org' },
          { name: 'Project Bread', url: 'https://www.projectbread.org' },
        ],
      },
      {
        q: 'How do I apply for SNAP (food stamps)?',
        a: `**SNAP** (Supplemental Nutrition Assistance Program) provides monthly benefits to buy groceries.

**How to apply:**

1. **Online (fastest):** DTAConnect.com
2. **By phone:** (877) 382-2363
3. **In person:** Visit your local DTA office

**Who qualifies:**
- Income at or below 200% of the federal poverty level — Massachusetts uses the broadest option allowed (broad-based categorical eligibility)
- For a family of 4: gross income under about $5,500/month (roughly $66,000/year)
- No asset test for most households

**What you'll need:**
- ID (license, passport, or other photo ID)
- Proof of income (pay stubs, benefit letters)
- Proof of address (utility bill, lease)
- Social Security numbers for household members

**Maximum monthly benefit** (set by USDA for 1 October 2026 – 30 September 2027):

| Household Size | Maximum Monthly Benefit |
|---------------|------------------------|
| 1 | $306 |
| 2 | $562 |
| 3 | $808 |
| 4 | $1,023 |
| 5 | $1,217 |

The maximum is a ceiling, not a guaranteed amount: your benefit is the maximum for your household size minus 30% of your net income after deductions. Most households receive less than the top figure.

**Processing time:** 
- Standard: 30 days
- Expedited (emergency): 7 days if extremely low income

**Use SNAP to buy groceries at:**
- Most supermarkets
- Convenience stores
- Farmers markets (many double your benefits!)
- Amazon and Walmart online`,
        sources: [
          { name: 'Massachusetts DTA', url: 'https://www.mass.gov/snap' },
          { name: 'DTAConnect', url: 'https://dtaconnect.eohhs.mass.gov' },
        ],
      },
      {
        q: 'What is WIC and do I qualify?',
        a: `**WIC** (Women, Infants, and Children) provides nutrition support for pregnant women, new mothers, and children under 5.

**Who qualifies:**
- Pregnant women
- Women who recently had a baby (up to 6 months postpartum, or 12 months if breastfeeding)
- Infants and children under age 5
- Income at or below 185% of the poverty level — about $61,000/year for a family of 4 under the guidelines in force since 1 June 2026 (you are automatically income-eligible if you receive SNAP, MassHealth or TAFDC)
- Must be at "nutritional risk" (determined at appointment)

**What WIC provides:**
- Monthly food benefits for:
  - Milk, cheese, yogurt
  - Eggs
  - Whole grains (bread, cereal, rice)
  - Fruits and vegetables
  - Beans and peanut butter
  - Baby food and formula
- Breastfeeding support
- Nutrition education
- Healthcare referrals

**How to apply:**
1. Find a WIC office: Call (800) 942-1007
2. Schedule an appointment
3. Bring: ID, proof of income, proof of address, child's immunization records

**Dorchester WIC locations:**
- Codman Square Health Center: (617) 825-9660
- DotHouse Health: (617) 288-3230`,
        sources: [
          { name: 'Massachusetts WIC', url: 'https://www.mass.gov/wic' },
        ],
      },
    ],
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    faqs: [
      {
        q: 'How do I sign up for MassHealth (Medicaid)?',
        a: `**MassHealth** is Massachusetts' Medicaid program providing free or low-cost health insurance.

**Who qualifies:**
- Adults under 65 with income up to 138% FPL (~$20,000/year for individual)
- Pregnant women with higher income limits
- Children with higher income limits
- Disabled individuals at any age
- No citizenship status requirement for emergency services

**How to apply:**

1. **Online:** mahealthconnector.org
2. **By phone:** (800) 841-2900 (TTY: 800-497-4648)
3. **In person:** At a community health center

**What you'll need:**
- Social Security number (if you have one)
- Proof of income
- Proof of Massachusetts residency
- Immigration documents (if applicable)

**Processing time:** Usually 7-10 business days

**Enrollment help in Dorchester:**
- Codman Square Health Center: (617) 825-9660 — walk-in insurance services, non-patients welcome
- DotHouse Health: (617) 288-3230
- Upham's Corner Health Center: (617) 287-8000
- Statewide multilingual HelpLine from Health Care For All: **1-800-272-4232** — free help with an application or an appeal, no immigration status required`,
        sources: [
          { name: 'MA Health Connector', url: 'https://www.mahealthconnector.org' },
        ],
      },
    ],
  },
  {
    id: 'employment',
    name: 'Jobs & Income',
    faqs: [
      {
        q: 'Where can I find job training programs in Dorchester?',
        a: `Several organizations in Dorchester offer free or low-cost job training:

**1. Action for Boston Community Development (ABCD)**
- Address: Various locations
- Phone: (617) 357-6000
- Programs: 
  - Career coaching
  - Resume writing
  - Interview skills
  - Industry-specific training (healthcare, construction, IT)

**2. Year Up**
- Phone: (617) 542-1533
- For ages 18-29
- 6-month training + 6-month internship
- Focus: IT, finance, business operations
- Stipend provided

**3. Jewish Vocational Service (JVS)**
- 75 Federal Street, 3rd Floor, Boston
- Phone: (617) 399-3131
- ESOL combined with job training and industry certifications

**4. MassHire career centers**
- Free services for all job seekers: job listings, resume help, training referrals
- Find the centre nearest you at mass.gov/masshire-career-centers

**Youth Programs (ages 14-24):**
- ABCD SummerWorks: paid summer jobs, 14-18 at $15/hour and 19-24 at $20/hour; applications open each 1 March
- Youth Options Unlimited (YOU) Boston: year-round paid placements, apply through boston.gov
- Year Up: 6-month training plus a 6-month internship, apply at yearup.org

**Timing:** SummerWorks ran 6 July – 28 August 2026; the next application window opens on 1 March 2027.`,
        sources: [
          { name: 'MassHire', url: 'https://www.mass.gov/masshire-career-centers' },
          { name: 'Year Up', url: 'https://www.yearup.org' },
        ],
      },
      {
        q: 'How do I apply for unemployment benefits?',
        a: `**Massachusetts Unemployment Insurance (UI)** provides temporary income if you lose your job through no fault of your own.

**Who qualifies:**
- Worked in MA in the past 15 months
- Earned at least $6,300 in the base period, with wages in at least two quarters, and at least 30 times your weekly benefit
- Lost job through no fault of your own
- Able and available to work
- Actively searching for work

**How to apply:**
1. **Online (fastest):** mass.gov/unemployment
2. **By phone:** (877) 626-6800

**Benefit amount:**
- Maximum weekly benefit: $1,105 (in force since 5 October 2025; DUA re-prices the cap every October from state wage data, so check mass.gov for the figure that applies to your claim)
- Calculated as about half of your average weekly wage, plus up to $25 per dependent child
- Duration: up to 30 weeks — the longest run in the country

**What you'll need:**
- Social Security number
- Driver's license or state ID
- Employment history (past 18 months)
- Bank account info for direct deposit

**Processing time:** First payment typically 2-3 weeks after filing

**Important:** 
- File as soon as you lose your job
- Benefits are not retroactive
- You must certify weekly that you're looking for work`,
        sources: [
          { name: 'MA Unemployment', url: 'https://www.mass.gov/unemployment' },
        ],
      },
    ],
  },
  {
    id: 'utilities',
    name: 'Utilities & Bills',
    faqs: [
      {
        q: 'How can I get help paying my utility bills?',
        a: `Several programs help with utility bills in Massachusetts:

**1. LIHEAP / HEAP (fuel assistance)**
- Helps pay heating bills (oil, gas, electric heat) — renters qualify even when heat is included in the rent
- Income limit: 60% of state median income, which is far above the SNAP limit and scales with household size — confirm your household's figure with ABCD
- Maximum benefit in 2025-26: $1,000 for deliverable fuel (oil, propane) and $850 for utility-heated homes
- Apply through: ABCD (617) 357-6000
- Season: 1 November - 30 April; applications open each autumn

**2. Good Neighbor Energy Fund**
- For households just above LIHEAP eligibility
- Grants up to $600
- Apply through: Salvation Army

**3. Utility Company Arrearage Programs**
- Eversource: (800) 592-2000
- National Grid: (800) 322-3223
- Payment plans and forgiveness programs available

**4. Discount Rates**
- Low-income discount rate available from utilities
- Automatic if you receive SNAP, MassHealth, or SSI

**Shut-off Protection:**
- November 15 - March 15: No shut-offs for non-payment if you can't afford to pay
- Year-round protection for elderly, disabled, seriously ill
- Must notify utility company of hardship

**To apply for shut-off protection:**
1. Call your utility company
2. Request a "financial hardship" designation
3. Provide proof of income or benefits receipt`,
        sources: [
          { name: 'LIHEAP', url: 'https://www.mass.gov/fuel-assistance' },
          { name: 'ABCD', url: 'https://www.bostonabcd.org' },
        ],
      },
    ],
  },
];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQs, setExpandedFAQs] = useState<string[]>([]);

  const toggleFAQ = (id: string) => {
    setExpandedFAQs(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const filteredCategories = FAQ_CATEGORIES.filter(cat => 
    selectedCategory === 'all' || cat.id === selectedCategory
  );

  const searchResults = searchQuery.length > 2
    ? FAQ_CATEGORIES.flatMap(cat => 
        cat.faqs.filter(faq => 
          faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.a.toLowerCase().includes(searchQuery.toLowerCase())
        ).map(faq => ({ ...faq, category: cat.name }))
      )
    : [];

  return (
    <MainLayout>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="enter"
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Header */}
        <header className="space-y-2">
          <h1 className="font-display text-3xl md:text-4xl font-bold flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-[var(--color-accent-primary)]" />
            Frequently Asked Questions
          </h1>
          <p className="text-[var(--color-text-muted)] font-body max-w-2xl">
            Find answers to common questions about housing, food assistance, healthcare, and more.
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Answers are written in plain language from the statute or agency rule they describe, and each names the office to call. Search by a word you would actually say — &ldquo;heat&rdquo;, &ldquo;deposit&rdquo;, &ldquo;EBT&rdquo; — and open one question at a time. If an answer looks out of date, the &ldquo;report a problem&rdquo; link at the bottom sends it straight to the person who keeps this list.
          </p>
        </header>

        {/* Emergency Contact */}
        <Card className="bg-[var(--color-accent-primary)]/5">
          <CardContent className="py-4 flex items-center gap-4">
            <Phone className="w-8 h-8 text-[var(--color-accent-primary)]" />
            <div>
              <p className="font-heading font-semibold">Need help right now?</p>
              <p className="text-sm text-[var(--color-text-muted)]">
                Call <span className="font-semibold">2-1-1</span> anytime (24/7) for free, confidential referrals to services.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full pl-12 pr-4 py-3 rounded-xl',
              'bg-[var(--color-bg-secondary)] border border-[var(--color-border)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]'
            )}
          />
        </div>

        {/* Search Results */}
        {searchQuery.length > 2 && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
            </p>
            {searchResults.map((faq, idx) => (
              <Card key={idx} className="overflow-hidden">
                <button
                  onClick={() => toggleFAQ(`search-${idx}`)}
                  className="w-full p-4 text-left flex items-center gap-3"
                >
                  <div className="flex-1">
                    <p className="text-xs text-[var(--color-accent-primary)] mb-1">{faq.category}</p>
                    <h3 className="font-heading font-semibold">{faq.q}</h3>
                  </div>
                  <ChevronDown className={cn(
                    'w-5 h-5 transition-transform',
                    expandedFAQs.includes(`search-${idx}`) && 'rotate-180'
                  )} />
                </button>
                {expandedFAQs.includes(`search-${idx}`) && (
                  <div className="px-4 pb-4 prose prose-sm max-w-none">
                    <div 
                      className="text-[var(--color-text-secondary)] whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: faq.a.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                    />
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Category Tabs */}
        {searchQuery.length <= 2 && (
          <>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  'px-4 py-2 rounded-lg font-heading font-medium text-sm',
                  selectedCategory === 'all'
                    ? 'bg-[var(--color-accent-primary)] text-white'
                    : 'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)]'
                )}
              >
                All Topics
              </button>
              {FAQ_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    'px-4 py-2 rounded-lg font-heading font-medium text-sm',
                    selectedCategory === cat.id
                      ? 'bg-[var(--color-accent-primary)] text-white'
                      : 'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)]'
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* FAQ List */}
            <div className="space-y-8">
              {filteredCategories.map(category => (
                <section key={category.id}>
                  <h2 className="font-heading font-semibold text-xl mb-4">{category.name}</h2>
                  <div className="space-y-3">
                    {category.faqs.map((faq, idx) => {
                      const faqId = `${category.id}-${idx}`;
                      const isExpanded = expandedFAQs.includes(faqId);
                      
                      return (
                        <Card key={idx} className="overflow-hidden">
                          <button
                            onClick={() => toggleFAQ(faqId)}
                            className="w-full p-4 text-left flex items-center gap-3 hover:bg-[var(--color-bg-tertiary)] transition-colors"
                          >
                            <div className="flex-1">
                              <h3 className="font-heading font-semibold">{faq.q}</h3>
                            </div>
                            <ChevronDown className={cn(
                              'w-5 h-5 transition-transform flex-shrink-0',
                              isExpanded && 'rotate-180'
                            )} />
                          </button>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              className="px-4 pb-4 border-t border-[var(--color-border)]"
                            >
                              <div className="pt-4 prose prose-sm max-w-none">
                                <div 
                                  className="text-[var(--color-text-secondary)] whitespace-pre-wrap text-sm leading-relaxed"
                                  dangerouslySetInnerHTML={{ 
                                    __html: faq.a
                                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                      .replace(/\n/g, '<br>')
                                  }}
                                />
                              </div>
                              {faq.sources && faq.sources.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                                  <p className="text-xs text-[var(--color-text-muted)] mb-2">Sources:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {faq.sources.map((source, i) => (
                                      <a
                                        key={i}
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-[var(--color-accent-primary)] hover:underline"
                                      >
                                        {source.name}
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}

        {/* Still have questions */}
        <Card className="py-8 text-center">
          <h3 className="mb-2 font-heading text-lg font-semibold">{t('faq.stillQuestions')}</h3>
          <p className="mx-auto mb-5 max-w-prose text-[var(--color-text-muted)]">{t('faq.stillBody')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="tel:211"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent-primary)] px-4 py-2 font-heading text-white"
            >
              <Phone className="h-4 w-4 text-white" aria-hidden="true" />
              {t('faq.call211')}
            </a>
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] px-4 py-2 font-heading hover:border-[var(--color-accent-primary)]"
            >
              {t('faq.viewAll')}
            </Link>
          </div>
        </Card>

        <ProjectNote className="mt-6" sources={['masslegal', 'bostongov', 'dta', 'bha']}>
          Answers are written in plain language from the rules published by the agency or statute named in each answer. When a rule changes, the answer is updated and the change is visible in the public repository.
        </ProjectNote>
      </motion.div>
    </MainLayout>
  );
}
