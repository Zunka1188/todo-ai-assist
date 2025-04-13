
import { useEffect, useRef, useState, useCallback } from 'react';
import { performanceMonitor } from '@/utils/performance-monitor';
import { useDebounce } from '@/hooks/useDebounce';

/**
 * Options for the usePerformance hook
 */
interface UsePerformanceOptions {
  componentName: string;
  trackProps?: boolean;
  reportThreshold?: number; // in ms
  trackRenders?: boolean;
  onPerformanceIssue?: (data: PerformanceData) => void;
  debounceTime?: number; // in ms
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
  onPerformanceIssue,
  debounceTime = 300 // Default debounce time
}: UsePerformanceOptions) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());
  const lastProps = useRef<T | null>(null);
  const [isSlowRender, setIsSlowRender] = useState(false);
  const [renderTime, setRenderTime] = useState(0);
  
  // Debounce slow render state changes to prevent excessive re-renders
  const debouncedIsSlowRender = useDebounce(isSlowRender, debounceTime);
  const debouncedRenderTime = useDebounce(renderTime, debounceTime);

  // Track render time and count
  useEffect(() => {
    if (trackRenders) {
      const startTime = lastRenderTime.current;
      const endTime = performance.now();
      const currentRenderTime = endTime - startTime;
      
      renderCount.current += 1;
      setRenderTime(currentRenderTime);
      
      // Log render time if it exceeds threshold
      if (currentRenderTime > reportThreshold) {
        setIsSlowRender(true);
        
        // Use debounced reporting to reduce overhead
        if (debouncedIsSlowRender && onPerformanceIssue) {
          const perfData: PerformanceData = {
            componentName,
            renderTime: debouncedRenderTime,
            renderCount: renderCount.current,
            timestamp: Date.now(),
            isSlowRender: true
          };
          
          // Report performance issue
          onPerformanceIssue(perfData);
        }
        
        // Record performance mark - use requestIdleCallback if available
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => {
            performanceMonitor.mark(`slow-render-${componentName}`);
            performanceMonitor.measure(
              `${componentName}-render-time`,
              `slow-render-${componentName}`,
              undefined
            );
          });
        } else {
          // Fallback to setTimeout for browsers without requestIdleCallback
          setTimeout(() => {
            performanceMonitor.mark(`slow-render-${componentName}`);
            performanceMonitor.measure(
              `${componentName}-render-time`,
              `slow-render-${componentName}`,
              undefined
            );
          }, 0);
        }
        
        // Log warning - use debounced logging to prevent console spam
        if (debouncedIsSlowRender) {
          console.warn(
            `[Performance] Slow render detected in ${componentName}: ${currentRenderTime.toFixed(2)}ms (threshold: ${reportThreshold}ms)`
          );
        }
      } else {
        setIsSlowRender(false);
      }
      
      // Update last render time for next render
      lastRenderTime.current = performance.now();
    }
    
    // No cleanup needed for this effect
  }, [componentName, debouncedIsSlowRender, debouncedRenderTime, onPerformanceIssue, reportThreshold, trackRenders]);

  // Generate performance data object
  const getPerformanceData = useCallback((): PerformanceData => {
    return {
      componentName,
      renderTime: renderTime,
      renderCount: renderCount.current,
      timestamp: Date.now(),
      isSlowRender: isSlowRender
    };
  }, [componentName, isSlowRender, renderTime]);

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
      
      // Log if any props changed - use debounced logging
      if (changedProps.length > 0) {
        // Use requestIdleCallback for non-critical operations
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => {
            console.debug(
              `[Performance] Props changed in ${componentName}:`,
              changedProps
            );
          });
        } else {
          console.debug(
            `[Performance] Props changed in ${componentName}:`,
            changedProps
          );
        }
      }
    }
    
    // Update last props
    lastProps.current = { ...props };
  }, [componentName, trackProps]);

  return {
    isSlowRender: debouncedIsSlowRender,
    trackPropsChange,
    getPerformanceData,
    renderCount: renderCount.current
  };
}
