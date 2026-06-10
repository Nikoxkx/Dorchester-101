import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// OpenAPI 3.0 specification for DOR101 API
const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'DOR101 API',
    version: '1.0.0',
    description: 'API for Dorchester 101 - Community Resource Hub for Dorchester residents',
    contact: {
      name: 'DOR101 Community Project',
      url: 'https://github.com/Nikoxkx/Dorchester-101',
    },
  },
  servers: [
    { url: 'https://dor101.org', description: 'Production server' },
    { url: 'http://localhost:3000', description: 'Development server' },
  ],
  paths: {
    '/api/news': {
      get: {
        summary: 'Get news articles',
        description: 'Fetches the latest news articles from RSS feeds related to Dorchester and Boston.',
        operationId: 'getNews',
        tags: ['News'],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    articles: { type: 'array', items: { $ref: '#/components/schemas/Article' } },
                    sources: { type: 'array', items: { $ref: '#/components/schemas/NewsSource' } },
                    lastUpdated: { type: 'string', format: 'date-time' },
                    refreshInterval: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/notifications': {
      get: {
        summary: 'Get notifications',
        description: 'Fetches dynamic notifications based on current date/time.',
        operationId: 'getNotifications',
        tags: ['Notifications'],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    notifications: { type: 'array', items: { $ref: '#/components/schemas/Notification' } },
                    total: { type: 'integer' },
                    unreadCount: { type: 'integer' },
                    lastUpdated: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Update notification status',
        operationId: 'updateNotifications',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  notificationId: { type: 'string' },
                  action: { type: 'string', enum: ['markRead', 'markAllRead', 'clearAll'] },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Successful update' } },
      },
    },
    '/api/market-data': { get: { summary: 'Get market data', tags: ['Market'], responses: { '200': { description: 'Successful response' } } } },
    '/api/mbta': { get: { summary: 'Get MBTA predictions', tags: ['Transit'], responses: { '200': { description: 'Successful response' } } } },
    '/api/resources': { get: { summary: 'Get community resources', tags: ['Resources'], responses: { '200': { description: 'Successful response' } } } },
    '/api/health': { get: { summary: 'Health check', tags: ['System'], responses: { '200': { description: 'API is healthy' } } } },
  },
  components: {
    schemas: {
      Article: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          summary: { type: 'string' },
          source: { type: 'string' },
          sourceUrl: { type: 'string', format: 'uri' },
          category: { type: 'string' },
          publishedAt: { type: 'string', format: 'date-time' },
          isVerified: { type: 'boolean' },
        },
      },
      NewsSource: { type: 'object', properties: { name: { type: 'string' }, url: { type: 'string', format: 'uri' }, category: { type: 'string' } } },
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: { type: 'string', enum: ['housing', 'food', 'transit', 'alert', 'news', 'deadline'] },
          title: { type: 'string' },
          message: { type: 'string' },
          link: { type: 'string' },
          linkText: { type: 'string' },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
          createdAt: { type: 'string', format: 'date-time' },
          expiresAt: { type: 'string', format: 'date-time' },
          read: { type: 'boolean' },
          source: { type: 'string' },
        },
      },
      Error: { type: 'object', properties: { error: { type: 'string' }, code: { type: 'string' }, timestamp: { type: 'string', format: 'date-time' } } },
    },
  },
};

export async function GET() {
  return NextResponse.json(openApiSpec, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}