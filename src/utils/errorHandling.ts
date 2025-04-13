
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
}

/**
 * Central error handling utility
 */
export const errorHandler = {
  /**
   * Handle an error with options for UI feedback and logging
   */
  handle: (error: Error | AppError, options: ErrorHandlingOptions = {}): void => {
    const { showToast = true, logToService = true, rethrow = false } = options;
    
    // Default error type if not specified
    const appError = error as AppError;
    const errorType = appError.type || ErrorType.UNKNOWN;
    
    // Log the error
    logger.error(`[${errorType.toUpperCase()}]`, error);
    
    // Record in performance monitoring
    performanceMonitor.mark(`error_${errorType}`);
    
    // Show user-friendly toast
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
        description: appError.message || toastMessages[errorType],
        variant: 'destructive',
        duration: 5000
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
    
    // Rethrow if needed
    if (rethrow) {
      throw error;
    }
  },
  
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
      errorHandler.handle(error instanceof Error ? error : new Error(String(error)), options);
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
  const result = { ...props };
  
  Object.entries(props).forEach(([key, value]) => {
    if (typeof value === 'function') {
      const options = errorHandlers[key] || {};
      result[key] = (...args: any[]) => {
        try {
          const result = value(...args);
          
          // Handle promise returns
          if (result instanceof Promise) {
            return result.catch(error => {
              errorHandler.handle(error instanceof Error ? error : new Error(String(error)), options);
              if (options.rethrow) {
                throw error;
              }
              return Promise.reject(error);
            });
          }
          
          return result;
        } catch (error) {
          errorHandler.handle(error instanceof Error ? error : new Error(String(error)), options);
          if (options.rethrow) {
            throw error;
          }
        }
      };
    }
  });
  
  return result;
}
