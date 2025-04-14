
/**
 * API client with rate limiting and retry functionality
 */
import { fetchWithRetry, RetryConfig } from './api-retry';
import { errorHandler, ErrorType } from './errorHandling';
import { encrypt, decrypt } from './encryption';
import { logger } from './logger';
import { globalRateLimitStore } from './rate-limiter';

// Default configuration for all API requests
const DEFAULT_CONFIG = {
  baseUrl: '',  // Set this to your API base URL
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
  retryConfig: {
    maxRetries: 3,
    initialDelayMs: 500,
    maxDelayMs: 5000,
  },
  rateLimiting: {
    enabled: true,
    requestsPerMinute: 60,
    checkWindowMs: 60000, // 1 minute
    blockDuration: 60000,  // 1 minute block when limit exceeded
  }
};

/**
 * Options for API requests
 */
export interface ApiRequestOptions {
  headers?: Record<string, string>;
  retryConfig?: Partial<RetryConfig>;
  rateLimiting?: boolean | {
    requestsPerMinute?: number;
  };
  encryptResponse?: boolean;
  offlineSupport?: boolean;
  cacheTime?: number;
  sensitive?: string[]; // Fields to encrypt in requests/responses
}

/**
 * Apply rate limiting to API requests
 * @param url The URL being requested
 * @param options API request options
 * @returns Whether the request is allowed or not
 */
const applyRateLimit = (url: string, options?: ApiRequestOptions) => {
  if (options?.rateLimiting === false) {
    return { allowed: true };
  }
  
  // Create a key for this type of request
  const urlObj = new URL(url);
  const endpoint = `${urlObj.hostname}${urlObj.pathname}`;
  
  const requestsPerMinute = options?.rateLimiting && 
    typeof options.rateLimiting === 'object' && 
    options.rateLimiting.requestsPerMinute ? 
    options.rateLimiting.requestsPerMinute : 
    DEFAULT_CONFIG.rateLimiting.requestsPerMinute;
    
  // Store based on endpoint
  const record = globalRateLimitStore.get(endpoint) || {
    count: 0,
    resetAt: Date.now() + DEFAULT_CONFIG.rateLimiting.checkWindowMs
  };

  // Reset if window expired
  if (record.resetAt < Date.now()) {
    record.count = 0;
    record.resetAt = Date.now() + DEFAULT_CONFIG.rateLimiting.checkWindowMs;
  }
  
  // Increment and check
  record.count++;
  
  const limitExceeded = record.count > requestsPerMinute;
  
  // If limited, set block time
  if (limitExceeded) {
    record.blockedUntil = Date.now() + DEFAULT_CONFIG.rateLimiting.blockDuration;
  }
  
  // Save record
  globalRateLimitStore.set(endpoint, record);
  
  return {
    allowed: !limitExceeded,
    retryAfter: limitExceeded ? 
      Math.ceil(DEFAULT_CONFIG.rateLimiting.blockDuration / 1000) : 
      undefined
  };
};

/**
 * Make an API request with rate limiting and retry support
 */
export const apiRequest = async <T>(
  url: string,
  method: string = 'GET',
  data?: any,
  options?: ApiRequestOptions
): Promise<T> => {
  try {
    // Check rate limiting
    if (DEFAULT_CONFIG.rateLimiting.enabled) {
      const rateLimitResult = applyRateLimit(url, options);
      
      if (!rateLimitResult.allowed) {
        throw errorHandler.createError(
          `Rate limit exceeded. Please try again in ${rateLimitResult.retryAfter} seconds.`,
          ErrorType.CLIENT,
          { retryAfter: rateLimitResult.retryAfter }
        );
      }
    }
    
    // Process sensitive data
    let processedData = data;
    if (options?.sensitive?.length && data) {
      processedData = { ...data };
      for (const field of options.sensitive) {
        if (processedData[field]) {
          processedData[field] = encrypt(processedData[field]);
        }
      }
    }
    
    // Headers
    const headers = {
      ...DEFAULT_CONFIG.defaultHeaders,
      ...(options?.headers || {})
    };
    
    // Create fetch options
    const fetchOptions: RequestInit = {
      method,
      headers,
      body: processedData ? JSON.stringify(processedData) : undefined,
    };
    
    // Make the request with retry logic
    const response = await fetchWithRetry(
      url,
      fetchOptions,
      options?.retryConfig || DEFAULT_CONFIG.retryConfig
    );
    
    // Parse response
    let result: any;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      result = await response.json();
    } else {
      result = await response.text();
    }
    
    // Decrypt sensitive fields if needed
    if (options?.encryptResponse && typeof result === 'object') {
      for (const key in result) {
        if (options.sensitive?.includes(key)) {
          try {
            result[key] = decrypt(result[key]);
          } catch (e) {
            logger.warn(`Failed to decrypt field: ${key}`, e);
          }
        }
      }
    }
    
    return result as T;
  } catch (error) {
    // Enhance error with context
    const appError = errorHandler.parseApiError(error);
    
    // Log and rethrow
    logger.error(`[API] Request failed: ${url}`, appError);
    throw appError;
  }
};

/**
 * Simplified request methods
 */
export const api = {
  get: <T>(url: string, options?: ApiRequestOptions): Promise<T> => 
    apiRequest<T>(url, 'GET', undefined, options),
    
  post: <T>(url: string, data?: any, options?: ApiRequestOptions): Promise<T> => 
    apiRequest<T>(url, 'POST', data, options),
    
  put: <T>(url: string, data?: any, options?: ApiRequestOptions): Promise<T> => 
    apiRequest<T>(url, 'PUT', data, options),
    
  patch: <T>(url: string, data?: any, options?: ApiRequestOptions): Promise<T> => 
    apiRequest<T>(url, 'PATCH', data, options),
    
  delete: <T>(url: string, options?: ApiRequestOptions): Promise<T> => 
    apiRequest<T>(url, 'DELETE', undefined, options)
};

/**
 * Configure the API client
 */
export const configureApi = (config: Partial<typeof DEFAULT_CONFIG>) => {
  Object.assign(DEFAULT_CONFIG, config);
};
