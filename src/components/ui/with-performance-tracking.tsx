
import React, { useEffect, useState, useRef } from 'react';
import { performanceMonitor } from '@/utils/performance-monitor';
import { useDebounce } from '@/hooks/useDebounce';

interface WithPerformanceTrackingProps {
  componentName?: string;
  trackProps?: boolean;
  trackRenders?: boolean;
  debounceTime?: number;
}

/**
 * Higher Order Component that tracks performance metrics for a component
 */
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  options: WithPerformanceTrackingProps = {}
) {
  const {
    componentName = Component.displayName || Component.name || 'UnknownComponent',
    trackProps = false,
    trackRenders = true,
    debounceTime = 300
  } = options;

  // Use React.memo to prevent unnecessary re-renders of the wrapped component
  const WrappedComponent = React.memo((props: P) => {
    const [renderCount, setRenderCount] = useState(0);
    const timeoutRef = useRef<number | null>(null);
    const mountTimeRef = useRef<number>(0);
    const renderStartRef = useRef<number>(0);
    
    // Track initial component mount
    useEffect(() => {
      if (!performanceMonitor.isEnabled()) return;
      
      // Capture mount time more efficiently
      mountTimeRef.current = performance.now();
      
      // Record mount in a non-blocking way using requestIdleCallback
      const recordMount = () => {
        const mountName = `${componentName}_mount`;
        performanceMonitor.mark(`${mountName}_start`);
        performanceMonitor.mark(`${mountName}_end`);
        performanceMonitor.measure(mountName, `${mountName}_start`, `${mountName}_end`);
      };
      
      if (window.requestIdleCallback) {
        window.requestIdleCallback(recordMount);
      } else {
        setTimeout(recordMount, 0);
      }
      
      // Set initial render count
      setRenderCount(1);
      
      return () => {
        // Track unmount time in a non-blocking way
        if (performanceMonitor.isEnabled()) {
          const unmountName = `${componentName}_unmount`;
          const unmountTime = performance.now();
          const mountDuration = unmountTime - mountTimeRef.current;
          
          const recordUnmount = () => {
            performanceMonitor.mark(`${unmountName}_start`);
            performanceMonitor.mark(`${unmountName}_end`);
            performanceMonitor.measure(unmountName, `${unmountName}_start`, `${unmountName}_end`);
            
            // Also record total lifecycle duration
            performanceMonitor.mark(`${componentName}_lifecycle_end`);
            console.debug(`[Performance] ${componentName} lifecycle: ${mountDuration.toFixed(1)}ms`);
          };
          
          if (window.requestIdleCallback) {
            window.requestIdleCallback(recordUnmount);
          } else {
            setTimeout(recordUnmount, 0);
          }
        }
        
        // Clear any pending timeouts
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);
    
    // Track renders after initial mount
    useEffect(() => {
      if (!performanceMonitor.isEnabled() || !trackRenders || renderCount === 0) return;
      
      // Debounced render tracking to prevent excessive performance measurements
      const debouncedRenderTracking = () => {
        if (renderStartRef.current > 0) {
          const renderDuration = performance.now() - renderStartRef.current;
          const renderName = `${componentName}_render_${renderCount}`;
          
          performanceMonitor.mark(`${renderName}_end`);
          
          if (renderCount > 1) {
            const prevRenderName = `${componentName}_render_${renderCount - 1}`;
            performanceMonitor.measure(
              `${componentName}_rerender_${renderCount - 1}_to_${renderCount}`,
              `${prevRenderName}_end`,
              `${renderName}_end`
            );
          }
          
          // Only log if render took significant time (> 16ms)
          if (renderDuration > 16) {
            console.debug(`[Performance] ${componentName} render #${renderCount}: ${renderDuration.toFixed(1)}ms`);
          }
        }
        
        // Increment render count for next render
        setRenderCount(count => count + 1);
        renderStartRef.current = performance.now();
      };
      
      // Use debounce to prevent excessive measurements
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = window.setTimeout(debouncedRenderTracking, debounceTime) as unknown as number;
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [props, renderCount]);
    
    // Track prop changes if enabled
    useEffect(() => {
      if (!performanceMonitor.isEnabled() || !trackProps) return;
      
      const trackProps = () => {
        const propNames = Object.keys(props);
        if (propNames.length > 0) {
          performanceMonitor.mark(`${componentName}_props_update_${Date.now()}`);
        }
      };
      
      // Use non-blocking tracking
      if (window.requestIdleCallback) {
        window.requestIdleCallback(trackProps);
      } else {
        setTimeout(trackProps, 0);
      }
    }, Object.values(props));
    
    // Mark render start in a non-blocking way
    if (performanceMonitor.isEnabled() && trackRenders) {
      const renderName = `${componentName}_render_${renderCount + 1}`;
      
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => {
          performanceMonitor.mark(`${renderName}_start`);
        });
      } else {
        setTimeout(() => {
          performanceMonitor.mark(`${renderName}_start`);
        }, 0);
      }
    }
    
    return <Component {...props} />;
  });

  WrappedComponent.displayName = `WithPerformanceTracking(${componentName})`;
  
  return WrappedComponent;
}
