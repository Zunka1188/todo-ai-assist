
import { toast } from '@/hooks/use-toast';
import { logger } from './logger';

// Constants
export const TOAST_DURATIONS = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 8000
};

// Types
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface ErrorHandlingOptions {
  context?: string;
  message?: string;
  showToast?: boolean;
  severity?: ErrorSeverity;
  retry?: {
    callback: () => Promise<any>;
    maxAttempts: number;
    delay: number;
  };
  captureError?: boolean; // For error reporting services
}

/**
 * Default options for error handling
 */
const defaultOptions: ErrorHandlingOptions = {
  showToast: true,
  severity: 'error',
  captureError: false
};

/**
 * Generic error handler for consistent error handling across the app
 * @param error Error object
 * @param options Error handling options
 */
export function handleError(error: unknown, customOptions: Partial<ErrorHandlingOptions> = {}): void {
  const options = { ...defaultOptions, ...customOptions };
  const { context, message, showToast, severity, retry, captureError } = options;
  
  // Extract error message
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Format context for logging
  const contextPrefix = context ? `[${context}] ` : '';
  const userMessage = message || 'An unexpected error occurred';
  
  // Log error with appropriate severity
  switch (severity) {
    case 'info':
      logger.info(`${contextPrefix}${userMessage}:`, error);
      break;
    case 'warning':
      logger.warn(`${contextPrefix}${userMessage}:`, error);
      break;
    case 'critical':
      logger.error(`${contextPrefix}CRITICAL ERROR - ${userMessage}:`, error);
      break;
    case 'error':
    default:
      logger.error(`${contextPrefix}${userMessage}:`, error);
      break;
  }
  
  // Show toast notification if requested
  if (showToast) {
    const toastType = severity === 'critical' || severity === 'error' ? 'destructive' : undefined;
    const duration = severity === 'critical' ? TOAST_DURATIONS.LONG : 
                     severity === 'error' ? TOAST_DURATIONS.MEDIUM : 
                     TOAST_DURATIONS.SHORT;
    
    toast({
      title: severity === 'critical' ? 'Critical Error' : 
             severity === 'error' ? 'Error' : 
             severity === 'warning' ? 'Warning' : 'Information',
      description: userMessage,
      variant: toastType,
      duration,
    });
  }
  
  // Implement retry logic
  if (retry && retry.callback) {
    implementRetry(retry.callback, retry.maxAttempts, retry.delay);
  }
  
  // Capture error for reporting (placeholder for integration with error reporting services)
  if (captureError) {
    // TODO: Implement error reporting service integration
    // Example: Sentry.captureException(error);
  }
}

/**
 * Implements a retry mechanism with exponential backoff
 * @param callback Function to retry
 * @param maxAttempts Maximum number of retry attempts
 * @param baseDelay Base delay in milliseconds
 * @param currentAttempt Current attempt number
 */
export function implementRetry(
  callback: () => Promise<any>, 
  maxAttempts: number = 3, 
  baseDelay: number = 1000,
  currentAttempt: number = 0
): void {
  if (currentAttempt >= maxAttempts) {
    logger.warn(`[Retry] Maximum retry attempts (${maxAttempts}) reached.`);
    return;
  }
  
  // Calculate exponential backoff delay
  const delay = baseDelay * Math.pow(2, currentAttempt);
  
  logger.info(`[Retry] Attempting retry ${currentAttempt + 1}/${maxAttempts} after ${delay}ms`);
  
  setTimeout(() => {
    callback()
      .then(() => {
        logger.info(`[Retry] Attempt ${currentAttempt + 1} succeeded!`);
      })
      .catch(err => {
        logger.warn(`[Retry] Attempt ${currentAttempt + 1} failed:`, err);
        // Recursively retry with incremented attempt counter
        implementRetry(callback, maxAttempts, baseDelay, currentAttempt + 1);
      });
  }, delay);
}
