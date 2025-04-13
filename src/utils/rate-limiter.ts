
/**
 * Rate limiter utility for API requests
 * Provides protection against excessive requests from the same client
 */

type RateLimitOptions = {
  windowMs: number;          // Timeframe for request counting (in milliseconds)
  maxRequests: number;       // Maximum number of requests allowed in timeframe
  blockDuration?: number;    // How long to block requests when limit is exceeded (in milliseconds)
  identifier?: (req: any) => string;  // Function to get unique client identifier
};

type RateLimitRecord = {
  count: number;
  resetAt: number;
  blockedUntil?: number;
};

/**
 * In-memory store for rate limit records
 */
class RateLimitStore {
  private records: Map<string, RateLimitRecord> = new Map();
  private cleanupInterval: number | null = null;
  
  constructor(cleanupIntervalMs = 60000) {
    // Set up periodic cleanup of expired records
    if (typeof window !== 'undefined') {
      this.cleanupInterval = window.setInterval(() => {
        this.cleanup();
      }, cleanupIntervalMs) as unknown as number;
    }
  }
  
  /**
   * Get rate limit record for client
   */
  get(key: string): RateLimitRecord | undefined {
    return this.records.get(key);
  }
  
  /**
   * Set or update rate limit record for client
   */
  set(key: string, record: RateLimitRecord): void {
    this.records.set(key, record);
  }
  
  /**
   * Remove expired records to prevent memory leaks
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.records.entries()) {
      if (record.resetAt < now && (!record.blockedUntil || record.blockedUntil < now)) {
        this.records.delete(key);
      }
    }
  }
  
  /**
   * Clean up resources when no longer needed
   */
  destroy(): void {
    if (this.cleanupInterval !== null && typeof window !== 'undefined') {
      window.clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
  
  /**
   * Get statistics about current rate limit records
   */
  getStats(): { activeRecords: number } {
    return {
      activeRecords: this.records.size
    };
  }
}

/**
 * Global rate limit store instance
 */
export const globalRateLimitStore = new RateLimitStore();

/**
 * Create a rate limiter function
 */
export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs = 60000,        // Default: 1 minute window
    maxRequests = 60,        // Default: 60 requests per minute
    blockDuration = 300000,  // Default: 5 minutes block
    identifier = () => 'global'  // Default: global rate limit
  } = options;
  
  return function rateLimit(req: any): { allowed: boolean; retryAfter?: number } {
    const key = identifier(req);
    const now = Date.now();
    
    // Get current record or create new one
    let record = globalRateLimitStore.get(key);
    
    // Check if currently blocked
    if (record?.blockedUntil && record.blockedUntil > now) {
      return { 
        allowed: false,
        retryAfter: Math.ceil((record.blockedUntil - now) / 1000) 
      };
    }
    
    // Create new record if none exists or window has expired
    if (!record || record.resetAt < now) {
      record = {
        count: 1,
        resetAt: now + windowMs
      };
      globalRateLimitStore.set(key, record);
      return { allowed: true };
    }
    
    // Increment request count
    record.count += 1;
    
    // Check if limit exceeded
    if (record.count > maxRequests) {
      record.blockedUntil = now + blockDuration;
      globalRateLimitStore.set(key, record);
      return { 
        allowed: false,
        retryAfter: Math.ceil(blockDuration / 1000) 
      };
    }
    
    // Update record
    globalRateLimitStore.set(key, record);
    return { allowed: true };
  };
}

/**
 * Helper to create a rate limiter with IP-based identification
 * (Note: In browser context, this uses simulated IPs)
 */
export function createIpRateLimiter(options: Omit<RateLimitOptions, 'identifier'>) {
  // In a browser environment, we'd typically use a session ID or device fingerprint
  // Here we're using a simplified approach for demonstration
  return createRateLimiter({
    ...options,
    identifier: (req) => {
      // In a real system with server-side code, we'd use req.ip
      // For browser-only, we'll use a combination of available data
      if (typeof window !== 'undefined') {
        // Simulate an "identity" from browser data
        // Note: This is not a real IP, just a fingerprinting approach
        const simulatedId = [
          window.navigator.userAgent,
          window.screen.width,
          window.screen.height,
          window.navigator.language
        ].join('|');
        
        return `browser:${simulatedId.split('').reduce((a, c) => (a + c.charCodeAt(0)), 0)}`;
      }
      
      // Fallback
      return 'unknown-client';
    }
  });
}
