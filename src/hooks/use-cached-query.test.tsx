
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCachedQuery } from './use-cached-query';
import { appCache } from '@/utils/cacheUtils';

// Mock the cache utils
vi.mock('@/utils/cacheUtils', () => ({
  appCache: {
    get: vi.fn(),
    set: vi.fn(),
  },
  withCache: vi.fn(),
}));

describe('useCachedQuery Hook', () => {
  let queryClient: QueryClient;
  
  // Wrapper component for React Query
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
  
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
        },
      },
    });
    
    // Reset cache mock behavior
    (appCache.get as ReturnType<typeof vi.fn>).mockReturnValue(null);
  });
  
  it('should fetch data when not in cache', async () => {
    const mockData = { id: 1, name: 'Test Data' };
    const queryFn = vi.fn().mockResolvedValue(mockData);
    
    const { result } = renderHook(
      () => useCachedQuery(['test-key'], queryFn),
      { wrapper }
    );
    
    // Initially loading
    expect(result.current.isLoading).toBe(true);
    
    // Wait for the query to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Verify cache was checked
    expect(appCache.get).toHaveBeenCalledWith('test-key');
    
    // Verify queryFn was called
    expect(queryFn).toHaveBeenCalled();
    
    // Verify data was cached
    expect(appCache.set).toHaveBeenCalledWith('test-key', mockData, 300);
    
    // Verify data was returned
    expect(result.current.data).toEqual(mockData);
  });
  
  it('should use cached data when available', async () => {
    const cachedData = { id: 1, name: 'Cached Data' };
    const queryFn = vi.fn().mockResolvedValue({ id: 2, name: 'Fresh Data' });
    
    // Mock cache hit
    (appCache.get as ReturnType<typeof vi.fn>).mockReturnValue(cachedData);
    
    const { result } = renderHook(
      () => useCachedQuery(['cached-key'], queryFn),
      { wrapper }
    );
    
    // Wait for query to complete
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    // Verify cache was checked
    expect(appCache.get).toHaveBeenCalledWith('cached-key');
    
    // Verify queryFn was not called (cached data used)
    expect(queryFn).not.toHaveBeenCalled();
    
    // Verify data returned is from cache
    expect(result.current.data).toEqual(cachedData);
  });

  it('should respect custom cache time', async () => {
    const mockData = { id: 1, name: 'Test Data' };
    const queryFn = vi.fn().mockResolvedValue(mockData);
    const customCacheTime = 600; // 10 minutes
    
    const { result } = renderHook(
      () => useCachedQuery(['custom-cache-key'], queryFn, { cacheTime: customCacheTime }),
      { wrapper }
    );
    
    // Wait for query to complete
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    // Verify data was cached with custom TTL
    expect(appCache.set).toHaveBeenCalledWith('custom-cache-key', mockData, customCacheTime);
  });
});
