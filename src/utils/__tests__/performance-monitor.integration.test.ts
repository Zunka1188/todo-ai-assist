
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { performanceMonitor } from '../performance-monitor';

describe('Performance Monitor Integration Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    performanceMonitor.clear();
    performanceMonitor.enable(true);
  });

  afterEach(() => {
    vi.useRealTimers();
    performanceMonitor.enable(false);
  });

  it('accurately tracks multiple performance marks', () => {
    // Record multiple marks
    performanceMonitor.mark('test_start');
    vi.advanceTimersByTime(50);
    performanceMonitor.mark('test_middle');
    vi.advanceTimersByTime(75);
    performanceMonitor.mark('test_end');

    // Measure the spans
    const firstSpan = performanceMonitor.measure('first_half', 'test_start', 'test_middle');
    const secondSpan = performanceMonitor.measure('second_half', 'test_middle', 'test_end');
    const totalSpan = performanceMonitor.measure('total', 'test_start', 'test_end');

    // Check approximate duration values
    expect(firstSpan).toBeCloseTo(50, -1);
    expect(secondSpan).toBeCloseTo(75, -1);
    expect(totalSpan).toBeCloseTo(125, -1);
  });

  it('properly queues and processes non-critical operations', async () => {
    // Create several marks
    performanceMonitor.mark('queue_test_start');
    for (let i = 0; i < 5; i++) {
      performanceMonitor.mark(`queue_step_${i}`);
      vi.advanceTimersByTime(10);
    }
    performanceMonitor.mark('queue_test_end');

    // Measure multiple spans that will be queued
    for (let i = 0; i < 4; i++) {
      performanceMonitor.measure(`queued_span_${i}`, `queue_step_${i}`, `queue_step_${i + 1}`);
    }
    
    // Allow idle callback to process
    vi.runAllTimers();
    
    // Verify all measurements were processed
    const report = await performanceMonitor.getReport();
    expect(report.measures.length).toBeGreaterThanOrEqual(4);
  });

  it('successfully times async function execution', async () => {
    const mockAsyncFunction = vi.fn().mockImplementation(async () => {
      vi.advanceTimersByTime(100);
      return 'result';
    });

    const { result, executionTime } = await performanceMonitor.timeAsync('async_test', mockAsyncFunction);

    expect(result).toBe('result');
    expect(executionTime).toBeGreaterThan(0);
    expect(mockAsyncFunction).toHaveBeenCalledTimes(1);
  });

  it('correctly times synchronous function execution', () => {
    const mockSyncFunction = vi.fn().mockImplementation(() => {
      vi.advanceTimersByTime(50);
      return 'sync result';
    });

    const result = performanceMonitor.time('sync_test', mockSyncFunction);

    expect(result).toBe('sync result');
    expect(mockSyncFunction).toHaveBeenCalledTimes(1);
  });

  it('properly handles errors in timed functions', async () => {
    const errorMessage = 'Test error';
    const mockErrorFunction = vi.fn().mockImplementation(() => {
      throw new Error(errorMessage);
    });

    expect(() => {
      performanceMonitor.time('error_test', mockErrorFunction);
    }).toThrow(errorMessage);
    
    const mockAsyncErrorFunction = vi.fn().mockImplementation(async () => {
      throw new Error(errorMessage);
    });
    
    await expect(performanceMonitor.timeAsync('async_error_test', mockAsyncErrorFunction))
      .rejects.toThrow(errorMessage);
  });

  it('generates accurate operation statistics', async () => {
    // Create multiple measurements for the same operation
    for (let i = 0; i < 3; i++) {
      const startMark = `stats_start_${i}`;
      const endMark = `stats_end_${i}`;
      
      performanceMonitor.mark(startMark);
      vi.advanceTimersByTime(50 + i * 10); // Varying durations: 50, 60, 70ms
      performanceMonitor.mark(endMark);
      
      performanceMonitor.measure('test_operation', startMark, endMark);
    }
    
    vi.runAllTimers(); // Process any queued operations
    
    const stats = await performanceMonitor.getOperationStats('test_operation');
    
    expect(stats.count).toBe(3);
    expect(stats.totalDuration).toBeGreaterThan(0);
    expect(stats.averageDuration).toBeGreaterThan(0);
    expect(stats.minDuration).toBeCloseTo(50, -1);
    expect(stats.maxDuration).toBeCloseTo(70, -1);
  });
});
