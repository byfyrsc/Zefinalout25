// Logger configuration based on environment
export interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  targets: ('console' | 'sentry' | 'file')[];
  enableCorrelationIds: boolean;
  enableStructuredData: boolean;
}

// Default configuration
export const defaultLoggerConfig: LoggerConfig = {
  level: 'info',
  targets: ['console'],
  enableCorrelationIds: true,
  enableStructuredData: true
};

// Environment-specific configurations
export const loggerConfigs: Record<string, LoggerConfig> = {
  development: {
    level: 'debug',
    targets: ['console'],
    enableCorrelationIds: true,
    enableStructuredData: true
  },
  test: {
    level: 'warn',
    targets: ['console'],
    enableCorrelationIds: true,
    enableStructuredData: true
  },
  production: {
    level: 'info',
    targets: ['console', 'sentry'],
    enableCorrelationIds: true,
    enableStructuredData: true
  }
};

// Get configuration based on environment
export function getLoggerConfig(): LoggerConfig {
  const env = (typeof process !== 'undefined' && process.env.NODE_ENV) || 'development';
  return loggerConfigs[env] || defaultLoggerConfig;
}