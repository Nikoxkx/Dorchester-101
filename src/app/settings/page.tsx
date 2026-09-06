'use client';

import { useState, useEffect } from 'react';
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
  Bell,
  Trash2,
  Plus,
  X,
  Rss,
  MapPin,
  Newspaper,
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

// News source options
const AVAILABLE_NEWS_SOURCES = [
  { id: 'dorchester-reporter', name: 'Dorchester Reporter', url: 'https://www.dotnews.com/', category: 'local' },
  { id: 'boston-globe', name: 'Boston Globe', url: 'https://www.bostonglobe.com/', category: 'regional' },
  { id: 'wbur', name: 'WBUR', url: 'https://www.wbur.org/', category: 'radio' },
  { id: 'gbh-news', name: 'GBH News', url: 'https://www.wgbh.org/news', category: 'radio' },
  { id: 'boston-gov', name: 'Boston.gov', url: 'https://www.boston.gov/news', category: 'government' },
  { id: 'bpda', name: 'BPDA', url: 'https://www.bostonplans.org/news', category: 'planning' },
  { id: 'mass-live', name: 'Mass Live', url: 'https://www.masslive.com/', category: 'regional' },
  { id: 'boston-herald', name: 'Boston Herald', url: 'https://www.bostonherald.com/', category: 'regional' },
];

// Transit options
const AVAILABLE_TRANSIT_SOURCES = [
  { id: 'mbta', name: 'MBTA Alerts', url: 'https://www.mbta.com/alerts', enabled: true },
  { id: 'commuter-rail', name: 'Commuter Rail Status', url: 'https://www.mbta.com/schedules/commuter-rail', enabled: true },
];

const NEWS_SOURCES_KEY = 'dor101-news-sources';
const TRANSIT_ENABLED_KEY = 'dor101-transit-enabled';
const NOTIFICATIONS_ENABLED_KEY = 'dor101-notifications-enabled';
const AUTO_REFRESH_KEY = 'dor101-auto-refresh';
const MAP_STYLE_KEY = 'dor101-map-style';

export default function SettingsPage() {
  const { 
    theme, setTheme, 
    language, setLanguage, 
    fontSize, setFontSize,
    reduceMotion, setReduceMotion,
    lastUpdated,
  } = useAppStore();

  // Custom settings state
  const [selectedNewsSources, setSelectedNewsSources] = useState<string[]>([]);
  const [enabledTransit, setEnabledTransit] = useState<string[]>(['mbta', 'commuter-rail']);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(5); // minutes
  const [mapStyle, setMapStyle] = useState<'satellite' | 'street' | 'hybrid'>('satellite');
  const [showAddSource, setShowAddSource] = useState(false);
  const [customNewsUrl, setCustomNewsUrl] = useState('');

  // Load settings from localStorage
  useEffect(() => {
    // Load news sources
    const storedNewsSources = localStorage.getItem(NEWS_SOURCES_KEY);
    if (storedNewsSources) {
      setSelectedNewsSources(JSON.parse(storedNewsSources));
    } else {
      setSelectedNewsSources(AVAILABLE_NEWS_SOURCES.map(s => s.id));
    }

    // Load transit
    const storedTransit = localStorage.getItem(TRANSIT_ENABLED_KEY);
    if (storedTransit) {
      setEnabledTransit(JSON.parse(storedTransit));
    }

    // Load other settings
    const storedNotifications = localStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
    if (storedNotifications !== null) {
      setNotificationsEnabled(JSON.parse(storedNotifications));
    }

    const storedAutoRefresh = localStorage.getItem(AUTO_REFRESH_KEY);
    if (storedAutoRefresh !== null) {
      setAutoRefresh(JSON.parse(storedAutoRefresh));
    }

    const storedMapStyle = localStorage.getItem(MAP_STYLE_KEY) as 'satellite' | 'street' | 'hybrid' | null;
    if (storedMapStyle) {
      setMapStyle(storedMapStyle);
    }
  }, []);

  // Save functions
  const saveNewsSources = (sources: string[]) => {
    setSelectedNewsSources(sources);
    localStorage.setItem(NEWS_SOURCES_KEY, JSON.stringify(sources));
  };

  const saveTransit = (transit: string[]) => {
    setEnabledTransit(transit);
    localStorage.setItem(TRANSIT_ENABLED_KEY, JSON.stringify(transit));
  };

  const toggleNewsSource = (sourceId: string) => {
    const newSources = selectedNewsSources.includes(sourceId)
      ? selectedNewsSources.filter(s => s !== sourceId)
      : [...selectedNewsSources, sourceId];
    saveNewsSources(newSources);
  };

  const toggleTransit = (transitId: string) => {
    const newTransit = enabledTransit.includes(transitId)
      ? enabledTransit.filter(t => t !== transitId)
      : [...enabledTransit, transitId];
    saveTransit(newTransit);
  };

  const addCustomNewsSource = () => {
    if (customNewsUrl && !selectedNewsSources.includes(customNewsUrl)) {
      saveNewsSources([...selectedNewsSources, `custom-${customNewsUrl}`]);
      setCustomNewsUrl('');
      setShowAddSource(false);
    }
  };

  const removeNewsSource = (sourceId: string) => {
    saveNewsSources(selectedNewsSources.filter(s => s !== sourceId));
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all saved data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

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

        {/* Custom News Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-[var(--color-accent-primary)]" />
              News Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              Choose which news sources to display. Selected sources will fetch news automatically.
            </p>
            <div className="space-y-2">
              {AVAILABLE_NEWS_SOURCES.map((source) => (
                <label
                  key={source.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--color-bg-tertiary)] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedNewsSources.includes(source.id)}
                      onChange={() => toggleNewsSource(source.id)}
                      className="w-4 h-4 rounded border-[var(--color-border)]"
                    />
                    <div>
                      <p className="font-heading font-medium text-sm">{source.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{source.url}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-[var(--color-bg-tertiary)] rounded">
                    {source.category}
                  </span>
                </label>
              ))}
            </div>
            
            {/* Custom URL */}
            {showAddSource ? (
              <div className="flex gap-2 p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
                <input
                  type="url"
                  value={customNewsUrl}
                  onChange={(e) => setCustomNewsUrl(e.target.value)}
                  placeholder="https://example.com/rss"
                  className="flex-1 px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
                />
                <Button variant="primary" size="sm" onClick={addCustomNewsSource}>Add</Button>
                <Button variant="secondary" size="sm" onClick={() => setShowAddSource(false)}>Cancel</Button>
              </div>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => setShowAddSource(true)} leftIcon={<Plus className="w-4 h-4" />}>
                Add Custom RSS Feed
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[var(--color-accent-amber)]" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--color-bg-tertiary)] cursor-pointer">
              <div>
                <p className="font-heading font-medium">Enable Notifications</p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Receive alerts about housing deadlines, transit issues, and community updates
                </p>
              </div>
              <button
                onClick={() => {
                  setNotificationsEnabled(!notificationsEnabled);
                  localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, JSON.stringify(!notificationsEnabled));
                }}
                className={cn(
                  'w-12 h-6 rounded-full transition-colors relative',
                  notificationsEnabled ? 'bg-[var(--color-accent-primary)]' : 'bg-[var(--color-border)]'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                    notificationsEnabled ? 'left-7' : 'left-1'
                  )}
                />
              </button>
            </label>
          </CardContent>
        </Card>

        {/* Auto Refresh */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rss className="w-5 h-5 text-[var(--color-accent-green)]" />
              Data Refresh
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--color-bg-tertiary)] cursor-pointer">
              <div>
                <p className="font-heading font-medium">Auto-refresh Data</p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Automatically fetch latest information at regular intervals
                </p>
              </div>
              <button
                onClick={() => {
                  setAutoRefresh(!autoRefresh);
                  localStorage.setItem(AUTO_REFRESH_KEY, JSON.stringify(!autoRefresh));
                }}
                className={cn(
                  'w-12 h-6 rounded-full transition-colors relative',
                  autoRefresh ? 'bg-[var(--color-accent-primary)]' : 'bg-[var(--color-border)]'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                    autoRefresh ? 'left-7' : 'left-1'
                  )}
                />
              </button>
            </label>
            
            {autoRefresh && (
              <div>
                <label className="block text-sm font-heading font-medium mb-2">
                  Refresh Interval (minutes)
                </label>
                <select
                  value={autoRefreshInterval}
                  onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]"
                >
                  <option value={1}>1 minute</option>
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                </select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transit Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[var(--color-accent-primary)]" />
              Transit & Maps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-heading font-medium mb-2">Map Style</label>
              <div className="flex gap-2">
                {[
                  { id: 'satellite' as const, label: 'Satellite' },
                  { id: 'street' as const, label: 'Street' },
                  { id: 'hybrid' as const, label: 'Hybrid' },
                ].map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => {
                      setMapStyle(id);
                      localStorage.setItem(MAP_STYLE_KEY, id);
                    }}
                    className={cn(
                      'flex-1 p-3 rounded-lg text-center',
                      'border transition-colors font-heading',
                      mapStyle === id
                        ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 font-medium'
                        : 'border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-heading font-medium mb-2">Enabled Transit Sources</label>
              {AVAILABLE_TRANSIT_SOURCES.map((transit) => (
                <label
                  key={transit.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-bg-tertiary)] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={enabledTransit.includes(transit.id)}
                    onChange={() => toggleTransit(transit.id)}
                    className="w-4 h-4 rounded border-[var(--color-border)]"
                  />
                  <span className="font-heading font-medium text-sm">{transit.name}</span>
                </label>
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

        {/* Clear Data */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Clear All Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              This will reset all settings, read notifications, and saved preferences. This action cannot be undone.
            </p>
            <Button variant="danger" onClick={clearAllData}>
              Clear All Data
            </Button>
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
                Version 1.2.0
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
