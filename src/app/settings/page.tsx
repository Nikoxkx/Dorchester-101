'use client';

import { motion, type Variants } from 'framer-motion';
import { 
  Settings, 
  Globe, 
  Sun, 
  Moon, 
  Monitor,
  Type,
  Eye,
  Database,
  Shield,
  Info,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useAppStore, LANGUAGE_INFO, type Language, type Theme, type FontSize } from '@/stores/appStore';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function SettingsPage() {
  const { 
    theme, setTheme, 
    language, setLanguage, 
    fontSize, setFontSize,
    reduceMotion, setReduceMotion,
    lastUpdated,
  } = useAppStore();

  return (
    <MainLayout>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="enter"
        className="max-w-3xl mx-auto space-y-8"
      >
        {/* Header */}
        <header className="space-y-2">
          <h1 className="font-display text-3xl md:text-4xl font-bold flex items-center gap-3">
            <Settings className="w-8 h-8 text-[var(--color-accent-primary)]" />
            Settings
          </h1>
          <p className="text-[var(--color-text-muted)] font-body">
            Customize your DOR101 experience. Your preferences are saved locally.
          </p>
        </header>

        {/* Language */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[var(--color-accent-primary)]" />
              Language
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.entries(LANGUAGE_INFO) as [Language, typeof LANGUAGE_INFO[Language]][]).map(([code, info]) => (
                <button
                  key={code}
                  onClick={() => setLanguage(code)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg text-left',
                    'border transition-colors',
                    language === code
                      ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10'
                      : 'border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]'
                  )}
                >
                  <span className="text-2xl">{info.flag}</span>
                  <div>
                    <div className="font-heading font-medium text-sm">{info.nativeName}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">{info.name}</div>
                  </div>
                  {language === code && (
                    <CheckCircle className="w-4 h-4 text-[var(--color-accent-primary)] ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-[var(--color-accent-amber)]" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-heading font-medium mb-2">Theme</label>
              <div className="flex gap-2">
                {[
                  { id: 'light' as Theme, icon: Sun, label: 'Light' },
                  { id: 'dark' as Theme, icon: Moon, label: 'Dark' },
                  { id: 'system' as Theme, icon: Monitor, label: 'System' },
                ].map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setTheme(id)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 p-3 rounded-lg',
                      'border transition-colors',
                      theme === id
                        ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10'
                        : 'border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-heading font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-heading font-medium mb-2">
                <Type className="w-4 h-4 inline mr-2" />
                Font Size
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'small' as FontSize, label: 'Small' },
                  { id: 'medium' as FontSize, label: 'Medium' },
                  { id: 'large' as FontSize, label: 'Large' },
                  { id: 'extra-large' as FontSize, label: 'X-Large' },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setFontSize(id)}
                    className={cn(
                      'flex-1 p-3 rounded-lg text-center',
                      'border transition-colors font-heading',
                      fontSize === id
                        ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 font-medium'
                        : 'border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[var(--color-accent-green)]" />
              Accessibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--color-bg-tertiary)] cursor-pointer">
              <div>
                <p className="font-heading font-medium">Reduce Motion</p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Minimize animations and transitions
                </p>
              </div>
              <button
                onClick={() => setReduceMotion(!reduceMotion)}
                className={cn(
                  'w-12 h-6 rounded-full transition-colors relative',
                  reduceMotion ? 'bg-[var(--color-accent-primary)]' : 'bg-[var(--color-border)]'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                    reduceMotion ? 'left-7' : 'left-1'
                  )}
                />
              </button>
            </label>
          </CardContent>
        </Card>

        {/* Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[var(--color-accent-primary)]" />
              Data & Updates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
              <div>
                <p className="font-heading font-medium">Last Updated</p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {lastUpdated || 'Never'}
                </p>
              </div>
              <Button variant="secondary" size="sm">
                Refresh Now
              </Button>
            </div>
            
            <p className="text-sm text-[var(--color-text-muted)]">
              DOR101 automatically fetches updated information from Boston city data sources. 
              Data is typically refreshed every few hours.
            </p>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[var(--color-accent-green)]" />
              Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-[var(--color-accent-green)]/10 rounded-lg">
              <p className="font-heading font-medium text-[var(--color-accent-green)] mb-2">
                Your Privacy is Protected
              </p>
              <ul className="text-sm space-y-1 text-[var(--color-text-secondary)]">
                <li>• No personal data is collected or transmitted</li>
                <li>• All settings are stored locally on your device</li>
                <li>• No analytics, tracking, or advertising</li>
                <li>• No account required</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-[var(--color-accent-primary)]" />
              About DOR101
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-primary)] flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-display font-bold text-2xl">D</span>
              </div>
              <h2 className="font-display text-2xl font-bold">
                DOR<span className="text-[var(--color-accent-primary)]">101</span>
              </h2>
              <p className="text-[var(--color-text-muted)] italic">
                Your neighborhood. Your rights. Your future.
              </p>
              <p className="text-sm text-[var(--color-text-muted)] mt-2">
                Version 1.0.0
              </p>
            </div>

            <p className="text-sm text-[var(--color-text-secondary)] text-center">
              A free resource for Dorchester residents to access verified housing, food, 
              and community service information. Built with care for the community.
            </p>

            <div className="flex flex-col gap-2">
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => window.open('https://www.boston.gov', '_blank')}
                rightIcon={<ExternalLink className="w-4 h-4" />}
              >
                View Data Sources
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </MainLayout>
  );
}
