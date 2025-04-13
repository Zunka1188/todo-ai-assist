
import { logger } from './logger';
import { performanceMonitor } from './performance-monitor';
import { toast } from '@/hooks/use-toast';

/**
 * Types of errors for better categorization
 */
export enum ErrorType {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown'
}

/**
 * Standard durations for consistency
 */
export const TOAST_DURATIONS = {
  SHORT: 2000,
  NORMAL: 3000,
  LONG: 5000,
};

/**
 * Error with additional context for better handling
 */
export interface AppError extends Error {
  type?: ErrorType;
  statusCode?: number;
  context?: Record<string, any>;
  isFatal?: boolean;
}

/**
 * Options for handling errors
 */
interface ErrorHandlingOptions {
  showToast?: boolean;
  logToService?: boolean;
  rethrow?: boolean;
  context?: string;
  message?: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  retry?: {
    callback: () => Promise<any>;
    maxAttempts: number;
    delay: number;
  };
}

/**
 * Type definition for feedback handler function
 */
export type ErrorFeedbackHandler = (
  error: Error | AppError, 
  errorType: string,
  metadata?: {
    title?: string;
    message?: string;
    actionable?: boolean;
    actionLabel?: string;
    actionHandler?: () => void;
  }
) => void;

/**
 * Handle an error with options for UI feedback and logging
 */
export const handleError = (error: Error | AppError, options: ErrorHandlingOptions = {}): void => {
  const { showToast = true, logToService = true, rethrow = false } = options;
  
  // Default error type if not specified
  const appError = error as AppError;
  const errorType = appError.type || ErrorType.UNKNOWN;
  
  // Log the error
  logger.error(`[${options.context || errorType.toUpperCase()}]`, error);
  
  // Record in performance monitoring
  performanceMonitor.mark(`error_${errorType}`);
  
  // Use custom feedback handler if available
  if (errorHandler.feedbackHandler) {
    errorHandler.feedbackHandler(error, errorType.toUpperCase(), {
      title: appError.name,
      message: options.message || appError.message
    });
    // Return early as feedback is handled
    if (rethrow) {
      throw error;
    }
    return;
  }
  
  // Default toast feedback if no custom handler is set
  if (showToast) {
    const toastMessages: Record<ErrorType, string> = {
      [ErrorType.NETWORK]: 'Network connection issue. Please check your internet connection.',
      [ErrorType.VALIDATION]: 'Please check your input and try again.',
      [ErrorType.AUTHENTICATION]: 'Authentication failed. Please log in again.',
      [ErrorType.AUTHORIZATION]: 'You do not have permission to perform this action.',
      [ErrorType.NOT_FOUND]: 'The requested resource was not found.',
      [ErrorType.SERVER]: 'Server error. Our team has been notified.',
      [ErrorType.CLIENT]: 'An error occurred in the application.',
      [ErrorType.UNKNOWN]: 'An unexpected error occurred.'
    };
    
    toast({
      title: appError.name || 'Error',
      description: options.message || appError.message || toastMessages[errorType],
      variant: 'destructive',
      duration: TOAST_DURATIONS.NORMAL
    });
  }
  
  // Log to error tracking service
  if (logToService) {
    // Placeholder for external error tracking service
    // errorTrackingService.captureException(error, { 
    //   tags: { type: errorType },
    //   extra: appError.context
    // });
  }
  
  // Handle retry logic if provided
  if (options.retry) {
    const { callback, maxAttempts, delay } = options.retry;
    
    setTimeout(() => {
      callback().catch(retryError => {
        // Recursively call handleError with decremented maxAttempts
        if (maxAttempts > 1) {
          handleError(retryError, {
            ...options,
            retry: {
              ...options.retry,
              maxAttempts: maxAttempts - 1
            }
          });
        }
      });
    }, delay);
  }
  
  // Rethrow if needed
  if (rethrow) {
    throw error;
  }
};

/**
 * Central error handling utility
 */
export const errorHandler = {
  // Feedback handler function that can be set by other modules
  feedbackHandler: null as ErrorFeedbackHandler | null,

  /**
   * Set a custom feedback handler function
   */
  setFeedbackHandler: function(handler: ErrorFeedbackHandler): void {
    this.feedbackHandler = handler;
  },

  /**
   * Handle an error with options for UI feedback and logging
   */
  handle: handleError,
  
  /**
   * Create an AppError with context
   */
  createError: (
    message: string, 
    type: ErrorType = ErrorType.UNKNOWN, 
    context?: Record<string, any>
  ): AppError => {
    const error = new Error(message) as AppError;
    error.type = type;
    error.context = context;
    error.name = `${type.charAt(0).toUpperCase() + type.slice(1)}Error`;
    return error;
  },
  
  /**
   * Try to parse error response from APIs
   */
  parseApiError: (error: any): AppError => {
    try {
      let errorMessage = 'An unknown error occurred';
      let errorType = ErrorType.UNKNOWN;
      let statusCode;
      
      if (error.response) {
        // Server responded with error
        statusCode = error.response.status;
        errorMessage = error.response.data?.message || error.response.statusText || errorMessage;
        
        // Map status codes to error types
        if (statusCode === 401) errorType = ErrorType.AUTHENTICATION;
        else if (statusCode === 403) errorType = ErrorType.AUTHORIZATION;
        else if (statusCode === 404) errorType = ErrorType.NOT_FOUND;
        else if (statusCode >= 400 && statusCode < 500) errorType = ErrorType.CLIENT;
        else if (statusCode >= 500) errorType = ErrorType.SERVER;
      } else if (error.request) {
        // No response received
        errorType = ErrorType.NETWORK;
        errorMessage = 'No response received from server';
      }
      
      const appError = new Error(errorMessage) as AppError;
      appError.type = errorType;
      appError.statusCode = statusCode;
      appError.context = { originalError: error };
      appError.name = `${errorType.charAt(0).toUpperCase() + errorType.slice(1)}Error`;
      
      return appError;
    } catch (parsingError) {
      logger.error('[ErrorHandler] Failed to parse API error:', parsingError);
      return error instanceof Error ? error as AppError : new Error(String(error)) as AppError;
    }
  }
};

/**
 * Higher-order function to wrap async functions with error handling
 */
export function withErrorHandling<T>(
  fn: (...args: any[]) => Promise<T>,
  options: ErrorHandlingOptions = {}
): (...args: any[]) => Promise<T> {
  return async (...args: any[]): Promise<T> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)), options);
      if (options.rethrow) {
        throw error;
      }
      // Return a rejected promise if not rethrowing
      return Promise.reject(error);
    }
  };
}

/**
 * Higher-order function to wrap component props with error handling
 */
export function withComponentErrorHandling<T extends Record<string, any>>(
  props: T,
  errorHandlers: Record<string, ErrorHandlingOptions> = {}
): T {
  const result = { ...props } as T;
  
  // Fix for TS2862: Type 'T' is generic and can only be indexed for reading
  Object.entries(props).forEach(([key, value]) => {
    if (typeof value === 'function') {
      const options = errorHandlers[key] || {};
      // Use type assertion to define the function signature more explicitly
      (result as any)[key] = (...args: any[]) => {
        try {
          const result = value(...args);
          
          // Handle promise returns
          if (result instanceof Promise) {
            return result.catch(error => {
              handleError(error instanceof Error ? error : new Error(String(error)), options);
              if (options.rethrow) {
                throw error;
              }
              return Promise.reject(error);
            });
          }
          
          return result;
        } catch (error) {
          handleError(error instanceof Error ? error : new Error(String(error)), options);
          if (options.rethrow) {
            throw error;
          }
        }
      };
    }
  });
  
  return result;
}
