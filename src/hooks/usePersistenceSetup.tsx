
import { useEffect } from 'react';
import { useIsMobile } from './use-mobile';
import { setupCrossBrowserSync, setupMobilePersistence } from '@/services/shoppingService';
import { logger } from '@/utils/logger';
import { handleError } from '@/utils/errorHandling';
import { useDataRecovery } from './useDataRecovery';

/**
 * Custom hook to handle persistence setup
 */
export const usePersistenceSetup = () => {
  const { isMobile } = useIsMobile();
  const { attemptDataRecovery } = useDataRecovery();
  
  useEffect(() => {
    // Create abort controller for cleanup
    const abortController = new AbortController();
    logger.startTimer('persistenceSetup');
    
    // Setup cross-browser sync
    let cleanupBrowserSync: (() => void) | undefined;
    try {
      cleanupBrowserSync = setupCrossBrowserSync();
      logger.log('[PersistenceSetup] Browser sync setup complete');
    } catch (error) {
      handleError(error, {
        context: 'PersistenceSetup',
        message: 'Failed to set up browser sync',
        showToast: false
      });
    }
    
    // Setup mobile-specific persistence if on mobile
    let cleanupMobilePersistence: (() => void) | undefined;
    if (isMobile) {
      try {
        cleanupMobilePersistence = setupMobilePersistence();
        logger.log('[PersistenceSetup] Mobile persistence setup complete');
        
        // Initial data recovery attempt
        attemptDataRecovery();
      } catch (error) {
        handleError(error, {
          context: 'PersistenceSetup',
          message: 'Failed to set up mobile persistence',
          showToast: false
        });
      }
    }
    
    logger.endTimer('persistenceSetup');
    
    // Cleanup function with proper checks
    return () => {
      // Signal abort to any pending operations
      try {
        abortController.abort();
      } catch (error) {
        logger.error('[PersistenceSetup] Error aborting controller:', error);
      }
      
      // Clean up browser sync
      if (typeof cleanupBrowserSync === 'function') {
        try {
          cleanupBrowserSync();
          logger.log('[PersistenceSetup] Browser sync cleaned up');
        } catch (error) {
          handleError(error, {
            context: 'PersistenceSetup',
            message: 'Error cleaning up browser sync',
            showToast: false
          });
        }
      }
      
      // Clean up mobile persistence
      if (cleanupMobilePersistence && typeof cleanupMobilePersistence === 'function') {
        try {
          cleanupMobilePersistence();
          logger.log('[PersistenceSetup] Mobile persistence cleaned up');
        } catch (error) {
          handleError(error, {
            context: 'PersistenceSetup', 
            message: 'Error cleaning up mobile persistence',
            showToast: false
          });
        }
      }
    };
  }, [isMobile, attemptDataRecovery]);
};
