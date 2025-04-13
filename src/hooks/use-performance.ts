
import { useEffect, useRef } from 'react';
import { performanceMonitor } from '@/utils/performance-monitor';
import { logger } from '@/utils/logger';

interface UsePerformanceOptions {
  componentName: string;
  trackRenders?: boolean;
  trackMounts?: boolean;
  trackUnmounts?: boolean;
  debugMode?: boolean;
}

/**
 * Hook to track component performance
 */
export function usePerformance({
  componentName,
  trackRenders = true,
  trackMounts = true,
  trackUnmounts = true,
  debugMode = false
}: UsePerformanceOptions) {
  const renderCount = useRef(0);
  const mountTime = useRef(0);
  const renderStartTime = useRef(0);
  
  useEffect(() => {
    if (!performanceMonitor.isEnabled()) return;
    
    // Track mount time
    if (trackMounts) {
      mountTime.current = Date.now();
      performanceMonitor.mark(`${componentName}_mount`);
      
      if (debugMode) {
        logger.log(`[Performance] Component mounted: ${componentName}`);
      }
    }
    
    // Track unmount
    return () => {
      if (trackUnmounts && mountTime.current > 0) {
        const unmountTime = Date.now();
        const lifetimeDuration = unmountTime - mountTime.current;
        
        performanceMonitor.mark(`${componentName}_unmount`);
        performanceMonitor.measure(
          `${componentName}_lifetime`,
          `${componentName}_mount`,
          `${componentName}_unmount`
        );
        
        if (debugMode) {
          logger.log(`[Performance] Component unmounted: ${componentName} (lifetime: ${lifetimeDuration}ms)`);
        }
      }
    };
  }, [componentName, trackMounts, trackUnmounts, debugMode]);

  // Track renders
  useEffect(() => {
    if (trackRenders && performanceMonitor.isEnabled()) {
      renderCount.current++;
      
      if (renderStartTime.current > 0) {
        const renderTime = Date.now() - renderStartTime.current;
        
        if (debugMode && renderCount.current > 1) {
          logger.log(`[Performance] Component re-rendered: ${componentName} (render #${renderCount.current}, time: ${renderTime}ms)`);
        }
      }
      
      renderStartTime.current = Date.now();
    }
  });

  return {
    getRenderCount: () => renderCount.current,
    getComponentLifetime: () => mountTime.current > 0 ? Date.now() - mountTime.current : 0
  };
}

/**
 * HOC to wrap a component with performance tracking
 */
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<UsePerformanceOptions, 'componentName'>
) {
  const componentName = Component.displayName || Component.name || 'UnknownComponent';
  
  const WrappedComponent = (props: P) => {
    usePerformance({
      componentName,
      ...options
    });
    
    return <Component {...props} />;
  };
  
  WrappedComponent.displayName = `WithPerformance(${componentName})`;
  
  return WrappedComponent;
}
