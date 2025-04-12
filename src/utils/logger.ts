
/**
 * Configurable logger utility to handle logging based on environment
 */

const isProduction = process.env.NODE_ENV === 'production';

// Performance tracking
const perfTimers: Record<string, number> = {};

export const logger = {
  /**
   * Log informational messages (only in development)
   */
  log: (...args: any[]): void => {
    if (!isProduction) {
      console.log(...args);
    }
  },
  
  /**
   * Log error messages (in all environments)
   */
  error: (...args: any[]): void => {
    // We still log errors in production, but could filter sensitive info
    console.error(...args);
    
    // Here you could integrate with an error tracking service
    // if (errorTrackingService.isEnabled) {
    //   errorTrackingService.captureException(args[0]);
    // }
  },
  
  /**
   * Log warning messages (only in development)
   */
  warn: (...args: any[]): void => {
    if (!isProduction) {
      console.warn(...args);
    }
  },
  
  /**
   * Log info messages (only in development)
   */
  info: (...args: any[]): void => {
    if (!isProduction) {
      console.info(...args);
    }
  },
  
  /**
   * Log debug messages (only in development with DEBUG flag)
   */
  debug: (...args: any[]): void => {
    if (!isProduction && process.env.DEBUG) {
      console.debug(...args);
    }
  },

  /**
   * Start a performance timer
   */
  startTimer: (label: string): void => {
    if (!isProduction) {
      perfTimers[label] = performance.now();
    }
  },

  /**
   * End a performance timer and log the duration
   */
  endTimer: (label: string): number | null => {
    if (!isProduction && perfTimers[label]) {
      const duration = performance.now() - perfTimers[label];
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
      delete perfTimers[label];
      return duration;
    }
    return null;
  },
  
  /**
   * Group related logs (only in development)
   */
  group: (label: string, collapsed: boolean = false): void => {
    if (!isProduction) {
      collapsed ? console.groupCollapsed(label) : console.group(label);
    }
  },
  
  /**
   * End a group of logs (only in development)
   */
  groupEnd: (): void => {
    if (!isProduction) {
      console.groupEnd();
    }
  }
};
