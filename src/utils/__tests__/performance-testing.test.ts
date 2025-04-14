
import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  measureRenderTime,
  measureExecutionTime,
  createPerformanceLogger,
  createRenderMonitor
} from '../performance-testing';

describe('Performance Testing Utilities', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Mock performance.now
    const originalPerformanceNow = performance.now;
    let counter = 0;
    
    performance.now = vi.fn(() => {
      counter += 10; // Increment by 10ms each call for predictable results
      return counter;
    });
    
    return () => {
      performance.now = originalPerformanceNow;
    };
  });
  
  describe('measureRenderTime', () => {
    it('measures rendering time correctly', () => {
      const mockRender = vi.fn();
      const result = measureRenderTime(mockRender, 3);
      
      expect(mockRender).toHaveBeenCalledTimes(4); // 1 warm-up + 3 measurements
      expect(result).toHaveProperty('average');
      expect(result).toHaveProperty('min');
      expect(result).toHaveProperty('max');
      expect(result).toHaveProperty('times');
      expect(result.times.length).toBe(3); // 3 measurements
    });
    
    it('returns expected metrics', () => {
      const mockRender = vi.fn();
      const result = measureRenderTime(mockRender, 3);
      
      // Because of our mock, each call to performance.now increases by 10ms
      // So each render takes 10ms (end - start)
      expect(result.average).toBe(10);
      expect(result.min).toBe(10);
      expect(result.max).toBe(10);
      expect(result.total).toBe(30); // 3 * 10ms
    });
  });
  
  describe('measureExecutionTime', () => {
    it('measures execution time for synchronous functions', async () => {
      const syncFunc = () => 'result';
      const { result, executionTime } = await measureExecutionTime(syncFunc);
      
      expect(result).toBe('result');
      expect(executionTime).toBe(10); // Because of our mock increasing by 10ms each call
    });
    
    it('measures execution time for asynchronous functions', async () => {
      const asyncFunc = async () => {
        return new Promise(resolve => {
          setTimeout(() => resolve('async result'), 1);
        });
      };
      
      const { result, executionTime } = await measureExecutionTime(asyncFunc);
      
      expect(result).toBe('async result');
      expect(executionTime).toBe(10); // Because of our mock
    });
    
    it('passes arguments to the measured function', async () => {
      const funcWithArgs = (a: number, b: number) => a + b;
      const { result } = await measureExecutionTime(funcWithArgs, 3, 4);
      
      expect(result).toBe(7);
    });
  });
  
  describe('createPerformanceLogger', () => {
    it('creates a logger with the specified name', () => {
      const logger = createPerformanceLogger('TestLogger');
      
      expect(logger).toHaveProperty('mark');
      expect(logger).toHaveProperty('measure');
      expect(logger).toHaveProperty('getReport');
      
      const report = logger.getReport();
      expect(report.name).toBe('TestLogger');
    });
    
    it('records markers and measures durations', () => {
      const logger = createPerformanceLogger('TestLogger');
      
      logger.mark('start');
      logger.mark('middle');
      logger.mark('end');
      
      const durationStartToMiddle = logger.measure('start', 'middle');
      const durationMiddleToEnd = logger.measure('middle', 'end');
      const durationCustomLabel = logger.measure('start', 'end', 'full-process');
      
      // Each mark increases by 10ms because of our mock
      expect(durationStartToMiddle).toBe(10);
      expect(durationMiddleToEnd).toBe(10);
      expect(durationCustomLabel).toBe(20);
      
      const report = logger.getReport();
      expect(report.durations).toHaveProperty('start to middle', 10);
      expect(report.durations).toHaveProperty('middle to end', 10);
      expect(report.durations).toHaveProperty('full-process', 20);
    });
    
    it('throws error for missing markers', () => {
      const logger = createPerformanceLogger('TestLogger');
      
      logger.mark('start');
      
      expect(() => {
        logger.measure('start', 'nonexistent');
      }).toThrow('Missing marker: nonexistent');
    });
  });
  
  describe('createRenderMonitor', () => {
    it('tracks component renders', () => {
      const monitor = createRenderMonitor();
      
      monitor.onRender('ComponentA');
      monitor.onRender('ComponentB');
      monitor.onRender('ComponentA');
      
      const counts = monitor.getRenderCounts();
      expect(counts).toHaveProperty('ComponentA', 2);
      expect(counts).toHaveProperty('ComponentB', 1);
    });
    
    it('resets render counts', () => {
      const monitor = createRenderMonitor();
      
      monitor.onRender('ComponentA');
      monitor.onRender('ComponentB');
      
      let counts = monitor.getRenderCounts();
      expect(Object.keys(counts).length).toBe(2);
      
      monitor.reset();
      
      counts = monitor.getRenderCounts();
      expect(Object.keys(counts).length).toBe(0);
    });
  });
});
