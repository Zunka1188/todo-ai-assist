
import { useState, useCallback, useEffect } from 'react';
import { useIsMobile } from './use-mobile';
import { useToast } from './use-toast';
import { enhancedMobileSave, loadItems, checkAndRestoreBackup } from '@/services/shoppingService';
import { logger } from '@/utils/logger';
import { handleError, TOAST_DURATIONS } from '@/utils/errorHandling';

/**
 * Custom hook to handle data recovery operations
 */
export const useDataRecovery = () => {
  const { isMobile } = useIsMobile();
  const { toast } = useToast();
  const [isRecovering, setIsRecovering] = useState(false);
  
  /**
   * Attempt to recover shopping items data
   * @returns The recovered items or null if recovery failed
   */
  const attemptDataRecovery = useCallback(async () => {
    if (!isMobile) return null;
    
    setIsRecovering(true);
    logger.startTimer('dataRecovery');
    
    try {
      // First try to load from localStorage
      const items = loadItems();
      if (items && items.length > 0) {
        // Ensure data is properly saved
        enhancedMobileSave(items);
        logger.log('[DataRecovery] Data restored from localStorage:', { itemCount: items.length });
        logger.endTimer('dataRecovery');
        setIsRecovering(false);
        return items;
      }
      
      // If localStorage is empty, try to restore from backup
      const restoredItems = checkAndRestoreBackup();
      if (restoredItems && restoredItems.length > 0) {
        enhancedMobileSave(restoredItems);
        logger.log('[DataRecovery] Data restored from backup:', { itemCount: restoredItems.length });
        
        toast({
          title: "Data Restored",
          description: `Successfully restored ${restoredItems.length} shopping items from backup.`,
          duration: TOAST_DURATIONS.SHORT,
        });
        
        logger.endTimer('dataRecovery');
        setIsRecovering(false);
        return restoredItems;
      }
      
      // No data found
      logger.info('[DataRecovery] No data found to recover');
      logger.endTimer('dataRecovery');
      setIsRecovering(false);
      return null;
    } catch (error) {
      handleError(error, {
        context: 'DataRecovery',
        message: 'Failed to restore your shopping data',
        severity: 'error',
        retry: {
          callback: attemptDataRecovery,
          maxAttempts: 2,
          delay: 1000
        }
      });
      setIsRecovering(false);
      return null;
    }
  }, [isMobile, toast]);
  
  // Retry recovery if it fails initially
  const retryRecovery = useCallback(async (attempt: number = 1, maxAttempts: number = 3) => {
    if (attempt > maxAttempts) return null;
    
    try {
      const items = await attemptDataRecovery();
      if (items) return items;
      
      // If recovery failed but we haven't reached max attempts, retry with backoff
      const delay = 1000 * Math.pow(2, attempt - 1);
      
      logger.info(`[DataRecovery] Retry ${attempt}/${maxAttempts} scheduled in ${delay}ms`);
      
      return new Promise(resolve => {
        setTimeout(() => {
          retryRecovery(attempt + 1, maxAttempts).then(resolve);
        }, delay);
      });
    } catch (error) {
      logger.error(`[DataRecovery] Retry ${attempt} failed:`, error);
      return null;
    }
  }, [attemptDataRecovery]);
  
  // Initialize data recovery on mount
  useEffect(() => {
    if (isMobile) {
      retryRecovery();
    }
  }, [isMobile, retryRecovery]);
  
  return { attemptDataRecovery, retryRecovery, isRecovering };
};
