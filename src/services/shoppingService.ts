import { ShoppingItem } from "@/components/features/shopping/useShoppingItems";

const STORAGE_KEY = 'shoppingItems';
const CACHE_DURATION = 60000; // 60 seconds
let lastSyncTimestamp = 0;

// Helper for type safety when parsing stored items
const parseStoredItems = (items: any[]): ShoppingItem[] => {
  return items.map(item => ({
    ...item,
    dateAdded: new Date(item.dateAdded),
    lastPurchased: item.lastPurchased ? new Date(item.lastPurchased) : undefined
  }));
};

// Load items from localStorage with improved mobile reliability
export const loadItems = (): ShoppingItem[] => {
  try {
    // Force synchronous load for mobile devices
    const storedValue = localStorage.getItem(STORAGE_KEY);
    if (!storedValue) return [];
    
    const parsedValue = JSON.parse(storedValue);
    if (Array.isArray(parsedValue)) {
      console.log(`[DEBUG] shoppingService - Loaded ${parsedValue.length} items from localStorage`);
      return parseStoredItems(parsedValue);
    }
    return [];
  } catch (error) {
    console.error("[ERROR] shoppingService - Error loading from localStorage:", error);
    return [];
  }
};

// Function to implement immediate saves to localStorage for better mobile persistence
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

export const saveItems = (items: ShoppingItem[]): void => {
  // Clear any pending save operations
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  // For mobile reliability, save immediately and then schedule multiple backup saves
  try {
    // Immediate save for mobile reliability
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    console.log(`[DEBUG] shoppingService - Immediately saved ${items.length} items to localStorage`);
    
    // First backup save - very quick (better for mobile browsers that might suspend JS)
    saveTimeout = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        console.log(`[DEBUG] shoppingService - First backup save completed (${items.length} items)`);
      } catch (error) {
        console.error("[ERROR] shoppingService - Error in first backup save:", error);
      }
    }, 50);
    
    // Second backup save - to ensure data is properly flushed on mobile
    setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        console.log(`[DEBUG] shoppingService - Second backup save completed (${items.length} items)`);
      } catch (error) {
        console.error("[ERROR] shoppingService - Error in second backup save:", error);
      }
    }, 200);
    
    // Final backup save with longer timeout for absolute certainty
    setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        console.log(`[DEBUG] shoppingService - Final backup save completed (${items.length} items)`);
        saveTimeout = null;
      } catch (error) {
        console.error("[ERROR] shoppingService - Error in final backup save:", error);
      }
    }, 1000);
  } catch (error) {
    console.error("[ERROR] shoppingService - Error in immediate save to localStorage:", error);
    // Try alternative approach if direct save fails
    try {
      setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        console.log(`[DEBUG] shoppingService - Alternative save completed (${items.length} items)`);
      }, 50);
    } catch (innerError) {
      console.error("[ERROR] shoppingService - Alternative save also failed:", innerError);
    }
  }
};

// Special function for mobile to ensure data is saved before page unload
export const setupMobilePersistence = () => {
  const forceSync = () => {
    // Force sync any pending items to localStorage
    try {
      const items = loadItems();
      if (items.length > 0) {
        // Use synchronous direct write to ensure data is saved
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        console.log("[DEBUG] Mobile persistence - Forced sync before page unload");
      }
    } catch (error) {
      console.error("[ERROR] Mobile persistence - Failed to sync:", error);
    }
  };

  // Add multiple event listeners for increased reliability
  window.addEventListener('beforeunload', forceSync, { capture: true });
  window.addEventListener('pagehide', forceSync, { capture: true });
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      forceSync();
    }
  });
  
  // Additional reliability for mobile devices
  if ('onpagehide' in window) {
    window.addEventListener('pagehide', forceSync);
  }
  
  // Handle iOS app switching
  window.addEventListener('blur', forceSync);
  
  // Handle Android back button
  document.addEventListener('backbutton', forceSync, false);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('beforeunload', forceSync);
    window.removeEventListener('pagehide', forceSync);
    window.removeEventListener('visibilitychange', () => {});
    window.removeEventListener('blur', forceSync);
    document.removeEventListener('backbutton', forceSync);
    if ('onpagehide' in window) {
      window.removeEventListener('pagehide', forceSync);
    }
  };
};

// Mock API retry logic with exponential backoff
export const apiRequest = async <T,>(
  url: string, 
  options: RequestInit, 
  maxRetries = 3
): Promise<T> => {
  let retries = 0;
  let lastError: Error;
  
  while (retries <= maxRetries) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      lastError = error as Error;
      retries++;
      
      if (retries <= maxRetries) {
        // Exponential backoff with jitter to prevent synchronization
        const delay = Math.min(1000 * Math.pow(2, retries) + Math.random() * 1000, 10000);
        console.log(`[INFO] shoppingService - Retrying request (${retries}/${maxRetries}) after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error("[ERROR] shoppingService - Max retries reached, falling back to local data");
  throw lastError!;
};

// Simple in-memory cache implementation
const cache: Record<string, { data: any; timestamp: number }> = {};

export const cachedApiRequest = async <T,>(
  url: string, 
  options: RequestInit
): Promise<T> => {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  const now = Date.now();
  
  // Return cached data if it's still fresh
  if (cache[cacheKey] && (now - cache[cacheKey].timestamp) < CACHE_DURATION) {
    console.log("[INFO] shoppingService - Using cached response for:", url);
    return cache[cacheKey].data;
  }
  
  // If the last sync was less than 1 second ago, return cached data or wait
  if (now - lastSyncTimestamp < 1000) {
    if (cache[cacheKey]) {
      console.log("[INFO] shoppingService - Rate limiting, using cached data");
      return cache[cacheKey].data;
    }
    // Wait a bit to avoid hammering the API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  try {
    lastSyncTimestamp = now;
    const data = await apiRequest<T>(url, options);
    cache[cacheKey] = { data, timestamp: now };
    return data;
  } catch (error) {
    // If API fails, attempt to return cached version even if expired
    if (cache[cacheKey]) {
      console.log("[INFO] shoppingService - API failed, using expired cache as fallback");
      return cache[cacheKey].data;
    }
    throw error;
  }
};

// Function to monitor localStorage changes across tabs
export const setupCrossBrowserSync = (updateCallback: (items: ShoppingItem[]) => void): () => void => {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const newItems = parseStoredItems(JSON.parse(event.newValue));
        updateCallback(newItems);
      } catch (error) {
        console.error("[ERROR] shoppingService - Failed to parse items from storage event:", error);
      }
    }
  };

  window.addEventListener('storage', handleStorageChange);
  
  // Return cleanup function
  return () => window.removeEventListener('storage', handleStorageChange);
};
