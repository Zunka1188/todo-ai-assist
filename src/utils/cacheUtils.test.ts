
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { appCache, withCache } from './cacheUtils';

describe('Cache Utility', () => {
  beforeEach(() => {
    // Clear the cache before each test
    appCache.clear();
  });

  it('should set and retrieve cached data', () => {
    const key = 'testKey';
    const data = { test: 'value' };
    
    appCache.set(key, data);
    const retrievedData = appCache.get(key);
    
    expect(retrievedData).toEqual(data);
  });

  it('should return null for expired cache', async () => {
    const key = 'expiredKey';
    const mockFetch = async () => ({ data: 'fetchedData' });
    
    const result = await withCache(key, mockFetch, 0);
    
    expect(result).toEqual({ data: 'fetchedData' });
    expect(appCache.get(key)).toBeNull();
  });
});
