
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  measureRenderTime, 
  measureExecutionTime, 
  createPerformanceLogger,
  createRenderMonitor
} from '../performance-testing';

describe('Performance Testing Utilities', () => {
  beforeEach(() => {
    // Mock performance.now() to ensure consistent results in tests
    let perfCounter = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => {
      perfCounter += 10; // Each call advances by 10ms
      return perfCounter;
    });
  });

  describe('measureRenderTime', () => {
    it('correctly measures render time', () => {
      const mockRenderFn = vi.fn();
      
      const result = measureRenderTime(mockRenderFn, 3);
      
      // Each render should take 10ms due to our mocked performance.now
      expect(result.times).toHaveLength(3);
      expect(mockRenderFn).toHaveBeenCalledTimes(4); // 1 warmup + 3 measured calls
      expect(result.average).toBe(10);
      expect(result.min).toBe(10);
      expect(result.max).toBe(10);
      expect(result.total).toBe(30);
    });
  });

  describe('measureExecutionTime', () => {
    it('correctly measures execution time of synchronous functions', async () => {
      const syncFn = vi.fn(() => 'result');
      
      const result = await measureExecutionTime(syncFn, 'arg1', 'arg2');
      
      expect(syncFn).toHaveBeenCalledWith('arg1', 'arg2');
      expect(result.result).toBe('result');
      expect(result.executionTime).toBe(10);
    });

    it('correctly measures execution time of asynchronous functions', async () => {
      const asyncFn = vi.fn(async () => {
        return 'async result';
      });
      
      const result = await measureExecutionTime(asyncFn);
      
      expect(asyncFn).toHaveBeenCalled();
      expect(result.result).toBe('async result');
      expect(result.executionTime).toBe(10);
    });
  });

  describe('createPerformanceLogger', () => {
    it('creates a logger that tracks markers and measures durations', () => {
      const logger = createPerformanceLogger('TestLogger');
      
      logger.mark('start');
      logger.mark('middle');
      logger.mark('end');
      
      const duration = logger.measure('start', 'end', 'total');
      
      expect(duration).toBe(20);
      
      const report = logger.getReport();
      expect(report.name).toBe('TestLogger');
      expect(report.markers).toHaveProperty('start');
      expect(report.markers).toHaveProperty('middle');
      expect(report.markers).toHaveProperty('end');
      expect(report.durations).toHaveProperty('total', 20);
    });
  });

  describe('createRenderMonitor', () => {
    it('tracks component render counts', () => {
      const monitor = createRenderMonitor();
      
      monitor.onRender('ComponentA');
      monitor.onRender('ComponentB');
      monitor.onRender('ComponentA');
      
      const counts = monitor.getRenderCounts();
      
      expect(counts).toEqual({
        ComponentA: 2,
        ComponentB: 1
      });
      
      // Test reset functionality
      monitor.reset();
      expect(monitor.getRenderCounts()).toEqual({});
    });
  });
});
