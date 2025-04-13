
/**
 * Performance monitoring utilities for the application
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
    } else {
      logger.log('[Performance] Monitoring disabled');
    }
  }

  /**
   * Check if monitoring is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Record a performance mark
   */
  mark(name: string): void {
    if (!this.enabled) return;
    
    const timestamp = Date.now();
    this.marks.set(name, { name, timestamp });
  }

  /**
   * Measure time between two marks
   */
  measure(name: string, startMark: string, endMark: string): number | null {
    if (!this.enabled) return null;
    
    const start = this.marks.get(startMark);
    const end = this.marks.get(endMark);
    
    if (!start || !end) {
      logger.warn(`[Performance] Missing mark for measure "${name}": ${!start ? startMark : endMark}`);
      return null;
    }
    
    const duration = end.timestamp - start.timestamp;
    
    const measure: PerformanceMeasure = {
      name,
      duration,
      start: startMark,
      end: endMark,
      timestamp: Date.now()
    };
    
    this.measures.push(measure);
    
    // Log if duration exceeds threshold (100ms)
    if (duration > 100) {
      logger.warn(`[Performance] Slow operation: ${name} took ${duration}ms`);
    }
    
    return duration;
  }

  /**
   * Time a function execution
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
      this.measure(name, startMark, endMark);
      return result;
    } catch (error) {
      this.mark(endMark);
      this.measure(`${name}_error`, startMark, endMark);
      throw error;
    }
  }

  /**
   * Get performance report
   */
  getReport(): { marks: PerformanceMark[]; measures: PerformanceMeasure[]; sessionDuration: number } {
    return {
      marks: Array.from(this.marks.values()),
      measures: this.measures,
      sessionDuration: Date.now() - this.sessionStartTime
    };
  }

  /**
   * Get statistics for a specific operation
   */
  getOperationStats(operationName: string): { 
    count: number; 
    totalDuration: number; 
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
  } {
    const relevantMeasures = this.measures.filter(m => m.name === operationName);
    
    if (relevantMeasures.length === 0) {
      return {
        count: 0,
        totalDuration: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0
      };
    }
    
    const durations = relevantMeasures.map(m => m.duration);
    const totalDuration = durations.reduce((sum, duration) => sum + duration, 0);
    
    return {
      count: relevantMeasures.length,
      totalDuration,
      averageDuration: totalDuration / relevantMeasures.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations)
    };
  }

  /**
   * Clear all performance data
   */
  clear(): void {
    this.marks.clear();
    this.measures = [];
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for components to use
export function usePerformanceMonitor() {
  return performanceMonitor;
}
