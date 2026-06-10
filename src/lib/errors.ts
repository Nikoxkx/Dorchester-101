import { z } from 'zod';

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Error response format
export interface ErrorResponse {
  error: string;
  code: string;
  details?: unknown;
  timestamp: string;
}

// Format error for API response
export function formatErrorResponse(error: unknown): ErrorResponse {
  if (error instanceof ApiError) {
    return {
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
    };
  }
  
  if (error instanceof Error) {
    return {
      error: error.message,
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
    };
  }
  
  return {
    error: 'An unknown error occurred',
    code: 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString(),
  };
}

// Retry logic with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

// Graceful degradation - return cached/fallback data on error
export async function withGracefulDegradation<T>(
  fn: () => Promise<T>,
  fallback: T,
  errorContext: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(`Error in ${errorContext}, using fallback:`, error);
    return fallback;
  }
}

// Validation schemas for API requests
export const schemas = {
  // Notification marking
  markNotificationSchema: z.object({
    notificationId: z.string().optional(),
    action: z.enum(['markRead', 'markAllRead', 'clearAll']),
  }),
  
  // Language selection
  languageSchema: z.object({
    language: z.enum(['en', 'es', 'ht', 'pt', 'vi', 'zh', 'ar', 'so', 'kea']),
  }),
  
  // Search query
  searchSchema: z.object({
    query: z.string().min(1).max(200),
    category: z.string().optional(),
    limit: z.number().min(1).max(100).optional(),
  }),
};

// Validate and parse request body
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues || [];
      return { 
        success: false, 
        error: issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      };
    }
    return { success: false, error: 'Invalid request data' };
  }
}