'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { HelpCircle, Search, Phone, ExternalLink, ChevronDown } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import Link from 'next/link';
import { ProjectNote } from '@/components/layout/ProjectNote';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/hook';
import { SPANISH_FAQ_ANSWERS } from './answers.es';
import { OTHER_FAQ_ANSWERS } from './answers.multilingual';
import { FOOD_FAQ_ANSWERS } from './answers.food';
import { SNAP_FAQ_ANSWERS } from './answers.snap';
import { EVICTION_FAQ_ANSWERS } from './answers.eviction';
import { WIC_FAQ_ANSWERS } from './answers.wic';
import { RIGHTS_FAQ_ANSWERS } from './answers.rights';
import { AMI_FAQ_ANSWERS } from './answers.ami';
import { MASSHEALTH_FAQ_ANSWERS } from './answers.masshealth';
import { TRAINING_FAQ_ANSWERS } from './answers.training';
import { UNEMPLOYMENT_FAQ_ANSWERS } from './answers.unemployment';
import { UTILITIES_FAQ_ANSWERS } from './answers.utilities';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function FAQPage() {
  const { t, lang, meta } = useI18n();

  const FAQ_CATEGORIES = [
  {
    id: 'housing',
    name: t('faq.topic.housing'),
    faqs: [
      {
        key: 'applyHousing',
        q: t('faq.q.applyHousing'),
        a: `Find income-restricted housing through the sources below. Use the AMI tool as a starting estimate; rules and limits vary by listing.

1. List household members and income sources. Programs count income and assets differently; ask the listing contact what applies. The AMI calculator is an estimate, not an eligibility decision. Ask the property or program manager.

2. **Metrolist** (boston.gov/metrolist): Income-restricted listings in Greater Boston, an AMI estimator and a weekly digest. It does not list public or subsidized housing.

**Housing Navigator Massachusetts** (housingnavigatorma.org): Free nonprofit search for income-restricted rentals statewide, with eligibility and accessibility filters. Confirm details with the property.

3. Listings direct applicants to property managers; each application and waitlist has its own rules.

4. BHA accepts public housing applications; its general Section 8 Housing Choice Voucher waitlist is closed. Project-based and Mod Rehab lists have restrictions and possible exceptions. Metrolist and Housing Navigator list different rental opportunities. Confirm current rules with each program. bostonhousing.org · (617) 988-4000.

5. Some homes use a lottery, a waitlist or first-come applications. Requirements and preferences vary; check each listing and deadline.

**Ask which documents are needed:** Programs may request proof of identity, income, assets or household details. Ask what to provide and how to get help if documents are difficult to obtain.`,
        sources: [
          { name: 'Metrolist (City of Boston)', url: 'https://www.boston.gov/metrolist' },
          { name: 'Housing Navigator Massachusetts', url: 'https://housingnavigatorma.org' },
          { name: 'Boston Housing Authority', url: 'https://www.bostonhousing.org/en/FAQ.aspx' },
          { name: 'BHA 2026 annual plan', url: 'https://www.bostonhousing.org/BHA/media/Documents/Annual%20Plan/Fed%20Annual%20Plan%202026/7-Plan-Supplement-2026-redline-edit-mode-011326-v12.pdf' },
        ],
      },
      {
        key: 'section8',
        q: t('faq.q.section8'),
        a: `Checked 31 October 2026. Rules and waiting lists can change.

BHA public housing accepts applications; the general Section 8 voucher waitlist is closed. Ask about restrictions and exceptions: (617) 988-4000.

BHA's project-based voucher and Mod Rehab lists generally require Priority One; there are limited exceptions. Some categories may also qualify for exceptions to the closed tenant-based list. Ask BHA about your situation.

bostonhousing.org · (617) 988-4000.

CHAMP accepts applications for state-aided public housing and Massachusetts rental vouchers (MRVP and AHVP); individual waiting lists have their own rules. Visit housingapplication.mass.gov or ask a local housing authority.

Waitlists are separate. Follow each program's instructions for updating contact details and renewing interest; rules vary.`,
        sources: [
          { name: 'Boston Housing Authority', url: 'https://www.bostonhousing.org/en/FAQ.aspx' },
          { name: 'BHA 2026 annual plan', url: 'https://www.bostonhousing.org/BHA/media/Documents/Annual%20Plan/Fed%20Annual%20Plan%202026/7-Plan-Supplement-2026-redline-edit-mode-011326-v12.pdf' },
          { name: 'CHAMP', url: 'https://housingapplication.mass.gov/help/' },
        ],
      },
      {
        key: 'rights',
        q: t('faq.q.rights'),
        a: `Massachusetts tenants have protections, but the rules depend on the tenancy and circumstances. For advice about your situation, contact legal aid.

**Security deposits:** A landlord may generally collect first and last month's rent, a security deposit of no more than one month's rent, and the actual cost of a new lock and key. The deposit must be held in a separate interest-bearing Massachusetts bank account. The landlord must return the deposit or balance within 30 days after the tenancy ends, with required documentation for deductions.

**Evictions:** Notice periods depend on the reason, tenancy and any federal rules. A notice to quit alone does not require you to leave; a landlord cannot forcibly evict you without a court order. Read and respond to court papers on time and seek legal help.

**Safe housing:** Under the state housing code, the default heating season is September 15 through May 31; local authorities may change the dates. During that season the minimum is 68°F from 7am to 11pm and 64°F from 11:01pm to 6:59am. Hot water must generally be at least 110°F. Report problems to your landlord and local inspectional services.

**Rent increases:** Rules vary by agreement and program. For a tenancy at will, notice is generally 30 days or one rental period, whichever is longer. A fixed-term lease generally cannot be changed during its term without agreement; subsidized housing may have additional rules.

**Retaliation:** A landlord cannot retaliate against tenants for protected activity such as reporting code violations, organizing with other tenants or exercising legal rights. Contact legal aid if you need help.`,
        sources: [
          { name: 'Mass Legal Help', url: 'https://www.masslegalhelp.org/housing' },
          { name: 'Mass.gov', url: 'https://www.mass.gov/info-details/massachusetts-law-about-winter-heating' },
          { name: 'Greater Boston Legal Services', url: 'https://www.gbls.org' },
        ],
      },
      {
        key: 'eviction',
        q: t('faq.q.eviction'),
        a: `If you are behind on rent or facing eviction, contact a housing or legal aid organization promptly. Programs have eligibility rules and funding may change.

**Help with housing costs:**
1. **RAFT (Residential Assistance for Families in Transition)** can provide up to $7,000 per 12-month period for eligible housing emergencies, including rent, utilities, moving costs or mortgage payments. The state lists income below 50% AMI, or below 60% for households at risk of domestic violence, among its criteria. Ask the administering agency to confirm your eligibility.
- Apply online through the state's Housing Help Hub. For rental assistance, the landlord must also submit an application; the state says it must be submitted within 21 days or the application times out.
- Metro Housing|Boston: (617) 425-6700. Call 2-1-1 for basic RAFT questions; 2-1-1 is not the application itself.

2. **Greater Boston Legal Services** provides free civil legal help to eligible residents. Housing intake (except shelter matters): (617) 603-1807, Monday–Friday 9am–5pm. Main office: (617) 371-1234. Representation is not guaranteed.

3. **City Life / Vida Urbana** offers tenant organizing and guidance. Call (617) 524-3541 for current meeting information.

4. **Boston Office of Housing Stability** can help with housing crises: (617) 635-4200, Monday–Friday 9am–5pm.

**If you receive an eviction notice:**
- A notice to quit does not by itself require you to leave; a landlord cannot forcibly remove you without a court order.
- Read court papers, meet the response deadlines and attend court dates. Ask legal aid about your options, including a jury request.
- Seek rental assistance and legal help promptly. This information is not individual legal advice.`,
        sources: [
          { name: 'RAFT Program', url: 'https://www.mass.gov/how-to/apply-for-raft-emergency-help-for-housing-costs' },
          { name: 'Greater Boston Legal Services', url: 'https://www.gbls.org/about-us/locations-and-directions' },
          { name: 'City Life / Vida Urbana', url: 'https://www.clvu.org' },
          { name: 'Boston Office of Housing Stability', url: 'https://www.boston.gov/departments/housing/office-housing-stability' },
          { name: 'Mass.gov', url: 'https://www.mass.gov/info-details/tenants-guide-to-eviction' },
        ],
      },
      {
        key: 'ami',
        q: t('faq.q.ami'),
        a: `**AMI (Area Median Income)** is an area income benchmark used to set limits for many affordable-housing programs. HUD estimates median family income and publishes limits by area and household size; agencies and programs can calculate their limits differently.

**Example, not a guarantee of eligibility:** For FY2026, HUD lists median family income of $164,600 for the Boston-Cambridge-Quincy HUD metro area. Its four-person limits include $85,700 at 50% and $137,100 at 80%. Boston's 2026 schedule lists $171,400 at 100% for a four-person household. These are different published measures; they are not rents. Income limits change, and the listing's rules and household size matter.

Use the site's income tools as a starting point, then check the current official table and the specific listing. Only the program or property manager can determine eligibility.

**Income:** Applications may ask about wages, salaries, tips, Social Security, SSI/SSDI, unemployment, child support, interest and retirement income. Rules for exclusions, assets and student assistance vary by program; ask the administering agency rather than assuming an item is excluded.`,
        sources: [
          { name: 'HUD User Income Limits', url: 'https://www.huduser.gov/portal/datasets/il.html' },
          { name: 'City of Boston', url: 'https://www.boston.gov/income-restricted-housing-guide' },
        ],
      },
    ],
  },
  {
    id: 'food',
    name: t('faq.topic.food'),
    faqs: [
      {
        key: 'food',
        q: t('faq.q.food'),
        a: `There are many free food resources in Dorchester. Here are the main options:

**Food options (call to confirm):**

1. **Codman Square Community Market** (the health centre's pantry)
   - 450 Washington St, Dorchester — half a mile up Washington Street from the health centre
   - The market page lists Tuesday 8am-1pm, Wednesday 2-7pm and Thursday 8am-1pm; another Codman page lists different hours.
   - Choice-based shopping. Call to confirm current hours, visit frequency, and ID or address requirements.
   - (617) 825-9660

2. **Salvation Army Kroc Center**
   - 650 Dudley St, Dorchester
   - Emergency pantry: 2nd and 4th Tuesday of the month, 10am-12pm, by appointment only
   - Call (617) 318-6940 to book; appointments once a month
   - (617) 318-6900 main line

3. **Fair Foods $2 Bag at Lena Park**
   - 150 American Legion Hwy, Dorchester
   - Codman's food-resource page lists Tuesdays 2-4:30pm, with a requested $2 per bag.
   - Call to confirm the current schedule, availability, price and requirements.
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
          { name: 'Codman Square Community Market', url: 'https://www.codman.org/wellness-resource/food-pantry/' },
          { name: 'Codman food resources', url: 'https://www.codman.org/patient-resource/food-resources/' },
          { name: 'Salvation Army Kroc Center', url: 'https://easternusa.salvationarmy.org/boston-kroc/help/' },
          { name: 'Greater Boston Food Bank', url: 'https://www.gbfb.org/need-food/' },
          { name: 'Project Bread', url: 'https://projectbread.org/get-help' },
        ],
      },
      {
        key: 'snap',
        q: t('faq.q.snap'),
        a: `**SNAP** (Supplemental Nutrition Assistance Program) provides monthly benefits to buy groceries.

**How to apply:**
1. Online: DTAConnect.com
2. By phone: (877) 382-2363
3. In person: visit a local DTA office

**Who may qualify:**
- For many Massachusetts households, the gross income guideline is 200% of the federal poverty level. In 2026 that is about $5,500 a month for a household of 4.
- Households with a member age 60 or older or with a disability may qualify under different rules. Many households have no asset test.
- Eligibility also depends on household circumstances and other rules. Working households may qualify; DTA makes the decision.

**Information and proof:**
- DTA may request proof of identity, Massachusetts residence and income, plus other documents that apply to your situation.
- People applying generally need a Social Security number or proof they have applied for one. DTA can help if you do not have the requested documents; a photo ID is not the only way to prove identity.

**Maximum monthly benefit** (USDA, 1 October 2026 – 30 September 2027, Massachusetts):

| Household size | Monthly maximum |
|---------------|-----------------|
| 1 | $306 |
| 2 | $562 |
| 3 | $808 |
| 4 | $1,023 |
| 5 | $1,217 |

The maximum is not a guaranteed payment. Benefits depend on household size, income, deductions and program rules. Ask DTA for your determination.

**Processing time:**
- A decision is generally due within 30 days.
- Some households qualify for expedited benefits within 7 days, based on income, resources and expenses.

**Use SNAP for eligible groceries** at participating supermarkets, convenience stores, farmers markets, and online retailers including Amazon and Walmart. Some farmers markets have additional incentives; ask the market about its current program.`,
        sources: [
          { name: 'Massachusetts DTA', url: 'https://www.mass.gov/snap' },
          { name: 'DTAConnect', url: 'https://dtaconnect.eohhs.mass.gov' },
          { name: 'USDA SNAP', url: 'https://www.fna.usda.gov/snap/allotment/cola' },
        ],
      },
      {
        key: 'wic',
        q: t('faq.q.wic'),
        a: `**WIC** (Women, Infants, and Children) offers free nutrition support, food benefits, breastfeeding support and health referrals to eligible Massachusetts families.

**Who may qualify:**
- Pregnant people; people up to 6 months postpartum, or up to 12 months if breastfeeding; infants and children under 5. A parent or guardian can apply for an eligible child.
- You must live in Massachusetts and have a nutritional need, which WIC staff can help determine.
- Income guidelines depend on household size. For 11 June 2026 – 30 June 2027, the guideline for a household of 4 is $61,050 per year. SNAP, TAFDC and certain MassHealth plans can establish income eligibility; other program conditions still apply. Ask WIC to check your situation.

**What WIC can provide:**
- Food benefits for eligible items such as milk, cheese, yogurt, eggs, whole grains, fruits, vegetables, beans, peanut butter, baby food and formula. The food package depends on the participant.
- Breastfeeding support, nutrition education and referrals for health care and other services.

**How to apply:**
1. Start at mass.gov/wic or call (800) 942-1007 to find a WIC office and make an appointment.
2. Ask the office what proof of identity, Massachusetts residence and income to bring. If documents are difficult to obtain, ask the office for help.

**Dorchester WIC contacts:**
- Codman Square WIC: (617) 825-3822
- DotHouse Health WIC: (617) 825-0805`,
        sources: [
          { name: 'Massachusetts WIC', url: 'https://www.mass.gov/wic' },
          { name: 'Mass.gov', url: 'https://www.mass.gov/info-details/check-eligibility-for-wic' },
        ],
      },
    ],
  },
  {
    id: 'healthcare',
    name: t('faq.topic.health'),
    faqs: [
      {
        key: 'masshealth',
        q: t('faq.q.masshealth'),
        a: `**MassHealth** is the Massachusetts Medicaid program. It offers health coverage to eligible residents; benefits and costs depend on the coverage type.

**Who may qualify:**
- Coverage types have different rules for adults, children, pregnant people, older adults and people with disabilities. Eligibility can depend on income, household size, residency, immigration status and other factors.
- For example, CarePlus is for some adults ages 21–64 who meet its rules; its income standard uses modified adjusted gross income at or below 133% of the federal poverty level, with applicable adjustments. Other coverage may have different limits.
- Coverage options for non-citizens differ. Ask an enrollment specialist about your situation rather than assuming you cannot get help.

**How to apply:**
1. Many individuals and families can start online at mahealthconnector.org. People age 65 or older and those needing long-term care may use a different application; ask MassHealth which form to use.
2. Call MassHealth: (800) 841-2900; TTY: 711.
3. Ask a community health center or enrollment counselor for help. Health Care For All's free multilingual HelpLine is (800) 272-4232.

You may be asked for household and income information, Massachusetts residence, existing insurance, Social Security numbers for applicants if available, and citizenship or immigration information. MassHealth may request additional documents. Processing can take weeks; respond to requests by their deadlines.

**Local help:** Codman Square Health Center's insurance enrollment team: (617) 822-8162. Call ahead to ask about appointments and documents.`,
        sources: [
          { name: 'MA Health Connector', url: 'https://www.mahealthconnector.org' },
          { name: 'Mass.gov', url: 'https://www.mass.gov/how-to/apply-for-masshealth-the-health-safety-net-or-the-childrens-medical-security-plan' },
          { name: 'Health Care For All', url: 'https://hcfama.org/hcfas-helpline/' },
        ],
      },
    ],
  },
  {
    id: 'employment',
    name: t('faq.topic.jobs'),
    faqs: [
      {
        key: 'training',
        q: t('faq.q.training'),
        a: `These organizations offer job-search help or training for people in and around Dorchester. Programs, eligibility and openings vary; contact them before applying.

**MassHire Boston ABCD Career Center:** Free job-search resources, career guidance and training information. Career advisors are available by appointment at ABCD neighborhood sites, including Dorchester. Call (617) 442-2791.

**JVS Boston:** Free job-training programs and English-and-employment services for eligible immigrants and refugees. See jvs-boston.org or call (617) 399-3131.

**Year Up United:** Tuition-free Career Pathways training for eligible young adults ages 18–29, with an educational stipend and access to internships. Check current offerings at yearupunited.org.

**Boston youth opportunities:** The City's futureBOS hub lists youth jobs, including SuccessLink opportunities, for Boston youth and young adults ages 14–24. Individual positions have their own rules and schedules. Visit boston.gov/departments/youth-employment-and-opportunity or call (617) 635-4202.`,
        sources: [
          { name: 'MassHire', url: 'https://www.mass.gov/locations/masshire-boston-abcd-career-center' },
          { name: 'JVS Boston', url: 'https://www.jvs-boston.org/our-services/build-your-skills/' },
          { name: 'Year Up United', url: 'https://www.yearupunited.org/how-it-works' },
          { name: 'Boston Youth Employment', url: 'https://www.boston.gov/departments/youth-employment-and-opportunity' },
        ],
      },
      {
        key: 'unemployment',
        q: t('faq.q.unemployment'),
        a: `**Massachusetts Unemployment Insurance (UI)** provides temporary income to some workers who lose their jobs or have hours significantly reduced through no fault of their own.

**Eligibility:** Applicants generally must be authorized to work, able and available to work, and actively seeking work. Wage requirements include at least $6,300 in the applicable base period and at least 30 times the weekly benefit amount; other rules and exceptions apply. The Department of Unemployment Assistance (DUA) decides eligibility.

**Apply:** File online through mass.gov/unemployment or call DUA at (877) 626-6800; voice relay 711. Have your Social Security number, contact details and recent employer information ready. Ask DUA what else is needed.

**Benefits:** The weekly amount is generally about 50% of average weekly wages, up to the legal maximum. As of October 4, 2026, that maximum is $1,154 per week; it can change. Some eligible claimants may receive a dependent allowance. The current maximum duration is 30 weeks, but individual claims may be shorter and rules may change.

After applying, request benefits and certify each week as instructed, including work-search information when required. Report earnings and respond to DUA requests on time.`,
        sources: [
          { name: 'Mass.gov', url: 'https://www.mass.gov/info-details/unemployment-insurance-eligibility' },
          { name: 'Mass.gov', url: 'https://www.mass.gov/info-details/how-unemployment-insurance-benefits-are-determined' },
          { name: 'MA Unemployment', url: 'https://www.mass.gov/how-to/apply-for-unemployment-insurance-benefits' },
        ],
      },
    ],
  },
  {
    id: 'utilities',
    name: t('faq.topic.utilities'),
    faqs: [
      {
        key: 'utilities',
        q: t('faq.q.utilities'),
        a: `**Home Energy Assistance (HEAP / LIHEAP)** helps eligible Massachusetts households pay part of their primary heating costs. Homeowners and renters may apply, including when heat is included in rent. Eligibility depends on household size, gross income and other rules; the income guideline is at or below 60% of estimated state median income. Benefits and funding vary.

The heating assistance period is November 1 through April 30. Apply at mass.gov/heatinghelp or contact ABCD Fuel Assistance for Boston at (617) 357-6012. Ask about current deadlines and required documents.

**Other help:** Ask your utility about income-eligible discounts, payment plans and any arrearage-forgiveness program. Some enrollments may be automatic, but do not assume a discount is applied: check your bill or call. Eversource: (800) 592-2000; National Grid Massachusetts electric: (800) 322-3223. For other assistance, call 2-1-1.

**Shutoff protections:** For regulated gas and electric service needed for heat, financial hardship can qualify a household for winter protection from November 15 to March 15. Other protections may apply, for example when a household member is seriously ill, an infant lives in the home, or all residents are 65 or older; rules and documentation differ. Contact your utility promptly to ask about protection and restoration. Protection does not erase the bill; amounts owed still need to be paid.`,
        sources: [
          { name: 'Mass.gov', url: 'https://www.mass.gov/how-to/apply-for-home-energy-assistance-heap' },
          { name: 'ABCD', url: 'https://bostonabcd.org/service/fuel-assistance/' },
          { name: 'Mass.gov', url: 'https://www.mass.gov/info-details/when-am-i-protected-from-having-my-utilities-shut-off' },
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

  const getAnswer = (faq: { key: string; a: string }) => {
    let translated: string | undefined;
    if (lang === 'es') translated = SPANISH_FAQ_ANSWERS[faq.key];
    else if (lang !== 'en') {
      if (faq.key === 'food') translated = FOOD_FAQ_ANSWERS[lang];
      else if (faq.key === 'snap') translated = SNAP_FAQ_ANSWERS[lang];
      else if (faq.key === 'eviction') translated = EVICTION_FAQ_ANSWERS[lang];
      else if (faq.key === 'wic') translated = WIC_FAQ_ANSWERS[lang];
      else if (faq.key === 'rights') translated = RIGHTS_FAQ_ANSWERS[lang];
      else if (faq.key === 'ami') translated = AMI_FAQ_ANSWERS[lang];
      else if (faq.key === 'masshealth') translated = MASSHEALTH_FAQ_ANSWERS[lang];
      else if (faq.key === 'training') translated = TRAINING_FAQ_ANSWERS[lang];
      else if (faq.key === 'unemployment') translated = UNEMPLOYMENT_FAQ_ANSWERS[lang];
      else if (faq.key === 'utilities') translated = UTILITIES_FAQ_ANSWERS[lang];
      else translated = OTHER_FAQ_ANSWERS[lang]?.[faq.key];
    }
    return { text: translated ?? faq.a, language: translated ? lang : 'en', fellBack: lang !== 'en' && !translated };
  };

  const filteredCategories = FAQ_CATEGORIES.filter(cat =>
    selectedCategory === 'all' || cat.id === selectedCategory
  );

  const searchResults = searchQuery.length > 2
    ? FAQ_CATEGORIES.flatMap(cat =>
        cat.faqs.filter(faq =>
          faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
          getAnswer(faq).text.toLowerCase().includes(searchQuery.toLowerCase())
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
            {t('faq.title')}
          </h1>
          <p className="text-[var(--color-text-muted)] font-body max-w-2xl">
            {t('faq.description')}
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {t('faq.introDetail')}
          </p>
        </header>
        {lang !== 'en' && (
          <p role="note" className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {t('faq.translationDraft')}
          </p>
        )}

        {/* Emergency Contact */}
        <Card className="bg-[var(--color-accent-primary)]/5">
          <CardContent className="py-4 flex items-center gap-4">
            <Phone className="w-8 h-8 text-[var(--color-accent-primary)]" />
            <div>
              <p className="font-heading font-semibold">{t('faq.needNow')}</p>
              <p className="text-sm text-[var(--color-text-muted)]">
                {t('faq.callNow')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
          <input
            type="text"
            aria-label={t('faq.search')}
            placeholder={t('faq.search')}
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
              {t('common.results', { count: searchResults.length })} · {t('search.resultsFor', { term: searchQuery })}
            </p>
            {searchResults.map((faq, idx) => (
              <Card key={idx} className="overflow-hidden">
                <button
                  aria-expanded={expandedFAQs.includes(`search-${idx}`)}
                  onClick={() => toggleFAQ(`search-${idx}`)}
                  className="w-full p-4 text-start flex items-center gap-3"
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
                    {getAnswer(faq).fellBack && <p className="text-xs text-[var(--color-text-muted)]">{t('lang.untranslated', { language: meta.nativeName })}</p>}
                    <div lang={getAnswer(faq).language} dir={getAnswer(faq).language === 'ar' ? 'rtl' : 'ltr'}
                      className="text-[var(--color-text-secondary)] whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: getAnswer(faq).text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
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
                {t('faq.allTopics')}
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
                            aria-expanded={isExpanded}
                            onClick={() => toggleFAQ(faqId)}
                            className="w-full p-4 text-start flex items-center gap-3 hover:bg-[var(--color-bg-tertiary)] transition-colors"
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
                                {getAnswer(faq).fellBack && <p className="text-xs text-[var(--color-text-muted)]">{t('lang.untranslated', { language: meta.nativeName })}</p>}
                                <div lang={getAnswer(faq).language} dir={getAnswer(faq).language === 'ar' ? 'rtl' : 'ltr'}
                                  className="text-[var(--color-text-secondary)] whitespace-pre-wrap text-sm leading-relaxed"
                                  dangerouslySetInnerHTML={{
                                    __html: getAnswer(faq).text
                                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                      .replace(/\n/g, '<br>')
                                  }}
                                />
                              </div>
                              {faq.sources && faq.sources.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                                  <p className="text-xs text-[var(--color-text-muted)] mb-2">{t('common.sources')}:</p>
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
          {t('note.faq')}
        </ProjectNote>
      </motion.div>
    </MainLayout>
  );
}
