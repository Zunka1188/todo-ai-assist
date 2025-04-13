
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useCachedQuery, useInvalidateCache, useCachingMutation } from './use-cached-query';
import { appCache } from '@/utils/cacheUtils';

// Create a wrapper for testing React Query hooks
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useCachedQuery', () => {
  const mockData = { test: 'success' };
  const mockFetchFn = vi.fn().mockResolvedValue(mockData);
  
  beforeEach(() => {
    vi.clearAllMocks();
    appCache.clear();
  });
  
  it('should fetch data and store in cache', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useCachedQuery(['test-key'], mockFetchFn),
      { wrapper }
    );
    
    // Should be loading initially
    expect(result.current.isLoading).toBeTruthy();
    
    // Wait for the query to complete
    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());
    
    // Data should be fetched and match mock
    expect(mockFetchFn).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockData);
    
    // Data should be in the local cache
    expect(appCache.get('test-key')).toEqual(mockData);
  });
  
  it('should use cached data when available', async () => {
    // Preset the cache
    appCache.set('cached-key', mockData);
    
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useCachedQuery(['cached-key'], mockFetchFn),
      { wrapper }
    );
    
    // Wait for the query to complete
    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());
    
    // Fetch function should not be called
    expect(mockFetchFn).not.toHaveBeenCalled();
    
    // Data should match the cached data
    expect(result.current.data).toEqual(mockData);
  });
  
  it('should skip local cache when specified', async () => {
    // Preset the cache
    appCache.set('skip-key', { test: 'cached' });
    
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useCachedQuery(['skip-key'], mockFetchFn, { skipLocalCache: true }),
      { wrapper }
    );
    
    // Wait for the query to complete
    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());
    
    // Fetch function should be called despite having data in cache
    expect(mockFetchFn).toHaveBeenCalledTimes(1);
    
    // Data should match the fetched data, not the cached data
    expect(result.current.data).toEqual(mockData);
  });
});

describe('useInvalidateCache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    appCache.clear();
  });
  
  it('should invalidate queries from both caches', async () => {
    // Setup test data
    appCache.set('invalidate-key', { test: 'cached' });
    
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useInvalidateCache(),
      { wrapper }
    );
    
    // Verify data exists in cache
    expect(appCache.get('invalidate-key')).not.toBeNull();
    
    // Invalidate the query
    result.current.invalidateQuery(['invalidate-key']);
    
    // Verify data is removed from cache
    expect(appCache.get('invalidate-key')).toBeNull();
  });
  
  it('should clear all queries', async () => {
    // Setup test data
    appCache.set('key1', { test: 'cached1' });
    appCache.set('key2', { test: 'cached2' });
    
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useInvalidateCache(),
      { wrapper }
    );
    
    // Verify data exists in cache
    expect(appCache.get('key1')).not.toBeNull();
    expect(appCache.get('key2')).not.toBeNull();
    
    // Clear all queries
    result.current.clearAllQueries();
    
    // Verify all data is removed from cache
    expect(appCache.get('key1')).toBeNull();
    expect(appCache.get('key2')).toBeNull();
  });
});

describe('useCachingMutation', () => {
  const mockMutationFn = vi.fn().mockResolvedValue({ success: true });
  
  beforeEach(() => {
    vi.clearAllMocks();
    appCache.clear();
  });
  
  it('should invalidate queries after successful mutation', async () => {
    // Setup test data
    appCache.set('user:123', { id: 123, name: 'Test User' });
    
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useCachingMutation(mockMutationFn, {
        invalidateQueries: [['user', '123']],
        onSuccess: vi.fn()
      }),
      { wrapper }
    );
    
    // Verify data exists in cache
    expect(appCache.get('user:123')).not.toBeNull();
    
    // Execute mutation
    result.current.mutate({ id: 123 });
    
    // Wait for mutation to complete
    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());
    
    // Verify data is removed from cache
    expect(appCache.get('user:123')).toBeNull();
    expect(mockMutationFn).toHaveBeenCalledTimes(1);
  });
});
