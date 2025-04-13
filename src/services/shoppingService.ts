
/**
 * Shopping service utilities to help with mobile/desktop synchronization
 */

import { ShoppingItem } from '@/components/features/shopping/useShoppingItems';
import { logger } from '@/utils/logger';
import { validateShoppingItems, processShoppingItems } from '@/utils/validation';
import { handleError } from '@/utils/errorHandling';

// Constants for storage keys
export const STORAGE_KEY = 'shoppingItems';
export const LAST_SYNC_KEY = 'shoppingLastSync';
export const BACKUP_KEY = 'shoppingItems_backup';

// Export toast durations
export const TOAST_DURATIONS = {
  SHORT: 2000,
  NORMAL: 3000,
  LONG: 5000,
};

/**
 * Load items from storage with error handling and validation
 * @returns Array of validated shopping items or empty array
 */
export const loadItems = (): ShoppingItem[] => {
  try {
    // Performance tracking
    logger.startTimer('loadItems');
    const items = localStorage.getItem(STORAGE_KEY);
    
    if (!items) {
      logger.log("[Storage] No items found in localStorage");
      logger.endTimer('loadItems');
      return [];
    }

    const parsedItems = JSON.parse(items);
    
    // Input validation - ensure we have an array
    if (!Array.isArray(parsedItems)) {
      handleError(new Error("Loaded items is not an array"), {
        context: "Storage",
        message: "Invalid data format in storage",
        severity: 'warning'
      });
      logger.endTimer('loadItems');
      return [];
    }
    
    // Process date strings to Date objects
    const processedItems = processShoppingItems(parsedItems);
    
    // Validate the items
    const { valid, validItems, errorCount } = validateShoppingItems(processedItems);
    
    if (!valid) {
      logger.warn(`[Storage] Found ${errorCount} invalid items while loading data`);
    }
    
    const duration = logger.endTimer('loadItems');
    if (duration && duration > 100) {
      logger.warn(`[Performance] Loading items took ${duration.toFixed(2)}ms, which is slow`);
    }
    
    return validItems;
  } catch (error) {
    handleError(error, {
      context: "Storage",
      message: "Failed to load items from storage"
    });
    return [];
  }
};

/**
 * Save items to storage with error handling
 * @param items Shopping items to save
 * @returns True if successful, false otherwise
 */
export const saveItems = (items: ShoppingItem[]): boolean => {
  try {
    logger.startTimer('saveItems');
    
    // Input validation - ensure we have valid items
    if (!Array.isArray(items)) {
      handleError(new Error("Items to save is not an array"), {
        context: "Storage",
        message: "Invalid items format"
      });
      return false;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    
    // Force critical data sync for added reliability
    try {
      // Create and dispatch a storage event to notify other tabs
      if (typeof window !== 'undefined') {
        const storageEvent = new StorageEvent('storage', {
          key: STORAGE_KEY,
          newValue: JSON.stringify(items),
          url: window.location.href
        });
        window.dispatchEvent(storageEvent);
      }
    } catch (e) {
      handleError(e, {
        context: "Storage",
        message: "Failed to dispatch storage event",
        showToast: false
      });
    }
    
    logger.endTimer('saveItems');
    return true;
  } catch (error) {
    handleError(error, {
      context: "Storage",
      message: "Failed to save items to storage" 
    });
    return false;
  }
};

/**
 * Attempt to recover data from various sources
 * @returns Object containing recovered items and source information
 */
export const attemptDataRecovery = (): { items: ShoppingItem[] | null, source: string } => {
  try {
    logger.startTimer('dataRecovery');
    
    // First try to load from localStorage
    const items = loadItems();
    if (items && items.length > 0) {
      logger.endTimer('dataRecovery');
      return { items, source: 'localStorage' };
    }
    
    // Then try session storage backup
    try {
      const backup = sessionStorage.getItem(BACKUP_KEY);
      if (backup) {
        const parsedBackup = JSON.parse(backup);
        if (Array.isArray(parsedBackup) && parsedBackup.length > 0) {
          const processedItems = processShoppingItems(parsedBackup);
          const { valid, validItems } = validateShoppingItems(processedItems);
          
          if (valid && validItems.length > 0) {
            logger.endTimer('dataRecovery');
            return { items: validItems, source: 'sessionStorage' };
          }
        }
      }
    } catch (e) {
      handleError(e, {
        context: "DataRecovery",
        message: "Failed to check session storage backup",
        showToast: false
      });
    }
    
    logger.endTimer('dataRecovery');
    return { items: null, source: 'none' };
  } catch (error) {
    handleError(error, {
      context: "DataRecovery",
      message: "Data recovery attempt failed" 
    });
    return { items: null, source: 'error' };
  }
};

/**
 * Mobile-specific persistence helpers
 */
export const setupMobilePersistence = () => {
  // Save on page visibility change (user switches apps)
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      // Force sync when app goes to background
      const items = loadItems();
      if (items.length > 0) {
        saveItems(items);
        logger.log("[DEBUG] Force synced items on visibility change");
        
        // Also save to sessionStorage as backup
        try {
          sessionStorage.setItem(BACKUP_KEY, JSON.stringify(items));
        } catch (e) {
          logger.error("[ERROR] Failed to save backup:", e);
        }
      }
    } else if (document.visibilityState === 'visible') {
      // Also reload when coming back to the app
      const items = loadItems();
      if (items && items.length > 0) {
        // Dispatch a storage event to update any components listening
        try {
          const storageEvent = new StorageEvent('storage', {
            key: STORAGE_KEY,
            newValue: JSON.stringify(items),
            url: window.location.href
          });
          window.dispatchEvent(storageEvent);
          logger.log("[DEBUG] Reloaded items when app returned to foreground");
        } catch (e) {
          logger.error("[ERROR] Failed to dispatch storage event:", e);
        }
      }
    }
  };

  // Save before app closes/refreshes
  const handleBeforeUnload = () => {
    const items = loadItems();
    if (items.length > 0) {
      saveItems(items);
      logger.log("[DEBUG] Force synced items before unload");
      
      // Create a backup copy in sessionStorage for extra reliability
      try {
        sessionStorage.setItem(BACKUP_KEY, JSON.stringify(items));
      } catch (e) {
        logger.error("[ERROR] Failed to create backup in sessionStorage:", e);
      }
    }
  };

  // Add event listeners
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('beforeunload', handleBeforeUnload);

  // Return cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
};

/**
 * Setup cross-browser synchronization
 * This is intended to help sync between tabs
 */
export const setupCrossBrowserSync = () => {
  // Listen for storage events from other tabs
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      logger.log("[DEBUG] Detected shopping list change in another tab");
      // Processing could be done here in the future
    }
  };

  // Add event listener
  window.addEventListener('storage', handleStorageChange);

  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};

/**
 * Mobile-specific save enhancement to help with browser storage limits
 * and ensure data is saved even when the app is in the background
 */
export const enhancedMobileSave = (items: ShoppingItem[]): boolean => {
  // Input validation
  if (!Array.isArray(items)) {
    logger.error("[ERROR] Items to save is not an array");
    return false;
  }
  
  // First try - normal save
  const result = saveItems(items);
  
  // Save to sessionStorage as backup immediately
  try {
    sessionStorage.setItem(BACKUP_KEY, JSON.stringify(items));
  } catch (err) {
    logger.error("[ERROR] Failed to save backup to sessionStorage:", err);
  }
  
  // Implement a more efficient retry mechanism with exponential backoff
  const retryWithBackoff = (attempt: number, maxAttempts: number, baseDelay: number) => {
    if (attempt >= maxAttempts) return;
    
    const delay = baseDelay * Math.pow(2, attempt);
    
    setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        logger.log(`[DEBUG] Mobile fallback save attempt ${attempt + 1} completed`);
        
        if (attempt === 0) {
          // Also save to sessionStorage as an additional backup on first retry
          try {
            sessionStorage.setItem(BACKUP_KEY, JSON.stringify(items));
          } catch (error) {
            logger.error('[ERROR] Failed to save backup on retry:', error);
          }
        }
      } catch (error) {
        logger.error(`[ERROR] Enhanced save fallback attempt ${attempt + 1} failed:`, error);
        // Retry with increased delay
        retryWithBackoff(attempt + 1, maxAttempts, baseDelay);
      }
    }, delay);
  };
  
  // Start retry mechanism with 3 attempts, starting with 100ms delay
  retryWithBackoff(0, 3, 100);
  
  return result;
};

/**
 * Function to check if there's a backup and restore it if needed
 */
export const checkAndRestoreBackup = (): ShoppingItem[] | null => {
  const recovery = attemptDataRecovery();
  
  if (recovery.items && recovery.items.length > 0) {
    // If we recovered from backup, save to localStorage
    if (recovery.source !== 'localStorage') {
      saveItems(recovery.items);
      logger.log(`[DEBUG] Restored shopping items from ${recovery.source}`);
    }
    return recovery.items;
  }
  
  return null;
};

/**
 * Updates the app with items from another window/tab
 * @param newValue JSON string with new items
 * @returns True if successful, false otherwise
 */
export const handleStorageUpdate = (newValue: string | null): boolean => {
  if (!newValue) return false;
  
  try {
    const items = JSON.parse(newValue);
    if (Array.isArray(items) && items.length > 0) {
      const processedItems = processShoppingItems(items);
      const { valid, validItems } = validateShoppingItems(processedItems);
      
      if (valid && validItems.length > 0) {
        // Here we would dispatch an action to update the app state
        logger.log("[Storage] Received update from another tab:", validItems.length);
        return true;
      }
    }
    return false;
  } catch (error) {
    handleError(error, {
      context: "StorageSync",
      message: "Failed to process items from another tab",
      showToast: false
    });
    return false;
  }
};
