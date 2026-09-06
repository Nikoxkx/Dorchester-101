'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { HelpCircle, Search, Phone, ExternalLink, ChevronDown } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
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
    name: t('faq.housing', 'Housing & Rent'),
    faqs: [
      {
        q: 'How do I apply for affordable housing in Dorchester?',
        a: `To apply for affordable housing in Dorchester:

1. **Check your income eligibility** — Use our AMI calculator to see if you qualify. Most affordable units require income at or below 60-80% of Area Median Income (AMI).

2. **Create a MassAccess account** — Visit massaccess.org to create a profile and search for available units.

3. **Apply directly to properties** — Many affordable housing developments accept applications through their property management offices.

4. **Boston Housing Authority** — For public housing or Section 8, apply through BHA at bostonhousing.org or call (617) 988-4000.

5. **Attend housing lotteries** — Watch for lottery announcements on the City of Boston housing portal.

**Documents you'll need:**
- Government-issued ID
- Social Security cards for all household members
- Proof of income (pay stubs, tax returns, benefits letters)
- Bank statements
- Proof of current address`,
        sources: [
          { name: 'MassAccess Housing', url: 'https://www.massaccess.org' },
          { name: 'Boston Housing Authority', url: 'https://www.bostonhousing.org' },
        ],
      },
      {
        q: 'What is the current Section 8 waitlist status in Boston?',
        a: `As of **June 2026**, the Boston Housing Authority (BHA) Section 8 Housing Choice Voucher waitlist is **OPEN** for the first time since 2020.

**Key information:**
- Applications accepted: June 10-30, 2026
- Apply online: bostonhousing.org
- Apply by phone: (617) 988-4000
- Apply in person: 52 Chauncy Street, Boston

**Who qualifies:**
- Income must be at or below 50% of Area Median Income
- Boston residency not required but given preference
- No criminal background disqualification for most offenses

**Current wait time:** Estimated 2-4 years depending on preference categories.

**Preference categories:**
1. Homeless or at imminent risk of homelessness
2. Displaced by government action
3. Victims of domestic violence
4. Boston residents
5. Elderly or disabled households`,
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
   - Up to $10,000 for rent arrears, first/last month, security deposit
   - Income must be at or below 50% AMI
   - Apply through local housing agency
   - Current processing time: 5-7 business days
   - Contact: (617) 603-1700

2. **Emergency Rental Assistance Program (ERAP)**
   - Federal funding for pandemic-related arrears
   - Apply at mass.gov/erap
   
3. **Greater Boston Legal Services**
   - Free eviction defense for low-income residents
   - Call: (617) 603-1700 (intake 9am-12:30pm)

4. **City Life / Vida Urbana**
   - Tenant organizing and eviction defense
   - Call: (617) 524-3541

**If you receive an eviction notice:**
- You have the right to a court hearing
- Do NOT move out until ordered by a judge
- Request a jury trial (you have this right)
- Apply for emergency rental assistance immediately
- Contact legal aid for free representation`,
        sources: [
          { name: 'RAFT Program', url: 'https://www.mass.gov/raft' },
          { name: 'City Life / Vida Urbana', url: 'https://www.clvu.org' },
        ],
      },
      {
        q: 'What is AMI and how is it calculated?',
        a: `**AMI (Area Median Income)** is the middle income for the Boston-Cambridge-Quincy metro area, calculated annually by HUD (U.S. Department of Housing and Urban Development).

**2026 AMI for Boston area:**

| Household Size | 100% AMI | 80% AMI | 60% AMI | 50% AMI | 30% AMI |
|---------------|----------|---------|---------|---------|---------|
| 1 person | $96,450 | $77,150 | $57,870 | $48,225 | $28,935 |
| 2 persons | $110,200 | $88,150 | $66,120 | $55,100 | $33,060 |
| 3 persons | $123,950 | $99,150 | $74,370 | $61,975 | $37,185 |
| 4 persons | $137,650 | $110,100 | $82,590 | $68,825 | $41,295 |

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

1. **Codman Square Health Center Food Pantry**
   - 637 Washington St, Dorchester
   - Mon, Tue, Thu, Fri: 10am-2pm
   - Proof of address required
   - (617) 825-9660

2. **Salvation Army Kroc Center**
   - 650 Dudley St, Dorchester
   - Mon-Thu: 9am-12pm
   - No ID required
   - (617) 318-6900

3. **St. Mark's Church**
   - 1725 Dorchester Ave
   - Saturday: 11am-1pm (hot meal)
   - All welcome, no requirements

**Mobile Food Markets:**
- Greater Boston Food Bank mobile markets rotate through Dorchester weekly
- Check gbfb.org/need-food for current schedule

**For immediate help:**
Call Project Bread FoodSource Hotline: **1-800-645-8333**
- Free, confidential
- Available in 180+ languages
- Monday-Friday 8am-5pm`,
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
- Income at or below 200% of federal poverty level
- For a family of 4: gross income under $62,400/year
- Massachusetts has broad categorical eligibility

**What you'll need:**
- ID (license, passport, or other photo ID)
- Proof of income (pay stubs, benefit letters)
- Proof of address (utility bill, lease)
- Social Security numbers for household members

**Benefit amounts (2026):**

| Household Size | Maximum Monthly Benefit |
|---------------|------------------------|
| 1 | $292 |
| 2 | $536 |
| 3 | $768 |
| 4 | $975 |
| 5 | $1,158 |

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
- Income at or below 185% of poverty level ($56,398 for family of 4)
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

**Current enrollment assistance in Dorchester:**
- Codman Square Health Center: (617) 825-9660
- DotHouse Health: (617) 288-3230
- Enrollment drive through June 15, 2026 with multilingual staff`,
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
- Phone: (617) 451-8147
- ESL and job training combined
- Industry certifications

**4. MassHire Career Center (Dorchester)**
- Address: Multiple locations
- Free services for all job seekers
- Job listings, resume help, training referrals

**Youth Programs (ages 14-24):**
- Summer Youth Employment Program (SYEP)
- YouthBuild Boston
- Year Up

**Current opportunity (June 2026):**
Boston SYEP accepting applications for summer positions. $15.75/hour for ages 14-18.`,
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
- Earned at least $6,075 in the last year
- Lost job through no fault of your own
- Able and available to work
- Actively searching for work

**How to apply:**
1. **Online (fastest):** mass.gov/unemployment
2. **By phone:** (877) 626-6800

**Benefit amount:**
- Maximum weekly benefit: $1,033 (2026)
- Calculated as ~50% of average weekly wage
- Duration: Up to 30 weeks

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

**1. LIHEAP (Fuel Assistance)**
- Helps pay heating bills (oil, gas, electric heat)
- Income limit: 60% state median income (~$47,000 for family of 4)
- Maximum benefit: ~$1,600-2,400 depending on income
- Apply through: ABCD (617) 357-6000
- Season: November - April

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
        <Card className="text-center py-8">
          <h3 className="font-heading font-semibold text-lg mb-2">Still have questions?</h3>
          <p className="text-[var(--color-text-muted)] mb-4">
            We&apos;re here to help. Reach out to local resources for personalized assistance.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:211"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-accent-primary)] text-white rounded-lg font-heading"
            >
              <Phone className="w-4 h-4" />
              Call 2-1-1
            </a>
            <a
              href="/resources"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-tertiary)] rounded-lg font-heading"
            >
              View All Resources
            </a>
          </div>
        </Card>
      </motion.div>
    </MainLayout>
  );
}
