
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { performanceMonitor } from '@/utils/performance-monitor';

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

// Mock requestIdleCallback
if (typeof window !== 'undefined' && !window.requestIdleCallback) {
  window.requestIdleCallback = (callback) => setTimeout(callback, 0);
  window.cancelIdleCallback = (id) => clearTimeout(id);
}

describe('Performance Monitor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    performanceMonitor.clear();
    
    // Enable the performance monitor for tests
    performanceMonitor.enable(true);
    
    // Mock performance.now() to return incremental values
    let timeCounter = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => {
      timeCounter += 10;
      return timeCounter;
    });
  });
  
  it('creates performance marks correctly', () => {
    performanceMonitor.mark('test-mark');
    
    return performanceMonitor.getReport().then(report => {
      const marks = Array.from(report.marks);
      expect(marks).toContainEqual(
        expect.objectContaining({
          name: 'test-mark'
        })
      );
    });
  });
  
  it('measures time between marks correctly', async () => {
    performanceMonitor.mark('start-mark');
    performanceMonitor.mark('end-mark');
    
    // Call measure and wait for it to complete
    performanceMonitor.measure('test-measure', 'start-mark', 'end-mark');
    
    // Wait for any queued operations to complete
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const report = await performanceMonitor.getReport();
    
    // Check that the measure exists
    expect(report.measures).toContainEqual(
      expect.objectContaining({
        name: 'test-measure',
        start: 'start-mark',
        end: 'end-mark'
      })
    );
    
    // Assuming performance.now() increases by 10 each time, duration should be 10
    const measure = report.measures.find(m => m.name === 'test-measure');
    expect(measure?.duration).toBe(10);
  });
  
  it('handles missing marks gracefully', () => {
    performanceMonitor.mark('existing-mark');
    
    // Try to measure with a non-existent mark
    const result = performanceMonitor.measure('bad-measure', 'existing-mark', 'non-existent-mark');
    
    // Should return null for invalid measures
    expect(result).toBeNull();
    
    // Should log a warning
    expect(require('@/utils/logger').logger.warn).toHaveBeenCalled();
  });
  
  it('times async function execution', async () => {
    const asyncFn = async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return 'result';
    };
    
    const timedResult = await performanceMonitor.timeAsync('async-test', asyncFn);
    
    // Should return function result and execution time
    expect(typeof timedResult).toBe('object');
    expect(timedResult).toHaveProperty('result');
    expect(timedResult).toHaveProperty('executionTime');
  });
  
  it('times sync function execution', () => {
    const syncFn = () => {
      return 'sync result';
    };
    
    const result = performanceMonitor.time('sync-test', syncFn);
    
    // Should return function result
    expect(result).toBe('sync result');
  });
  
  it('maintains enabled/disabled state correctly', async () => {
    // Disable the monitor
    performanceMonitor.enable(false);
    
    // These calls should be no-ops when disabled
    performanceMonitor.mark('disabled-mark');
    const result = performanceMonitor.measure('disabled-measure', 'disabled-mark');
    
    expect(result).toBeNull();
    
    // Enable it again
    performanceMonitor.enable(true);
    
    // Now it should work
    performanceMonitor.mark('enabled-mark');
    performanceMonitor.measure('enabled-measure', 'enabled-mark');
    
    // Wait for any queued operations to complete
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const report = await performanceMonitor.getReport();
    
    // Should have the enabled mark but not the disabled one
    const marks = Array.from(report.marks);
    expect(marks).toContainEqual(
      expect.objectContaining({
        name: 'enabled-mark'
      })
    );
    expect(marks.find(m => m.name === 'disabled-mark')).toBeUndefined();
  });
  
  it('gets statistics for a specific operation', async () => {
    // Create multiple measures with the same name
    performanceMonitor.mark('op1-start');
    performanceMonitor.mark('op1-end');
    performanceMonitor.measure('operation1', 'op1-start', 'op1-end');
    
    performanceMonitor.mark('op2-start');
    performanceMonitor.mark('op2-end');
    performanceMonitor.measure('operation1', 'op2-start', 'op2-end');
    
    // Wait for queued operations
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const stats = await performanceMonitor.getOperationStats('operation1');
    
    expect(stats.count).toBe(2);
    expect(stats.totalDuration).toBeGreaterThan(0);
    expect(stats.averageDuration).toBeGreaterThan(0);
  });
  
  it('clears performance data', async () => {
    performanceMonitor.mark('mark-to-clear');
    
    // Wait for queued operations
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Check that the mark exists
    let report = await performanceMonitor.getReport();
    const marks = Array.from(report.marks);
    expect(marks).toContainEqual(
      expect.objectContaining({
        name: 'mark-to-clear'
      })
    );
    
    // Clear data
    performanceMonitor.clear();
    
    // Check that data is cleared
    report = await performanceMonitor.getReport();
    expect(Array.from(report.marks)).toHaveLength(0);
    expect(report.measures).toHaveLength(0);
  });
});
