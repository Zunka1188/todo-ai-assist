
import { measureRenderTime, measureExecutionTime } from '../performance-testing';

describe('Performance Testing Utilities', () => {
  describe('measureRenderTime', () => {
    // Mock performance.now
    const originalPerformanceNow = performance.now;
    let nowMock: jest.Mock;
    
    beforeEach(() => {
      nowMock = jest.fn();
      nowMock.mockReturnValueOnce(100).mockReturnValueOnce(110);
      performance.now = nowMock;
    });
    
    afterEach(() => {
      performance.now = originalPerformanceNow;
    });
    
    it('correctly measures render time', () => {
      const mockCallback = jest.fn();
      const result = measureRenderTime(mockCallback, 1);
      
      expect(mockCallback).toHaveBeenCalledTimes(2); // Warmup + 1 iteration
      expect(result.average).toBe(10);
      expect(result.min).toBe(10);
      expect(result.max).toBe(10);
      expect(result.times).toEqual([10]);
    });
  });
  
  describe('measureExecutionTime', () => {
    // Mock performance.now
    const originalPerformanceNow = performance.now;
    let nowMock: jest.Mock;
    
    beforeEach(() => {
      nowMock = jest.fn();
      nowMock.mockReturnValueOnce(200).mockReturnValueOnce(220);
      performance.now = nowMock;
    });
    
    afterEach(() => {
      performance.now = originalPerformanceNow;
    });
    
    it('correctly measures execution time of synchronous functions', async () => {
      const mockFn = jest.fn().mockReturnValue('result');
      const result = await measureExecutionTime(mockFn, 'arg1', 'arg2');
      
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
      expect(result).toEqual({
        result: 'result',
        executionTime: 20
      });
    });
    
    it('correctly measures execution time of asynchronous functions', async () => {
      const mockAsyncFn = jest.fn().mockResolvedValue('async result');
      const result = await measureExecutionTime(mockAsyncFn, 'arg1', 'arg2');
      
      expect(mockAsyncFn).toHaveBeenCalledWith('arg1', 'arg2');
      expect(result).toEqual({
        result: 'async result',
        executionTime: 20
      });
    });
  });
});
