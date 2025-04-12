
/**
 * Shopping service utilities to help with mobile/desktop synchronization
 */

import { ShoppingItem } from '@/components/features/shopping/useShoppingItems';
import { logger } from '@/utils/logger';

// Constants for storage keys
export const STORAGE_KEY = 'shoppingItems';
export const LAST_SYNC_KEY = 'shoppingLastSync';
export const BACKUP_KEY = 'shoppingItems_backup';

// Standard durations for consistency
export const TOAST_DURATIONS = {
  SHORT: 2000,
  NORMAL: 3000,
  LONG: 5000,
};

/**
 * Load items from storage with error handling
 */
export const loadItems = (): ShoppingItem[] => {
  try {
    const items = localStorage.getItem(STORAGE_KEY);
    if (!items) return [];

    const parsedItems = JSON.parse(items);
    
    // Input validation - ensure we have an array
    if (!Array.isArray(parsedItems)) {
      logger.error("[ERROR] Loaded items is not an array");
      return [];
    }
    
    // Convert date strings back to Date objects
    return parsedItems.map((item: any) => ({
      ...item,
      dateAdded: new Date(item.dateAdded),
      lastPurchased: item.lastPurchased ? new Date(item.lastPurchased) : undefined
    }));
  } catch (error) {
    logger.error("[ERROR] Failed to load items from storage:", error);
    return [];
  }
};

/**
 * Save items to storage with error handling
 */
export const saveItems = (items: ShoppingItem[]): boolean => {
  try {
    // Input validation - ensure we have valid items
    if (!Array.isArray(items)) {
      logger.error("[ERROR] Items to save is not an array");
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
      logger.error("[ERROR] Failed to dispatch storage event:", e);
    }
    
    return true;
  } catch (error) {
    logger.error("[ERROR] Failed to save items to storage:", error);
    return false;
  }
};

/**
 * Attempt to recover data from various sources
 */
export const attemptDataRecovery = (): { items: ShoppingItem[] | null, source: string } => {
  try {
    // First try to load from localStorage
    const items = loadItems();
    if (items && items.length > 0) {
      return { items, source: 'localStorage' };
    }
    
    // Then try session storage backup
    try {
      const backup = sessionStorage.getItem(BACKUP_KEY);
      if (backup) {
        const parsedBackup = JSON.parse(backup);
        if (Array.isArray(parsedBackup) && parsedBackup.length > 0) {
          const restoredItems = parsedBackup.map((item: any) => ({
            ...item,
            dateAdded: new Date(item.dateAdded),
            lastPurchased: item.lastPurchased ? new Date(item.lastPurchased) : undefined
          }));
          return { items: restoredItems, source: 'sessionStorage' };
        }
      }
    } catch (e) {
      logger.error("[ERROR] Failed to check session storage backup:", e);
    }
    
    return { items: null, source: 'none' };
  } catch (error) {
    logger.error("[ERROR] Data recovery attempt failed:", error);
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
