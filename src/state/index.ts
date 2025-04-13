
import { errorHandler, ErrorType } from '@/utils/errorHandling';
import { performanceMonitor } from '@/utils/performance-monitor';
import { appCache } from '@/utils/cacheUtils';

// Central export for all state management
export * from './useStore';
export * from './types';

/**
 * Optimistic update handler for state operations
 * @param updateFn Function that updates the state optimistically
 * @param rollbackFn Function to rollback changes if the operation fails
 * @param asyncOperation Async operation to perform (e.g., API call)
 */
export async function withOptimisticUpdate<T>(
  updateFn: () => void,
  rollbackFn: () => void,
  asyncOperation: () => Promise<T>
): Promise<T> {
  try {
    // Record performance start
    performanceMonitor.mark('optimistic_update_start');
    
    // Apply optimistic update immediately
    updateFn();
    
    // Perform the actual async operation
    const result = await asyncOperation();
    
    // Record successful update
    performanceMonitor.mark('optimistic_update_success');
    performanceMonitor.measure(
      'optimistic_update_duration',
      'optimistic_update_start',
      'optimistic_update_success'
    );
    
    return result;
  } catch (error) {
    // Record failed update
    performanceMonitor.mark('optimistic_update_fail');
    performanceMonitor.measure(
      'optimistic_update_fail_duration',
      'optimistic_update_start',
      'optimistic_update_fail'
    );
    
    // Rollback the optimistic update
    rollbackFn();
    
    // Handle the error
    errorHandler.handle(
      errorHandler.createError(
        'Failed to complete operation. Changes have been reverted.',
        ErrorType.NETWORK,
        { originalError: error }
      )
    );
    
    throw error;
  }
}

/**
 * Helper for invalidating related cache entries when state changes
 */
export function invalidateRelatedCache(keyPattern: string | RegExp): void {
  const keys = appCache.keys();
  
  const matchingKeys = typeof keyPattern === 'string'
    ? keys.filter(key => key.includes(keyPattern))
    : keys.filter(key => keyPattern.test(key));
  
  matchingKeys.forEach(key => appCache.remove(key));
}
