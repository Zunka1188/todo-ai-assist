
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { appCache, withCache } from './cacheUtils';
import { logger } from './logger';

// Mock the logger
vi.mock('./logger', () => ({
  logger: {
    error: vi.fn()
  }
}));

describe('Cache Utility', () => {
  beforeEach(() => {
    // Clear the cache before each test
    appCache.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup after tests
    appCache.clear();
  });

  it('should set and retrieve cached data', () => {
    const key = 'testKey';
    const data = { test: 'value' };
    
    appCache.set(key, data);
    const retrievedData = appCache.get(key);
    
    expect(retrievedData).toEqual(data);
  });
  
  it('should return null for non-existent keys', () => {
    const result = appCache.get('nonExistentKey');
    expect(result).toBeNull();
  });

  it('should return null for expired cache', async () => {
    const key = 'expiredKey';
    const data = { data: 'fetchedData' };
    
    // Set with 0 TTL to expire immediately
    appCache.set(key, data, 0);
    
    // Small delay to ensure expiration
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const result = appCache.get(key);
    expect(result).toBeNull();
  });
  
  it('should check if cache has a key', () => {
    const key = 'existingKey';
    appCache.set(key, 'data');
    
    expect(appCache.has(key)).toBe(true);
    expect(appCache.has('nonExistentKey')).toBe(false);
  });
  
  it('should remove a key from cache', () => {
    const key = 'removeMe';
    appCache.set(key, 'data');
    appCache.remove(key);
    
    expect(appCache.get(key)).toBeNull();
  });
  
  it('should cleanup expired items', async () => {
    // Add some items that expire immediately
    appCache.set('expire1', 'data1', 0);
    appCache.set('expire2', 'data2', 0);
    
    // Add one that doesn't expire
    appCache.set('keep', 'keepData', 300);
    
    // Small delay to ensure expiration
    await new Promise(resolve => setTimeout(resolve, 10));
    
    appCache.cleanup();
    
    expect(appCache.get('expire1')).toBeNull();
    expect(appCache.get('expire2')).toBeNull();
    expect(appCache.get('keep')).not.toBeNull();
  });

  it('should provide cache stats', () => {
    appCache.set('item1', 'data1');
    appCache.set('item2', 'data2');
    
    const stats = appCache.stats();
    
    expect(stats.totalItems).toBe(2);
    expect(typeof stats.memoryUsageEstimate).toBe('string');
  });

  describe('withCache helper', () => {
    it('should use cache when available', async () => {
      const key = 'cachedKey';
      const data = { result: 'value' };
      appCache.set(key, data);
      
      const fetchFn = vi.fn().mockResolvedValue('New Value');
      const result = await withCache(key, fetchFn);
      
      expect(result).toEqual(data);
      expect(fetchFn).not.toHaveBeenCalled();
    });
    
    it('should fetch and cache when not in cache', async () => {
      const key = 'newKey';
      const data = { result: 'fetchedValue' };
      const fetchFn = vi.fn().mockResolvedValue(data);
      
      const result = await withCache(key, fetchFn);
      
      expect(result).toEqual(data);
      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(appCache.get(key)).toEqual(data);
    });
    
    it('should handle fetch errors', async () => {
      const key = 'errorKey';
      const error = new Error('Fetch failed');
      const fetchFn = vi.fn().mockRejectedValue(error);
      
      await expect(withCache(key, fetchFn)).rejects.toThrow('Fetch failed');
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Cache error for key: errorKey'), error);
    });
  });
});
