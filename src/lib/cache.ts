// In-memory cache with TTL support

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
}

// TTL settings for different data types (in milliseconds)
export const CACHE_TTL = {
  NEWS: 15 * 60 * 1000,           // 15 minutes
  MBTA: 30 * 1000,                // 30 seconds
  MARKET_DATA: 2 * 60 * 60 * 1000, // 2 hours
  NOTIFICATIONS: 5 * 60 * 1000,   // 5 minutes
  RESOURCES: 60 * 60 * 1000,      // 1 hour
  DEFAULT: 5 * 60 * 1000,         // 5 minutes
} as const;

// Cache implementation
class Cache {
  private store: Map<string, CacheEntry<unknown>> = new Map();
  private stats: CacheStats = { hits: 0, misses: 0, size: 0 };

  set<T>(key: string, data: T, ttl: number): void {
    const expiresAt = Date.now() + ttl;
    this.store.set(key, { data, expiresAt } as CacheEntry<unknown>);
    this.stats.size = this.store.size;
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.stats.misses++;
      this.stats.size = this.store.size;
      return null;
    }
    
    this.stats.hits++;
    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.stats.size = this.store.size;
      return false;
    }
    return true;
  }

  delete(key: string): void {
    this.store.delete(key);
    this.stats.size = this.store.size;
  }

  clear(): void {
    this.store.clear();
    this.stats = { hits: 0, misses: 0, size: 0 };
  }

  invalidate(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
    this.stats.size = this.store.size;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    return total > 0 ? (this.stats.hits / total) * 100 : 0;
  }
}

// Global cache instance
export const globalCache = new Cache();

// Helper functions for specific cache operations
export const cacheHelpers = {
  // News cache
  setNews: (articles: unknown[]) => {
    globalCache.set('news:articles', articles, CACHE_TTL.NEWS);
  },
  getNews: () => globalCache.get<unknown[]>('news:articles'),
  
  // MBTA cache
  setMBTA: (predictions: unknown) => {
    globalCache.set('mbta:predictions', predictions, CACHE_TTL.MBTA);
  },
  getMBTA: () => globalCache.get<unknown>('mbta:predictions'),
  
  // Market data cache
  setMarketData: (data: unknown) => {
    globalCache.set('market:data', data, CACHE_TTL.MARKET_DATA);
  },
  getMarketData: () => globalCache.get<unknown>('market:data'),
  
  // Notifications cache
  setNotifications: (notifications: unknown[]) => {
    globalCache.set('notifications:list', notifications, CACHE_TTL.NOTIFICATIONS);
  },
  getNotifications: () => globalCache.get<unknown[]>('notifications:list'),
  
  // Clear all caches
  clearAll: () => globalCache.clear(),
  
  // Invalidate by pattern
  invalidatePattern: (pattern: string) => globalCache.invalidate(pattern),
  
  // Get cache statistics
  getStats: () => ({
    ...globalCache.getStats(),
    hitRate: globalCache.getHitRate(),
  }),
};