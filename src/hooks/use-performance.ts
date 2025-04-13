
import { useEffect, useRef, useState, useCallback } from 'react';
import { performanceMonitor } from '@/utils/performance-monitor';

/**
 * Options for the usePerformance hook
 */
interface UsePerformanceOptions {
  componentName: string;
  trackProps?: boolean;
  reportThreshold?: number; // in ms
  trackRenders?: boolean;
  onPerformanceIssue?: (data: PerformanceData) => void;
}

/**
 * Performance data structure
 */
interface PerformanceData {
  componentName: string;
  renderTime: number;
  renderCount: number;
  propsChanged?: boolean;
  timestamp: number;
  isSlowRender: boolean;
}

/**
 * Hook that tracks component performance
 */
export function usePerformance<T extends Record<string, any>>({
  componentName,
  trackProps = false,
  reportThreshold = 16, // Default 16ms (60fps)
  trackRenders = true,
  onPerformanceIssue
}: UsePerformanceOptions) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());
  const lastProps = useRef<T | null>(null);
  const [isSlowRender, setIsSlowRender] = useState(false);

  // Track render time and count
  useEffect(() => {
    if (trackRenders) {
      const startTime = lastRenderTime.current;
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      renderCount.current += 1;
      
      // Log render time if it exceeds threshold
      if (renderTime > reportThreshold) {
        setIsSlowRender(true);
        
        const perfData: PerformanceData = {
          componentName,
          renderTime,
          renderCount: renderCount.current,
          timestamp: Date.now(),
          isSlowRender: true
        };
        
        // Report performance issue
        if (onPerformanceIssue) {
          onPerformanceIssue(perfData);
        }
        
        // Record performance mark
        performanceMonitor.mark(`slow-render-${componentName}`);
        performanceMonitor.measure(
          `${componentName}-render-time`,
          `slow-render-${componentName}`,
          undefined
        );
        
        // Log warning
        console.warn(
          `[Performance] Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms (threshold: ${reportThreshold}ms)`
        );
      } else {
        setIsSlowRender(false);
      }
      
      // Update last render time for next render
      lastRenderTime.current = performance.now();
    }
    
    return () => {
      // Cleanup if needed
    };
  });

  // Generate performance data object
  const getPerformanceData = useCallback((): PerformanceData => {
    return {
      componentName,
      renderTime: 0, // This will be measured when called
      renderCount: renderCount.current,
      timestamp: Date.now(),
      isSlowRender
    };
  }, [componentName, isSlowRender]);

  // Track props changes
  const trackPropsChange = useCallback((props: T) => {
    if (trackProps && lastProps.current) {
      const changedProps: string[] = [];
      
      // Find changed props
      Object.keys(props).forEach(key => {
        if (props[key] !== (lastProps.current as T)[key]) {
          changedProps.push(key);
        }
      });
      
      // Log if any props changed
      if (changedProps.length > 0) {
        console.debug(
          `[Performance] Props changed in ${componentName}:`,
          changedProps
        );
      }
    }
    
    // Update last props
    lastProps.current = { ...props };
  }, [componentName, trackProps]);

  return {
    isSlowRender,
    trackPropsChange,
    getPerformanceData,
    renderCount: renderCount.current
  };
}
