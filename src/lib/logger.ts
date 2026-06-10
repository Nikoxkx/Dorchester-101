import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    // Console transport for all environments
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat
      ),
    }),
    // File transport for production errors
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({ 
        filename: 'logs/error.log', 
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      new winston.transports.File({ 
        filename: 'logs/combined.log',
        maxsize: 5242880,
        maxFiles: 5,
      }),
    ] : []),
  ],
});

// Helper functions for structured logging
export const logApiRequest = (method: string, path: string, statusCode: number, duration: number) => {
  logger.info(`API Request: ${method} ${path} - ${statusCode} (${duration}ms)`);
};

export const logCacheHit = (key: string) => {
  logger.debug(`Cache HIT: ${key}`);
};

export const logCacheMiss = (key: string) => {
  logger.debug(`Cache MISS: ${key}`);
};

export const logError = (context: string, error: Error) => {
  logger.error(`Error in ${context}:`, error);
};

export const logInfo = (context: string, message: string, data?: Record<string, unknown>) => {
  if (data) {
    logger.info(`${context}: ${message}`, { data });
  } else {
    logger.info(`${context}: ${message}`);
  }
};