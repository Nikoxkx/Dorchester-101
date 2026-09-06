import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Mock external APIs
const mockRSSResponse = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Dorchester Reporter</title>
    <item>
      <title>BHA Announces New Housing Initiative</title>
      <link>https://www.dotnews.com/bha-housing</link>
      <pubDate>${new Date().toISOString()}</pubDate>
      <description>Boston Housing Authority announces new affordable housing initiative for Dorchester residents.</description>
    </item>
  </channel>
</rss>`;

export const handlers = [
  http.get('https://www.dotnews.com/rss.xml', () => {
    return new HttpResponse(mockRSSResponse, {
      headers: { 'Content-Type': 'application/rss+xml' },
    });
  }),
];

export const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterAll(() => server.close());

describe('News API', () => {
  it('should fetch news articles', async () => {
    const response = await fetch('/api/news');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.articles).toBeDefined();
    expect(Array.isArray(data.articles)).toBe(true);
  });

  it('should return sources information', async () => {
    const response = await fetch('/api/news');
    const data = await response.json();
    
    expect(data.sources).toBeDefined();
    expect(Array.isArray(data.sources)).toBe(true);
    expect(data.sources.length).toBeGreaterThan(0);
  });

  it('should have lastUpdated timestamp', async () => {
    const response = await fetch('/api/news');
    const data = await response.json();
    
    expect(data.lastUpdated).toBeDefined();
    expect(new Date(data.lastUpdated).getTime()).toBeLessThanOrEqual(Date.now());
  });

  it('should have refreshInterval', async () => {
    const response = await fetch('/api/news');
    const data = await response.json();
    
    expect(data.refreshInterval).toBeDefined();
    expect(typeof data.refreshInterval).toBe('number');
  });
});

describe('Notifications API', () => {
  it('should fetch notifications', async () => {
    const response = await fetch('/api/notifications');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.notifications).toBeDefined();
    expect(Array.isArray(data.notifications)).toBe(true);
  });

  it('should have unreadCount', async () => {
    const response = await fetch('/api/notifications');
    const data = await response.json();
    
    expect(data.unreadCount).toBeDefined();
    expect(typeof data.unreadCount).toBe('number');
  });

  it('should have lastUpdated timestamp', async () => {
    const response = await fetch('/api/notifications');
    const data = await response.json();
    
    expect(data.lastUpdated).toBeDefined();
  });

  it('should generate dynamic notifications based on date', async () => {
    const response = await fetch('/api/notifications');
    const data = await response.json();
    
    // Should always have at least some notifications
    expect(data.notifications.length).toBeGreaterThan(0);
    
    // Should have source info
    expect(data.source).toBeDefined();
  });

  it('should mark notification as read via POST', async () => {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: 'notif-1', action: 'markRead' }),
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});

describe('Market Data API', () => {
  it('should fetch market data', async () => {
    const response = await fetch('/api/market-data');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toBeDefined();
  });
});

describe('MBTA API', () => {
  it('should fetch MBTA predictions', async () => {
    const response = await fetch('/api/mbta');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toBeDefined();
  });
});

describe('Resources API', () => {
  it('should fetch resources', async () => {
    const response = await fetch('/api/resources');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toBeDefined();
  });
});

describe('Health API', () => {
  it('should return health status', async () => {
    const response = await fetch('/api/health');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
  });
});