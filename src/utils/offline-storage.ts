
/**
 * Offline storage utilities to support API operations when offline
 */
import { encrypt, decrypt } from './encryption';
import { logger } from './logger';

// Storage keys
const OFFLINE_REQUESTS_KEY = 'offline_pending_requests';
const OFFLINE_DATA_KEY = 'offline_data_cache';

// Types
interface OfflineRequest {
  id: string;
  url: string;
  method: string;
  data?: any;
  timestamp: number;
  sensitive?: boolean;
  retryCount: number;
}

interface OfflineData {
  key: string;
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  sensitive?: boolean;
}

/**
 * Save a request for later processing when connection is restored
 */
export const saveOfflineRequest = (
  url: string,
  method: string,
  data?: any,
  options?: { sensitive?: boolean }
): string => {
  try {
    // Generate a unique ID for the request
    const id = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Get existing requests
    const existingRequests = getOfflineRequests();
    
    // Process data if sensitive
    let processedData = data;
    if (options?.sensitive && data) {
      try {
        processedData = encrypt(JSON.stringify(data));
      } catch (e) {
        logger.error('[Offline] Failed to encrypt sensitive data', e);
      }
    }
    
    // Create new request
    const newRequest: OfflineRequest = {
      id,
      url,
      method,
      data: processedData,
      timestamp: Date.now(),
      sensitive: options?.sensitive,
      retryCount: 0
    };
    
    // Add to queue
    const updatedRequests = [...existingRequests, newRequest];
    
    // Save to storage
    localStorage.setItem(OFFLINE_REQUESTS_KEY, JSON.stringify(updatedRequests));
    
    logger.info(`[Offline] Saved request for later: ${method} ${url}`);
    return id;
  } catch (e) {
    logger.error('[Offline] Failed to save offline request', e);
    throw e;
  }
};

/**
 * Get all pending offline requests
 */
export const getOfflineRequests = (): OfflineRequest[] => {
  try {
    const stored = localStorage.getItem(OFFLINE_REQUESTS_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (e) {
    logger.error('[Offline] Failed to retrieve offline requests', e);
    return [];
  }
};

/**
 * Remove a request from the offline queue
 */
export const removeOfflineRequest = (id: string): boolean => {
  try {
    const requests = getOfflineRequests();
    const updatedRequests = requests.filter(req => req.id !== id);
    localStorage.setItem(OFFLINE_REQUESTS_KEY, JSON.stringify(updatedRequests));
    return updatedRequests.length < requests.length;
  } catch (e) {
    logger.error('[Offline] Failed to remove offline request', e);
    return false;
  }
};

/**
 * Clear all offline requests
 */
export const clearOfflineRequests = (): void => {
  try {
    localStorage.removeItem(OFFLINE_REQUESTS_KEY);
  } catch (e) {
    logger.error('[Offline] Failed to clear offline requests', e);
  }
};

/**
 * Cache data for offline access
 */
export const cacheOfflineData = (
  key: string,
  data: any,
  options?: { ttl?: number; sensitive?: boolean }
): void => {
  try {
    const ttl = options?.ttl || 24 * 60 * 60 * 1000; // 1 day by default
    
    // Process data if sensitive
    let processedData = data;
    if (options?.sensitive) {
      try {
        processedData = encrypt(JSON.stringify(data));
      } catch (e) {
        logger.error('[Offline] Failed to encrypt sensitive cached data', e);
      }
    }
    
    // Create cache entry
    const cacheEntry: OfflineData = {
      key,
      data: processedData,
      timestamp: Date.now(),
      ttl,
      sensitive: options?.sensitive
    };
    
    // Get existing cache
    const existingCache = getOfflineCache();
    
    // Add/replace entry
    const updatedCache = {
      ...existingCache,
      [key]: cacheEntry
    };
    
    // Save to storage
    localStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(updatedCache));
  } catch (e) {
    logger.error('[Offline] Failed to cache data', e);
  }
};

/**
 * Get cached data
 */
export const getCachedData = <T = any>(key: string): T | null => {
  try {
    const cache = getOfflineCache();
    const entry = cache[key];
    
    // Check if entry exists and is not expired
    if (!entry || Date.now() > entry.timestamp + entry.ttl) {
      return null;
    }
    
    // Return data, decrypting if needed
    if (entry.sensitive) {
      try {
        return JSON.parse(decrypt(entry.data));
      } catch (e) {
        logger.error('[Offline] Failed to decrypt cached data', e);
        return null;
      }
    }
    
    return entry.data as T;
  } catch (e) {
    logger.error('[Offline] Failed to retrieve cached data', e);
    return null;
  }
};

/**
 * Get the entire cache
 */
const getOfflineCache = (): Record<string, OfflineData> => {
  try {
    const stored = localStorage.getItem(OFFLINE_DATA_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch (e) {
    logger.error('[Offline] Failed to retrieve offline cache', e);
    return {};
  }
};

/**
 * Remove a cached item
 */
export const removeCachedData = (key: string): void => {
  try {
    const cache = getOfflineCache();
    if (!cache[key]) return;
    
    delete cache[key];
    localStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(cache));
  } catch (e) {
    logger.error('[Offline] Failed to remove cached data', e);
  }
};

/**
 * Clear all cached data
 */
export const clearOfflineCache = (): void => {
  try {
    localStorage.removeItem(OFFLINE_DATA_KEY);
  } catch (e) {
    logger.error('[Offline] Failed to clear offline cache', e);
  }
};

/**
 * Check if we're online
 */
export const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

/**
 * Add event listeners for online/offline events
 * @param onOnline Callback for when we go online
 * @param onOffline Callback for when we go offline
 * @returns Cleanup function
 */
export const setupConnectivityListeners = (
  onOnline?: () => void,
  onOffline?: () => void
): () => void => {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => {
    logger.info('[Offline] Network connection restored');
    onOnline?.();
  };

  const handleOffline = () => {
    logger.warn('[Offline] Network connection lost');
    onOffline?.();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};
