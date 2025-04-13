
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { appCache } from './cacheUtils';

// Mock Date.now to control time for expiration tests
const mockNow = vi.spyOn(Date, 'now');

describe('MemoryCache', () => {
  beforeEach(() => {
    appCache.clear();
    vi.resetAllMocks();
    // Start time at a fixed point for predictable testing
    mockNow.mockReturnValue(1000000);
  });
  
  it('should handle complex data structures', () => {
    // Test with nested objects
    const complexData = {
      user: {
        id: 123,
        profile: {
          name: 'Test User',
          preferences: {
            theme: 'dark',
            notifications: true
          }
        }
      },
      posts: [
        { id: 1, title: 'Post 1' },
        { id: 2, title: 'Post 2' }
      ],
      stats: new Map([
        ['views', 100],
        ['likes', 50]
      ])
    };
    
    appCache.set('complex', complexData);
    const retrieved = appCache.get('complex');
    
    expect(retrieved).toEqual(complexData);
    expect(retrieved?.user.profile.preferences.theme).toBe('dark');
    expect(retrieved?.posts[1].title).toBe('Post 2');
  });
  
  it('should handle different data types', () => {
    // Test with various data types
    appCache.set('string', 'test string');
    appCache.set('number', 123);
    appCache.set('boolean', true);
    appCache.set('null', null);
    appCache.set('undefined', undefined);
    appCache.set('date', new Date(2023, 5, 15));
    
    expect(appCache.get('string')).toBe('test string');
    expect(appCache.get('number')).toBe(123);
    expect(appCache.get('boolean')).toBe(true);
    expect(appCache.get('null')).toBe(null);
    expect(appCache.get('undefined')).toBe(undefined);
    expect(appCache.get('date')).toBeInstanceOf(Date);
  });
  
  it('should handle variable cache expiration times', () => {
    // Set items with different expiry times
    appCache.set('short', 'quick', 1); // 1 second
    appCache.set('medium', 'normal', 60); // 1 minute
    appCache.set('long', 'extended', 3600); // 1 hour
    
    // All should be available initially
    expect(appCache.get('short')).toBe('quick');
    expect(appCache.get('medium')).toBe('normal');
    expect(appCache.get('long')).toBe('extended');
    
    // Move time forward 2 seconds
    mockNow.mockReturnValue(1000000 + 2000);
    
    // Short should be expired, others valid
    expect(appCache.get('short')).toBeNull();
    expect(appCache.get('medium')).toBe('normal');
    expect(appCache.get('long')).toBe('extended');
    
    // Move time forward 2 minutes
    mockNow.mockReturnValue(1000000 + 120000);
    
    // Medium should be expired now too
    expect(appCache.get('medium')).toBeNull();
    expect(appCache.get('long')).toBe('extended');
    
    // Move time forward 2 hours
    mockNow.mockReturnValue(1000000 + 7200000);
    
    // All should be expired
    expect(appCache.get('long')).toBeNull();
  });
  
  it('should clean up expired items correctly', () => {
    // Set some items that will expire
    appCache.set('expire1', 'data1', 10);
    appCache.set('expire2', 'data2', 20);
    appCache.set('keep', 'keepData', 300);
    
    // Move time forward 15 seconds
    mockNow.mockReturnValue(1000000 + 15000);
    
    // Clean up expired items
    appCache.cleanup();
    
    // Check which items remain
    expect(appCache.get('expire1')).toBeNull(); // Should be removed
    expect(appCache.get('expire2')).toBe('data2'); // Should still exist
    expect(appCache.get('keep')).toBe('keepData'); // Should still exist
    
    // Check keys
    expect(appCache.keys()).not.toContain('expire1');
    expect(appCache.keys()).toContain('expire2');
    expect(appCache.keys()).toContain('keep');
  });
  
  it('should provide accurate statistics', () => {
    // Cache should be empty initially
    expect(appCache.stats().totalItems).toBe(0);
    
    // Add some items
    appCache.set('item1', 'small data');
    appCache.set('item2', { large: 'object with more data' });
    
    const stats = appCache.stats();
    expect(stats.totalItems).toBe(2);
    expect(typeof stats.memoryUsageEstimate).toBe('string');
    expect(stats.memoryUsageEstimate).toContain('bytes');
  });
});
