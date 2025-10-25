// Enhanced logger utility with structured data, correlation ID support, and Sentry integration
import * as Sentry from '@sentry/browser';
import { getLoggerConfig, LoggerConfig } from './logger.config';

interface LogMeta {
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  meta?: LogMeta;
  pid: number;
  correlationId?: string;
  userAgent?: string;
  url?: string;
}

// Simple in-memory store for correlation IDs (in production, use Redis or similar)
const correlationStore = new Map<string, string>();

// Get logger configuration
const config: LoggerConfig = getLoggerConfig();

// Initialize Sentry if DSN is provided and enabled for this environment
if (typeof window !== 'undefined' && typeof process !== 'undefined' && process.env.SENTRY_DSN && config.targets.includes('sentry')) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
    tracesSampleRate: 1.0,
  });
}

class Logger {
  private static generateCorrelationId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  static setCorrelationId(id: string): void {
    if (config.enableCorrelationIds) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('correlationId', id);
      }
      correlationStore.set('current', id);
    }
  }

  static getCorrelationId(): string | null {
    if (!config.enableCorrelationIds) return null;
    
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('correlationId') || correlationStore.get('current') || null;
    }
    return correlationStore.get('current') || null;
  }

  static clearCorrelationId(): void {
    if (config.enableCorrelationIds) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('correlationId');
      }
      correlationStore.delete('current');
    }
  }

  static shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(config.level);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  static log(level: string, message: string, meta?: LogMeta) {
    // Check if we should log this message based on the configured level
    if (!this.shouldLog(level)) {
      return;
    }

    const correlationId = config.enableCorrelationIds ? this.getCorrelationId() : undefined;
    const timestamp = new Date().toISOString();
    
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      meta,
      pid: typeof process !== 'undefined' ? process.pid : 0,
      correlationId,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location?.href : undefined
    };

    // Send to configured targets
    if (config.targets.includes('console')) {
      this.sendToConsole(logEntry);
    }

    if (config.targets.includes('sentry')) {
      this.sendToMonitoringService(logEntry);
    }

    // In development, also log to console if not already done
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development' && !config.targets.includes('console') && process.env.LOG_MONITORING) {
      console.log('[MONITORING] Would send to monitoring service:', logEntry);
    }
  }

  private static sendToConsole(logEntry: LogEntry): void {
    // In development, log to console with better formatting
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      const logMeta = { 
        ...logEntry.meta, 
        correlationId: logEntry.correlationId,
        timestamp: logEntry.timestamp 
      };
      console.log(`[${logEntry.timestamp}] ${logEntry.level.toUpperCase()}: ${logEntry.message}`, Object.keys(logMeta).length > 0 ? logMeta : '');
    }

    // In production, send structured logs to console as JSON
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(logEntry));
    }
  }

  private static sendToMonitoringService(logEntry: LogEntry): void {
    // Send to Sentry if available
    if (typeof window !== 'undefined' && typeof process !== 'undefined' && process.env.SENTRY_DSN) {
      switch (logEntry.level) {
        case 'error':
          Sentry.captureException(new Error(logEntry.message), {
            contexts: {
              log: {
                timestamp: logEntry.timestamp,
                level: logEntry.level,
                message: logEntry.message,
                meta: logEntry.meta,
                pid: logEntry.pid,
                correlationId: logEntry.correlationId,
                userAgent: logEntry.userAgent,
                url: logEntry.url
              }
            },
            tags: {
              correlationId: logEntry.correlationId || undefined,
              level: logEntry.level
            }
          });
          break;
        case 'warn':
          Sentry.captureMessage(logEntry.message, {
            level: 'warning',
            contexts: {
              log: {
                timestamp: logEntry.timestamp,
                level: logEntry.level,
                message: logEntry.message,
                meta: logEntry.meta,
                pid: logEntry.pid,
                correlationId: logEntry.correlationId,
                userAgent: logEntry.userAgent,
                url: logEntry.url
              }
            },
            tags: {
              correlationId: logEntry.correlationId || undefined,
              level: logEntry.level
            }
          });
          break;
        default:
          // For info and debug levels, only send to Sentry in development if explicitly enabled
          if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development' && process.env.LOG_MONITORING) {
            Sentry.captureMessage(logEntry.message, {
              level: 'info',
              contexts: {
                log: {
                  timestamp: logEntry.timestamp,
                  level: logEntry.level,
                  message: logEntry.message,
                  meta: logEntry.meta,
                  pid: logEntry.pid,
                  correlationId: logEntry.correlationId,
                  userAgent: logEntry.userAgent,
                  url: logEntry.url
                }
              },
              tags: {
                correlationId: logEntry.correlationId || undefined,
                level: logEntry.level
              }
            });
          }
      }
    }
  }

  static info(message: string, meta?: LogMeta) {
    this.log('info', message, meta);
  }

  static warn(message: string, meta?: LogMeta) {
    this.log('warn', message, meta);
  }

  static error(message: string, meta?: LogMeta) {
    this.log('error', message, meta);
  }

  static debug(message: string, meta?: LogMeta) {
    this.log('debug', message, meta);
  }

  static http(message: string, meta?: LogMeta) {
    this.log('http', message, meta);
  }
}

// Export a default logger instance
export default Logger;