'use client';

import { motion, type Variants } from 'framer-motion';
import { Shield } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

const pv: Variants = { initial: { opacity: 0, y: 20 }, enter: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function PrivacyPage() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  
  return (
    <MainLayout>
      <motion.div variants={pv} initial="initial" animate="enter" className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="font-display text-3xl font-bold flex items-center gap-3">
            <Shield className="w-8 h-8 text-[var(--color-accent-primary)]" />
            Privacy Policy
          </h1>
          <p className="text-[var(--color-text-muted)]">Last updated: June 5, 2026</p>
        </header>

        <Card>
          <CardContent className="py-6 prose prose-sm max-w-none text-[var(--color-text-secondary)] space-y-6">
            <section>
              <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">1. Overview</h2>
              <p>DOR101 (&ldquo;the Application&rdquo;) is a free community resource tool for Dorchester, Boston residents. It is built and run by one person, Yeisbel, and this Privacy Policy explains how I handle information when you use the application.</p>
              <p className="font-semibold text-[var(--color-accent-green)]">The short version: I collect absolutely no personal data. None. Zero.</p>
            </section>

            <section>
              <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">2. Information I Do NOT Collect</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>I do NOT collect your name, email, phone number, or any personal identifiers</li>
                <li>I do NOT require account creation or login</li>
                <li>I do NOT use cookies for tracking purposes</li>
                <li>I do NOT use analytics services (no Google Analytics, Mixpanel, Sentry, etc.)</li>
                <li>I do NOT use advertising networks or ad trackers</li>
                <li>I do NOT collect location data from your device</li>
                <li>I do NOT collect usage patterns, click data, or behavioral analytics</li>
                <li>I do NOT share any data with third parties because I have no data to share</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">3. Local Storage</h2>
              <p>The application stores the following preferences locally on your device using your browser&apos;s localStorage. This data never leaves your device:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Language preference</strong> (e.g., English, Spanish)</li>
                <li><strong>Theme preference</strong> (light, dark, or system)</li>
                <li><strong>Font size preference</strong> (small, medium, large, extra-large)</li>
                <li><strong>Sidebar state</strong> (collapsed or expanded)</li>
              </ul>
              <p>You can clear all stored preferences at any time by clearing your browser&apos;s local storage for this site, or by using Settings → Clear All Data.</p>
            </section>

            <section>
              <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">4. External Data Requests</h2>
              <p>The application fetches publicly available data from government sources to display community resource information. These requests include:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Boston city government open data (data.boston.gov)</li>
                <li>MBTA public transit data (api-v3.mbta.com)</li>
                <li>Map tiles from ESRI and CARTO (satellite imagery and labels)</li>
                <li>Google Fonts for typography</li>
              </ul>
              <p>These services have their own privacy policies. I do not control and cannot see any data these services may collect about requests made to their servers.</p>
            </section>

            <section>
              <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">5. Service Worker & Offline Support</h2>
              <p>If installed as a desktop application, DOR101 uses a service worker to cache application files and API responses on your device for offline access. This cached data is stored locally and is never transmitted elsewhere. You can clear the cache at any time through your browser settings.</p>
            </section>

            <section>
              <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">6. Children&apos;s Privacy</h2>
              <p>DOR101 does not knowingly collect any information from anyone, including children under 13. Since I collect no data, there is no data to protect. The application is safe for use by all ages.</p>
            </section>

            <section>
              <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">7. Changes to This Policy</h2>
              <p>If I ever change this privacy policy, I will update the &ldquo;Last updated&rdquo; date at the top of this page. Any significant changes will be shown in the application.</p>
            </section>

            <section>
              <h2 className="font-heading font-semibold text-lg text-[var(--color-text-primary)]">8. Contact</h2>
              <p>If you have questions about this privacy policy, you can reach me through the project&apos;s GitHub repository or by contacting any of the community organizations listed in the resource directory.</p>
            </section>

            <section className="bg-[var(--color-accent-green)]/10 p-4 rounded-lg">
              <h3 className="font-heading font-semibold text-[var(--color-accent-green)]">My commitment</h3>
              <p className="text-sm mt-2">I built DOR101 for a community that has historically been subjected to surveillance and exploitation of personal data. I believe privacy is a fundamental right, and I designed this application to prove that a useful community tool can exist without compromising anyone&apos;s privacy.</p>
            </section>
          </CardContent>
        </Card>
      </motion.div>
    </MainLayout>
  );
}
