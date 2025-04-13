
import { useQuery, UseQueryOptions, QueryKey, QueryFunction, useMutation, useQueryClient } from '@tanstack/react-query';
import { appCache } from '@/utils/cacheUtils';

interface CachedQueryOptions<TData, TError> extends Omit<UseQueryOptions<TData, TError, TData, QueryKey>, 'queryKey' | 'queryFn'> {
  cacheTime?: number; // Cache time in seconds
  skipLocalCache?: boolean; // Skip the local memory cache
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
  const skipLocalCache = options?.skipLocalCache ?? false;

  // Get query client for invalidation
  const queryClient = useQueryClient();

  // Enhanced query function that checks local cache first
  const enhancedQueryFn = async (): Promise<TData> => {
    // Skip local cache if requested
    if (!skipLocalCache) {
      // Try local cache first
      const cachedData = appCache.get<TData>(cacheKey);
      if (cachedData !== null) {
        return cachedData;
      }
    }
    
    // If not in local cache, fetch data
    const data = await queryFn();
    
    // Store in local cache if not skipping
    if (!skipLocalCache) {
      appCache.set(cacheKey, data, cacheTimeInSeconds);
    }
    
    return data;
  };

  // Use the object parameter syntax required by TanStack Query v5
  return useQuery({
    queryKey,
    queryFn: enhancedQueryFn,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // Default 5 minutes
    gcTime: options?.gcTime ?? 10 * 60 * 1000, // Default 10 minutes
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    retry: options?.retry ?? 1,
    ...options
  });
}

/**
 * Hook to invalidate cached queries
 */
export function useInvalidateCache() {
  const queryClient = useQueryClient();
  
  const invalidateQuery = (queryKey: QueryKey) => {
    // Convert array key to string for local cache
    const cacheKey = Array.isArray(queryKey) 
      ? queryKey.map(k => String(k)).join(':') 
      : String(queryKey);
    
    // Remove from local cache
    appCache.remove(cacheKey);
    
    // Invalidate in React Query - Pass an object with queryKey property
    return queryClient.invalidateQueries({ queryKey });
  };
  
  const clearAllQueries = () => {
    // Clear local cache
    appCache.clear();
    
    // Clear React Query cache - Use empty object parameter for v5 API
    return queryClient.clear({ });
  };
  
  return { invalidateQuery, clearAllQueries };
}

/**
 * Hook for mutations with automatic cache invalidation
 */
export function useCachingMutation<TData, TVariables, TError = Error, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    invalidateQueries?: QueryKey[];
    onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => void | Promise<unknown>;
    onError?: (error: TError, variables: TVariables, context: TContext | undefined) => void | Promise<unknown>;
    onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables, context: TContext | undefined) => void | Promise<unknown>;
  } = {}
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn,
    onSuccess: async (data, variables, context) => {
      // Invalidate relevant queries
      if (options.invalidateQueries && options.invalidateQueries.length > 0) {
        for (const queryKey of options.invalidateQueries) {
          // Remove from local cache
          const cacheKey = Array.isArray(queryKey) 
            ? queryKey.map(k => String(k)).join(':') 
            : String(queryKey);
          
          appCache.remove(cacheKey);
          
          // Invalidate in React Query - Pass an object with queryKey property
          await queryClient.invalidateQueries({ queryKey });
        }
      }
      
      // Call user's onSuccess handler
      if (options.onSuccess) {
        await options.onSuccess(data, variables, context);
      }
    },
    onError: options.onError,
    onSettled: options.onSettled
  });
}
