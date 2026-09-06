'use client';

import { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Newspaper, ExternalLink, Clock, Bookmark, RefreshCw, AlertCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner, DataRefreshIndicator } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  category: string;
  publishedAt: string;
  isVerified: boolean;
}

const categories = ['All', 'Housing', 'Development', 'Food Security', 'Healthcare', 'Transportation', 'Employment', 'Community'];

export default function NewsPage() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bookmarked, setBookmarked] = useState<string[]>([]);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news');
      const data = await response.json();
      setArticles(data.articles || []);
      setLastUpdated(new Date().toLocaleTimeString());
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching news:', error);
      setIsLoading(false);
    }
  };

  const filteredArticles = articles.filter(
    article => selectedCategory === 'All' || article.category === selectedCategory
  );

  const toggleBookmark = (id: string) => {
    setBookmarked(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) {
      return t('news.justNow', 'Just now');
    } else if (diffHours < 24) {
      return `${diffHours} ${t('news.hoursAgo', 'hours ago')}`;
    } else if (diffDays === 1) {
      return t('news.yesterday', 'Yesterday');
    } else if (diffDays < 7) {
      return `${diffDays} ${t('news.daysAgo', 'days ago')}`;
    } else {
      return date.toLocaleDateString(language === 'es' ? 'es-ES' : language === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const isNew = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    return diffHours < 24;
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <LoadingSpinner size="lg" text={t('news.loading', 'Loading latest news...')} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="enter"
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-display text-3xl md:text-4xl font-bold flex items-center gap-3">
              <Newspaper className="w-8 h-8 text-[var(--color-accent-primary)]" />
              {t('news.title', 'News & Updates')}
            </h1>
            <p className="text-[var(--color-text-muted)] font-body">
              {t('news.description', 'Latest news affecting Dorchester housing, food access, and community services.')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <DataRefreshIndicator lastUpdated={lastUpdated} isRefreshing={isLoading} />
            <button
              onClick={fetchNews}
              className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors"
              title={t('common.retry', 'Refresh')}
            >
              <RefreshCw className={cn('w-5 h-5', isLoading && 'animate-spin')} />
            </button>
          </div>
        </header>

        {/* Live indicator */}
        <Card className="bg-[var(--color-accent-green)]/5 border-[var(--color-accent-green)]/20">
          <CardContent className="py-3 flex items-center gap-3">
            <motion.div
              className="w-2 h-2 rounded-full bg-[var(--color-accent-green)]"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-sm font-heading">
              <strong>{t('news.liveUpdates', 'Live Updates')}</strong> — {t('news.autoRefreshNote', 'News refreshes automatically every 5 minutes')}
            </span>
          </CardContent>
        </Card>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'px-4 py-2 rounded-lg font-heading font-medium text-sm transition-colors',
                selectedCategory === category
                  ? 'bg-[var(--color-accent-primary)] text-white'
                  : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Breaking / New */}
        {filteredArticles.some(a => isNew(a.publishedAt)) && (
          <section>
            <h2 className="font-heading font-semibold text-lg mb-3 flex items-center gap-2">
              <motion.span 
                className="w-2 h-2 bg-[var(--color-accent-secondary)] rounded-full"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              {t('news.latest24h', 'Latest (Last 24 Hours)')}
            </h2>
            <div className="space-y-4">
              {filteredArticles.filter(a => isNew(a.publishedAt)).map((article) => (
                <Card key={article.id} className="bg-[var(--color-accent-primary)]/5 border-[var(--color-accent-primary)]/20">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="red">{t('news.new', 'New')}</Badge>
                          <Badge variant="blue">{article.category}</Badge>
                          {article.isVerified && (
                            <span className="text-xs text-[var(--color-accent-green)]">✓ {t('news.verified', 'Verified')}</span>
                          )}
                        </div>
                        <h3 className="font-heading font-semibold text-lg mb-2">
                          {article.title}
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                          {article.summary}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                          <span className="font-medium">{article.source}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(article.publishedAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => toggleBookmark(article.id)}
                          className={cn(
                            'p-2 rounded-lg transition-colors',
                            bookmarked.includes(article.id)
                              ? 'text-[var(--color-accent-amber)] bg-[var(--color-accent-amber)]/10'
                              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)]'
                          )}
                        >
                          <Bookmark className="w-5 h-5" fill={bookmarked.includes(article.id) ? 'currentColor' : 'none'} />
                        </button>
                        <a
                          href={article.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* All Articles */}
        <section>
          <h2 className="font-heading font-semibold text-lg mb-3">
            {selectedCategory === 'All' ? t('news.allNews', 'All News') : `${selectedCategory} News`}
          </h2>
          <div className="space-y-3">
            {filteredArticles.filter(a => !isNew(a.publishedAt)).map((article) => (
              <Card key={article.id} hoverable>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default">{article.category}</Badge>
                        {article.isVerified && (
                          <span className="text-xs text-[var(--color-accent-green)]">✓ {t('news.verified', 'Verified')}</span>
                        )}
                      </div>
                      <h3 className="font-heading font-medium mb-1">
                        {article.title}
                      </h3>
                      <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mb-2">
                        {article.summary}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                        <span>{article.source}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(article.publishedAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => toggleBookmark(article.id)}
                        className={cn(
                          'p-2 rounded-lg transition-colors',
                          bookmarked.includes(article.id)
                            ? 'text-[var(--color-accent-amber)]'
                            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                        )}
                      >
                        <Bookmark className="w-4 h-4" fill={bookmarked.includes(article.id) ? 'currentColor' : 'none'} />
                      </button>
                      <a
                        href={article.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {filteredArticles.length === 0 && (
          <Card className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
            <p className="font-heading font-medium mb-2">{t('news.noNewsCategory', 'No news in this category')}</p>
            <p className="text-sm text-[var(--color-text-muted)]">
              {t('news.tryDifferent', 'Try selecting a different category or check back later.')}
            </p>
          </Card>
        )}

        {/* News Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('news.sources', 'News Sources')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              {t('news.sourcesDesc', 'News is aggregated from verified local and regional sources:')}
            </p>
            <div className="flex flex-wrap gap-2">
              {['Dorchester Reporter', 'Boston Globe', 'WBUR', 'GBH News', 'Boston.gov', 'BPDA'].map((source) => (
                <span key={source} className="px-3 py-1 bg-[var(--color-bg-tertiary)] rounded-full text-xs font-heading">
                  {source}
                </span>
              ))}
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-4">
              {t('news.lastRefresh', 'Last refresh')}: {lastUpdated || 'Never'} • {t('news.autoUpdates', 'Auto-updates every 5 minutes')}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </MainLayout>
  );
}
