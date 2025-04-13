
/**
 * Performance monitoring utilities for the application
 * With optimizations to prevent synchronous performance.now() calls in hot paths
 */
import { logger } from './logger';

interface PerformanceMark {
  name: string;
  timestamp: number;
}

interface PerformanceMeasure {
  name: string;
  duration: number;
  start: string;
  end: string;
  timestamp: number;
}

class PerformanceMonitor {
  private marks: Map<string, PerformanceMark> = new Map();
  private measures: PerformanceMeasure[] = [];
  private enabled: boolean = false;
  private sessionStartTime: number = 0;
  private queued: Array<() => void> = [];
  private isProcessing: boolean = false;
  private idleCallbackId: number | null = null;

  constructor() {
    this.sessionStartTime = Date.now();
  }

  /**
   * Enable or disable performance monitoring
   */
  enable(value: boolean = true): void {
    this.enabled = value;
    if (value) {
      this.sessionStartTime = Date.now();
      this.marks.clear();
      this.measures = [];
      logger.log('[Performance] Monitoring enabled');
      // Process any queued operations
      this.processQueue();
    } else {
      logger.log('[Performance] Monitoring disabled');
      // Cancel any pending idle callbacks
      if (this.idleCallbackId !== null && typeof window !== 'undefined' && window.cancelIdleCallback) {
        window.cancelIdleCallback(this.idleCallbackId);
        this.idleCallbackId = null;
      }
    }
  }

  /**
   * Check if monitoring is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Process queued operations when idle
   */
  private processQueue(): void {
    if (!this.enabled || this.queued.length === 0 || this.isProcessing) return;
    
    this.isProcessing = true;
    
    const processNow = () => {
      const batchSize = Math.min(10, this.queued.length);
      const batch = this.queued.splice(0, batchSize);
      
      batch.forEach(op => {
        try {
          op();
        } catch (error) {
          logger.error('[Performance] Error in queued operation:', error);
        }
      });
      
      if (this.queued.length > 0) {
        // Schedule next batch
        this.scheduleProcessing();
      } else {
        this.isProcessing = false;
      }
    };
    
    this.scheduleProcessing(processNow);
  }
  
  /**
   * Schedule processing using requestIdleCallback or setTimeout
   */
  private scheduleProcessing(callback = this.processQueue.bind(this)): void {
    if (typeof window !== 'undefined') {
      if (window.requestIdleCallback) {
        this.idleCallbackId = window.requestIdleCallback(() => {
          this.idleCallbackId = null;
          callback();
        }, { timeout: 1000 }) as unknown as number;
      } else {
        setTimeout(callback, 0);
      }
    }
  }

  /**
   * Record a performance mark
   */
  mark(name: string): void {
    if (!this.enabled) return;
    
    const timestamp = performance.now();
    this.marks.set(name, { name, timestamp });
  }

  /**
   * Measure time between two marks in a non-blocking way
   */
  measure(name: string, startMark: string, endMark?: string): number | null {
    if (!this.enabled) return null;
    
    const operation = () => {
      const start = this.marks.get(startMark);
      if (!start) {
        logger.warn(`[Performance] Missing start mark for measure "${name}": ${startMark}`);
        return null;
      }
      
      let end;
      if (endMark) {
        end = this.marks.get(endMark);
        if (!end) {
          logger.warn(`[Performance] Missing end mark for measure "${name}": ${endMark}`);
          return null;
        }
      } else {
        // Use current time if no end mark specified
        end = { name: `${name}_end_auto`, timestamp: performance.now() };
      }
      
      const duration = end.timestamp - start.timestamp;
      
      const measure: PerformanceMeasure = {
        name,
        duration,
        start: startMark,
        end: endMark || end.name,
        timestamp: Date.now()
      };
      
      this.measures.push(measure);
      
      // Log if duration exceeds threshold (100ms)
      if (duration > 100) {
        logger.warn(`[Performance] Slow operation: ${name} took ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    };
    
    // Queue or execute the operation based on priority
    if (name.includes('critical') || name.includes('user_interaction')) {
      return operation();
    } else {
      this.queued.push(operation);
      this.processQueue();
      return null;
    }
  }

  /**
   * Time a function execution asynchronously
   */
  async timeAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    if (!this.enabled) {
      return fn();
    }
    
    const startMark = `${name}_start_${Date.now()}`;
    const endMark = `${name}_end_${Date.now()}`;
    
    this.mark(startMark);
    try {
      const result = await fn();
      this.mark(endMark);
      this.measure(name, startMark, endMark);
      return result;
    } catch (error) {
      this.mark(endMark);
      this.measure(`${name}_error`, startMark, endMark);
      throw error;
    }
  }

  /**
   * Time a synchronous function execution
   */
  time<T>(name: string, fn: () => T): T {
    if (!this.enabled) {
      return fn();
    }
    
    const startMark = `${name}_start_${Date.now()}`;
    const endMark = `${name}_end_${Date.now()}`;
    
    this.mark(startMark);
    try {
      const result = fn();
      this.mark(endMark);
      this.queued.push(() => this.measure(name, startMark, endMark));
      this.processQueue();
      return result;
    } catch (error) {
      this.mark(endMark);
      this.queued.push(() => this.measure(`${name}_error`, startMark, endMark));
      this.processQueue();
      throw error;
    }
  }

  /**
   * Get performance report - non-blocking for large datasets
   */
  getReport(): Promise<{ marks: PerformanceMark[]; measures: PerformanceMeasure[]; sessionDuration: number }> {
    return new Promise(resolve => {
      if (!this.enabled) {
        resolve({
          marks: [],
          measures: [],
          sessionDuration: 0
        });
        return;
      }
      
      // Process any queued operations first
      this.processQueue();
      
      // Use setTimeout to avoid blocking the main thread with large datasets
      setTimeout(() => {
        resolve({
          marks: Array.from(this.marks.values()),
          measures: this.measures,
          sessionDuration: Date.now() - this.sessionStartTime
        });
      }, 0);
    });
  }

  /**
   * Get statistics for a specific operation - optimized for large datasets
   */
  getOperationStats(operationName: string): Promise<{ 
    count: number; 
    totalDuration: number; 
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
  }> {
    return new Promise(resolve => {
      if (!this.enabled) {
        resolve({
          count: 0,
          totalDuration: 0,
          averageDuration: 0,
          minDuration: 0,
          maxDuration: 0
        });
        return;
      }
      
      // Process stats in a non-blocking way
      setTimeout(() => {
        const relevantMeasures = this.measures.filter(m => m.name === operationName);
        
        if (relevantMeasures.length === 0) {
          resolve({
            count: 0,
            totalDuration: 0,
            averageDuration: 0,
            minDuration: 0,
            maxDuration: 0
          });
          return;
        }
        
        const durations = relevantMeasures.map(m => m.duration);
        const totalDuration = durations.reduce((sum, duration) => sum + duration, 0);
        
        resolve({
          count: relevantMeasures.length,
          totalDuration,
          averageDuration: totalDuration / relevantMeasures.length,
          minDuration: Math.min(...durations),
          maxDuration: Math.max(...durations)
        });
      }, 0);
    });
  }

  /**
   * Clear all performance data
   */
  clear(): void {
    this.marks.clear();
    this.measures = [];
    this.queued = [];
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for components to use
export function usePerformanceMonitor() {
  return performanceMonitor;
}
