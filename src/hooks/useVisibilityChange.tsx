
import { useEffect } from 'react';
import { useIsMobile } from './use-mobile';
import { loadItems } from '@/services/shoppingService';
import { logger } from '@/utils/logger';
import { useDataRecovery } from './useDataRecovery';
import { handleError } from '@/utils/errorHandling';

/**
 * Custom hook to handle document visibility changes
 */
export const useVisibilityChange = () => {
  const { isMobile } = useIsMobile();
  const { attemptDataRecovery } = useDataRecovery();
  
  useEffect(() => {
    // Using AbortController for clean teardown
    const abortController = new AbortController();
    
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isMobile) {
        try {
          logger.startTimer('visibilityCheck');
          logger.log('[VisibilityChange] Page became visible, checking data integrity');
          
          const items = loadItems();
          logger.log('[VisibilityChange] Current items:', { itemCount: items?.length || 0 });
          
          // If we lost items somehow, try to restore from backup
          if (!items || items.length === 0) {
            logger.log('[VisibilityChange] No items found, attempting recovery');
            await attemptDataRecovery();
          }
          
          logger.endTimer('visibilityCheck');
        } catch (error) {
          handleError(error, {
            context: 'VisibilityChange',
            message: 'Error checking data on visibility change',
            showToast: false
          });
        }
      }
    };
    
    try {
      // Add event listener with passive option for better performance
      document.addEventListener('visibilitychange', handleVisibilityChange, { 
        passive: true,
        signal: abortController.signal
      });
    } catch (error) {
      // Older browsers might not support AbortController with addEventListener
      document.addEventListener('visibilitychange', handleVisibilityChange, { 
        passive: true
      });
    }
    
    return () => {
      try {
        abortController.abort();
      } catch (error) {
        // Fallback cleanup
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [isMobile, attemptDataRecovery]);
};
