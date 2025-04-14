
import { logger } from './logger';
import { errorHandler, ErrorType } from './errorHandling';

/**
 * Configuration for the retry behavior
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
  retryableStatusCodes: number[];
  retryableErrorTypes: ErrorType[];
  onRetry?: (error: Error, retryCount: number, delay: number) => void;
}

/**
 * Default retry configuration
 */
export const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 500,
  maxDelayMs: 5000,
  backoffFactor: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  retryableErrorTypes: [ErrorType.NETWORK, ErrorType.SERVER]
};

/**
 * Calculate the delay for the next retry based on exponential backoff
 * @param retryCount - Current retry attempt number
 * @param config - Retry configuration
 * @returns Delay in milliseconds before the next retry
 */
export const calculateBackoff = (retryCount: number, config: RetryConfig): number => {
  const delay = Math.min(
    config.initialDelayMs * Math.pow(config.backoffFactor, retryCount),
    config.maxDelayMs
  );
  
  // Add some jitter to prevent thundering herd problem
  const jitter = Math.random() * 0.2 * delay;
  return Math.floor(delay + jitter);
};

/**
 * Determine if a request should be retried based on the error
 * @param error - The error that occurred
 * @param config - Retry configuration
 * @returns Whether the request should be retried
 */
export const shouldRetry = (error: any, config: RetryConfig): boolean => {
  // Network errors should always be retried
  if (!error.response && error.request) {
    return true;
  }

  // Check status code for API errors
  if (error.response && 
      config.retryableStatusCodes.includes(error.response.status)) {
    return true;
  }

  // Check error type for custom errors
  const appError = error.type ? error : errorHandler.parseApiError(error);
  if (appError.type && config.retryableErrorTypes.includes(appError.type)) {
    return true;
  }

  return false;
};

/**
 * Retry a function with exponential backoff
 * @param fn - Async function to retry
 * @param config - Retry configuration
 * @returns Promise that resolves with the function result or rejects after all retries
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> => {
  const retryConfig = { ...defaultRetryConfig, ...config };
  let lastError: any;

  for (let retryCount = 0; retryCount <= retryConfig.maxRetries; retryCount++) {
    try {
      if (retryCount > 0) {
        logger.info(`Retry attempt ${retryCount} of ${retryConfig.maxRetries}`);
      }
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if we've reached the max retries or if the error isn't retryable
      if (retryCount >= retryConfig.maxRetries || !shouldRetry(error, retryConfig)) {
        break;
      }

      const delay = calculateBackoff(retryCount, retryConfig);
      
      if (retryConfig.onRetry) {
        retryConfig.onRetry(error as Error, retryCount + 1, delay);
      }
      
      logger.info(`Retrying in ${delay}ms after error: ${(error as Error).message}`);
      
      // Wait before the next retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // If we've exhausted all retries, throw the last error
  throw lastError;
};

/**
 * Wrapper for fetch with retry functionality
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param retryConfig - Retry configuration
 * @returns Promise with the fetch response
 */
export const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  retryConfig: Partial<RetryConfig> = {}
): Promise<Response> => {
  return withRetry(
    async () => {
      const response = await fetch(url, options);
      
      // Throw an error for non-2xx responses to trigger retry
      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Unknown error');
        const error = new Error(`Request failed with status ${response.status}: ${errorBody}`);
        (error as any).response = response;
        throw error;
      }
      
      return response;
    },
    retryConfig
  );
};

/**
 * Higher-order function to add retry capability to any API function
 * @param apiFn - API function to enhance with retry capability
 * @param retryConfig - Retry configuration
 * @returns Enhanced function with retry capability
 */
export function createRetryableFunction<T extends (...args: any[]) => Promise<any>>(
  apiFn: T,
  retryConfig: Partial<RetryConfig> = {}
): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    return withRetry(
      () => apiFn(...args),
      retryConfig
    ) as ReturnType<T>;
  }) as T;
}
