'use client';

import { motion, type Variants } from 'framer-motion';
import { FileText } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

const pv: Variants = { initial: { opacity: 0, y: 20 }, enter: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function TermsPage() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  
  return (
    <MainLayout>
      <motion.div variants={pv} initial="initial" animate="enter" className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="font-display text-3xl font-bold flex items-center gap-3">
            <FileText className="w-8 h-8 text-[var(--color-accent-primary)]" />
            Terms of Use
          </h1>
          <p className="text-[var(--color-text-muted)]">Last updated: June 5, 2026</p>
        </header>

        <Card>
          <CardContent className="py-6 prose prose-sm max-w-none text-[var(--color-text-secondary)] space-y-6">
            <section>
              <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">1. Acceptance of Terms</h2>
              <p>By accessing or using DOR101 (&ldquo;the Application&rdquo;), you agree to these Terms of Use. DOR101 is a free, open-source community resource application. No account, registration, or acceptance of terms is required to use the application — it is freely available to everyone.</p>
            </section>

            <section>
              <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">2. Description of Service</h2>
              <p>DOR101 provides aggregated, publicly available information about housing, food assistance, healthcare, legal aid, transit, and community services in Dorchester, Boston, Massachusetts. The application is designed as an informational resource and does not provide professional advice.</p>
            </section>

            <section>
              <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">3. No Cost</h2>
              <p>DOR101 is completely free. There are no fees, subscriptions, in-app purchases, advertisements, or premium tiers. There never will be.</p>
            </section>

            <section>
              <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">4. Accuracy of Information</h2>
              <p>We make every effort to ensure that the information presented in DOR101 is accurate and up-to-date. All data is sourced from official government agencies, verified community organizations, and public data sources. However:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Information may change between our verification cycles</li>
                <li>We are not responsible for errors in source data from third-party organizations</li>
                <li>Always verify critical information (such as application deadlines, eligibility requirements, and waitlist status) directly with the relevant organization</li>
                <li>DOR101 is an informational tool, not a substitute for professional legal, financial, or medical advice</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">5. Not Legal or Financial Advice</h2>
              <p>The information provided by DOR101, including tenant rights information, financial calculators, and eligibility tools, is for general informational purposes only. It does not constitute legal advice, financial advice, or professional guidance. For specific legal questions, contact Greater Boston Legal Services at (617) 603-1700.</p>
            </section>

            <section>
              <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">6. Third-Party Links</h2>
              <p>DOR101 contains links to external websites and resources operated by third parties (government agencies, community organizations, etc.). We do not control these external sites and are not responsible for their content, accuracy, or privacy practices. Links are provided for convenience and do not imply endorsement.</p>
            </section>

            <section>
              <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">7. Intellectual Property</h2>
              <p>DOR101 is open-source software released under the MIT License. You are free to use, modify, and distribute the software in accordance with the license terms. The DOR101 name and logo are used to identify this specific community project.</p>
            </section>

            <section>
              <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">8. Limitation of Liability</h2>
              <p>DOR101 is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind. To the fullest extent permitted by law, the DOR101 project and its contributors shall not be liable for any damages arising from the use or inability to use the application, including but not limited to reliance on information presented in the application.</p>
            </section>

            <section>
              <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">9. Accessibility</h2>
              <p>DOR101 is committed to accessibility and strives to meet WCAG 2.1 Level AA standards. The application supports keyboard navigation, screen readers, adjustable font sizes, high contrast modes, and reduced motion preferences. If you encounter accessibility barriers, please report them through our GitHub repository.</p>
            </section>

            <section>
              <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">10. Changes to Terms</h2>
              <p>We may update these terms from time to time. The &ldquo;Last updated&rdquo; date at the top reflects the most recent revision. Continued use of the application after changes constitutes acceptance of the revised terms.</p>
            </section>

            <section>
              <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">11. Governing Law</h2>
              <p>These terms are governed by the laws of the Commonwealth of Massachusetts, United States of America.</p>
            </section>
          </CardContent>
        </Card>
      </motion.div>
    </MainLayout>
  );
}
