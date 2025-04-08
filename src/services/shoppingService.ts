
import { ShoppingItem } from "@/components/features/shopping/useShoppingItems";

const STORAGE_KEY = 'shoppingItems';

// Helper for type safety when parsing stored items
const parseStoredItems = (items: any[]): ShoppingItem[] => {
  return items.map(item => ({
    ...item,
    dateAdded: new Date(item.dateAdded),
    lastPurchased: item.lastPurchased ? new Date(item.lastPurchased) : undefined
  }));
};

// Load items from localStorage with throttling to avoid excessive operations
export const loadItems = (): ShoppingItem[] => {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    if (!storedValue) return [];
    
    const parsedValue = JSON.parse(storedValue);
    if (Array.isArray(parsedValue)) {
      return parseStoredItems(parsedValue);
    }
    return [];
  } catch (error) {
    console.error("[ERROR] shoppingService - Error loading from localStorage:", error);
    return [];
  }
};

// Function to implement throttled saves to localStorage
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

export const saveItems = (items: ShoppingItem[]): void => {
  // Clear any pending save operations
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  // Throttle writes to localStorage with a 500ms delay
  saveTimeout = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      console.log(`[DEBUG] shoppingService - Saved items to localStorage (${items.length} items)`);
    } catch (error) {
      console.error("[ERROR] shoppingService - Error saving to localStorage:", error);
    }
    saveTimeout = null;
  }, 500);
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
        const delay = Math.min(1000 * Math.pow(2, retries), 10000);
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
const CACHE_DURATION = 60000; // 60 seconds

export const cachedApiRequest = async <T,>(
  url: string, 
  options: RequestInit
): Promise<T> => {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  const now = Date.now();
  
  if (cache[cacheKey] && (now - cache[cacheKey].timestamp) < CACHE_DURATION) {
    console.log("[INFO] shoppingService - Using cached response for:", url);
    return cache[cacheKey].data;
  }
  
  try {
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
