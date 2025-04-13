
import { logger } from './logger';

// Type definitions for cache items
interface CacheItem<T> {
  data: T;
  expiry: number;
}

/**
 * Simple in-memory cache implementation with expiry
 */
class MemoryCache {
  private cache: Record<string, CacheItem<any>> = {};
  
  /**
   * Set a value in the cache with an expiry time
   * @param key Cache key
   * @param value The value to store
   * @param ttlSeconds Time to live in seconds (default: 5 minutes)
   */
  set<T>(key: string, value: T, ttlSeconds = 300): void {
    const expiryTime = Date.now() + (ttlSeconds * 1000);
    this.cache[key] = { data: value, expiry: expiryTime };
  }
  
  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns The cached value or null if not found or expired
   */
  get<T>(key: string): T | null {
    const item = this.cache[key] as CacheItem<T> | undefined;
    
    // Return null if item doesn't exist
    if (!item) return null;
    
    // Return null if item has expired and clean it up
    if (Date.now() > item.expiry) {
      delete this.cache[key];
      return null;
    }
    
    return item.data;
  }
  
  /**
   * Check if a key exists and is not expired
   * @param key Cache key
   * @returns True if the key exists and is not expired
   */
  has(key: string): boolean {
    const item = this.cache[key];
    if (!item) return false;
    if (Date.now() > item.expiry) {
      delete this.cache[key];
      return false;
    }
    return true;
  }
  
  /**
   * Remove an item from the cache
   * @param key Cache key
   */
  remove(key: string): void {
    delete this.cache[key];
  }
  
  /**
   * Clear all expired items from the cache
   */
  cleanup(): void {
    const now = Date.now();
    Object.keys(this.cache).forEach(key => {
      if (now > this.cache[key].expiry) {
        delete this.cache[key];
      }
    });
  }
  
  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache = {};
  }
  
  /**
   * Get all valid cache keys (not expired)
   */
  keys(): string[] {
    this.cleanup(); // Clean up expired items first
    return Object.keys(this.cache);
  }
  
  /**
   * Get cache statistics
   */
  stats(): { totalItems: number; memoryUsageEstimate: string } {
    const totalItems = Object.keys(this.cache).length;
    // Rough estimate of memory usage based on JSON size
    const memoryEstimate = JSON.stringify(this.cache).length;
    const formattedSize = memoryEstimate < 1024 
      ? `${memoryEstimate} bytes` 
      : `${(memoryEstimate / 1024).toFixed(2)} KB`;
    
    return {
      totalItems,
      memoryUsageEstimate: formattedSize
    };
  }
}

// Create a singleton instance
export const appCache = new MemoryCache();

// Helper for wrapping async functions with cache
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> {
  try {
    // Check cache first
    const cached = appCache.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    // Fetch fresh data
    const data = await fetchFn();
    
    // Store in cache
    appCache.set(key, data, ttlSeconds);
    
    return data;
  } catch (error) {
    logger.error(`Cache error for key: ${key}`, error);
    throw error;
  }
}
