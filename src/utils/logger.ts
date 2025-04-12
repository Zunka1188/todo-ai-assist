
/**
 * Configurable logger utility to handle logging based on environment
 */

const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
  log: (...args: any[]): void => {
    if (!isProduction) {
      console.log(...args);
    }
  },
  
  error: (...args: any[]): void => {
    // We still log errors in production, but could filter sensitive info
    console.error(...args);
  },
  
  warn: (...args: any[]): void => {
    if (!isProduction) {
      console.warn(...args);
    }
  },
  
  info: (...args: any[]): void => {
    if (!isProduction) {
      console.info(...args);
    }
  },
  
  debug: (...args: any[]): void => {
    if (!isProduction && process.env.DEBUG) {
      console.debug(...args);
    }
  }
};
