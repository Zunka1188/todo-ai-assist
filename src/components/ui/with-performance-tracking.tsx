
import React, { useEffect, useState } from 'react';
import { performanceMonitor } from '@/utils/performance-monitor';

interface WithPerformanceTrackingProps {
  componentName?: string;
  trackProps?: boolean;
  trackRenders?: boolean;
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
  } = options;

  const WrappedComponent = (props: P) => {
    const [renderCount, setRenderCount] = useState(0);

    useEffect(() => {
      if (!performanceMonitor.isEnabled()) return;
      
      // Track mount time
      const mountName = `${componentName}_mount`;
      performanceMonitor.mark(`${mountName}_start`);
      
      // Track initial render time
      setRenderCount(1);
      performanceMonitor.mark(`${mountName}_end`);
      performanceMonitor.measure(mountName, `${mountName}_start`, `${mountName}_end`);
      
      return () => {
        // Track unmount time
        if (performanceMonitor.isEnabled()) {
          const unmountName = `${componentName}_unmount`;
          performanceMonitor.mark(`${unmountName}_start`);
          
          // Simulate end of unmount process in next tick
          setTimeout(() => {
            performanceMonitor.mark(`${unmountName}_end`);
            performanceMonitor.measure(
              unmountName, 
              `${unmountName}_start`, 
              `${unmountName}_end`
            );
          }, 0);
        }
      };
    }, []);
    
    useEffect(() => {
      if (!performanceMonitor.isEnabled() || !trackRenders || renderCount === 0) return;
      
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
      
      setRenderCount(count => count + 1);
    }, [props, renderCount]);
    
    // Track prop changes if enabled
    useEffect(() => {
      if (!performanceMonitor.isEnabled() || !trackProps) return;
      
      Object.keys(props).forEach(propName => {
        const propValue = (props as any)[propName];
        const propId = `${componentName}_prop_${propName}`;
        performanceMonitor.mark(`${propId}_${Date.now()}`);
      });
    }, Object.values(props));
    
    // Mark render start
    if (performanceMonitor.isEnabled() && trackRenders) {
      const renderName = `${componentName}_render_${renderCount + 1}`;
      performanceMonitor.mark(`${renderName}_start`);
    }
    
    return <Component {...props} />;
  };

  WrappedComponent.displayName = `WithPerformanceTracking(${componentName})`;
  
  return WrappedComponent;
}
