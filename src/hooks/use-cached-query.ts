
import { useQuery, UseQueryOptions, QueryKey, QueryFunction } from '@tanstack/react-query';
import { appCache } from '@/utils/cacheUtils';

interface CachedQueryOptions<TData, TError> extends UseQueryOptions<TData, TError> {
  cacheTime?: number; // Cache time in seconds
}

/**
 * Enhanced useQuery hook with local memory cache integration
 */
export function useCachedQuery<TData, TError = Error>(
  queryKey: QueryKey,
  queryFn: QueryFunction<TData>,
  options?: CachedQueryOptions<TData, TError>
) {
  // Convert array key to string for local cache
  const cacheKey = Array.isArray(queryKey) 
    ? queryKey.map(k => String(k)).join(':') 
    : String(queryKey);
    
  const cacheTimeInSeconds = options?.cacheTime ?? 300; // Default 5 minutes

  // Enhanced query function that checks local cache first
  const enhancedQueryFn = async () => {
    // Try local cache first
    const cachedData = appCache.get<TData>(cacheKey);
    if (cachedData !== null) {
      return cachedData;
    }
    
    // If not in local cache, fetch data
    const data = await queryFn();
    
    // Store in local cache
    appCache.set(cacheKey, data, cacheTimeInSeconds);
    
    return data;
  };

  // Create a proper query options object for TanStack Query v5
  const queryOptions = {
    queryKey,
    queryFn: enhancedQueryFn,
    ...(options || {})
  };

  // Pass the queryOptions object as the only argument to useQuery
  return useQuery<TData, TError>(queryOptions);
}
