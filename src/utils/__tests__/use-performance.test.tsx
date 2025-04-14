
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { usePerformance } from '@/hooks/use-performance';

// Mock the performanceMonitor
vi.mock('@/utils/performance-monitor', () => ({
  performanceMonitor: {
    mark: vi.fn(),
    measure: vi.fn()
  }
}));

// Mock requestIdleCallback for testing
if (typeof window !== 'undefined' && !window.requestIdleCallback) {
  window.requestIdleCallback = (callback) => setTimeout(callback, 0);
  window.cancelIdleCallback = (id) => clearTimeout(id);
}

describe('usePerformance Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock performance.now() to return incremental values
    let timeCounter = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => {
      timeCounter += 10;
      return timeCounter;
    });
  });
  
  it('tracks render times properly', async () => {
    // Render the hook
    const { result, rerender } = renderHook(
      (props) => usePerformance({
        componentName: 'TestComponent',
        trackRenders: true,
        ...props
      }),
      { initialProps: { reportThreshold: 5 } }
    );
    
    // First render
    expect(result.current.renderCount).toBe(0);
    
    // Trigger a re-render
    rerender();
    
    // Let async operations complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    
    expect(result.current.renderCount).toBeGreaterThan(0);
    
    // Since we mocked performance.now() to increment by 10 each time,
    // and our threshold is 5, this should be a slow render
    expect(result.current.isSlowRender).toBe(true);
  });
  
  it('identifies slow renders correctly', async () => {
    // Create a performance monitor mock that reports fast renders
    vi.spyOn(performance, 'now').mockImplementation(() => 1);
    
    const { result, rerender } = renderHook(
      () => usePerformance({
        componentName: 'FastComponent',
        trackRenders: true,
        reportThreshold: 5
      })
    );
    
    // Trigger a re-render
    rerender();
    
    // Let async operations complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    
    // Should not be a slow render
    expect(result.current.isSlowRender).toBe(false);
    
    // Now make it slow
    vi.spyOn(performance, 'now').mockImplementation(() => 10);
    
    rerender();
    
    // Let async operations complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    
    // Now it should be a slow render
    expect(result.current.isSlowRender).toBe(true);
  });
  
  it('tracks props changes correctly', () => {
    const { result } = renderHook(
      () => usePerformance({
        componentName: 'TrackPropsComponent',
        trackProps: true
      })
    );
    
    // Call trackPropsChange with initial props
    act(() => {
      result.current.trackPropsChange({ name: 'test', count: 1 });
    });
    
    // Call trackPropsChange with changed props
    act(() => {
      result.current.trackPropsChange({ name: 'test', count: 2 });
    });
    
    // Cannot easily test console output, but we can ensure it doesn't crash
    expect(result.current.renderCount).toBe(0);
  });
  
  it('calls onPerformanceIssue when renders are slow', async () => {
    const onPerformanceIssueMock = vi.fn();
    
    // Mock a slow render
    vi.spyOn(performance, 'now').mockImplementation(() => 20);
    
    const { result, rerender } = renderHook(
      () => usePerformance({
        componentName: 'SlowComponent',
        trackRenders: true,
        reportThreshold: 5,
        onPerformanceIssue: onPerformanceIssueMock,
        debounceTime: 0 // No debounce for testing
      })
    );
    
    // First render won't trigger callback
    expect(onPerformanceIssueMock).not.toHaveBeenCalled();
    
    // Trigger a re-render
    rerender();
    
    // Let async operations complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    
    // Now the callback should be called
    expect(onPerformanceIssueMock).toHaveBeenCalled();
    
    // Check that it was called with the right data
    expect(onPerformanceIssueMock).toHaveBeenCalledWith(
      expect.objectContaining({
        componentName: 'SlowComponent',
        isSlowRender: true
      })
    );
  });
  
  it('returns accurate performance data', () => {
    const { result, rerender } = renderHook(
      () => usePerformance({
        componentName: 'DataComponent',
        trackRenders: true
      })
    );
    
    // Force a re-render
    rerender();
    
    // Get performance data
    const perfData = result.current.getPerformanceData();
    
    // Check data structure
    expect(perfData).toHaveProperty('componentName', 'DataComponent');
    expect(perfData).toHaveProperty('renderCount');
    expect(perfData).toHaveProperty('renderTime');
    expect(perfData).toHaveProperty('isSlowRender');
    expect(perfData).toHaveProperty('timestamp');
    
    // Timestamp should be a number representing current time
    expect(typeof perfData.timestamp).toBe('number');
  });
});
