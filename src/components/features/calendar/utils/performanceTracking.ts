
// Performance tracking utilities for calendar components
import { Component, ComponentType, forwardRef } from 'react';

interface PerformanceTrackingOptions {
  componentName?: string;
  logToConsole?: boolean;
  logToAnalytics?: boolean;
  eventsCount?: number;
  threshold?: number;
}

/**
 * Tracks render performance of a component
 * @param componentName Name of the component being tracked
 * @param startTime Performance start time
 * @param options Additional tracking options
 */
export const trackRenderPerformance = (
  componentName: string, 
  startTime: number,
  options: PerformanceTrackingOptions = {}
): void => {
  const endTime = performance.now();
  const renderTime = endTime - startTime;
  const { 
    logToConsole = false, 
    logToAnalytics = false,
    eventsCount,
    threshold = 100 
  } = options;
  
  // Only log if render time exceeds threshold
  if (renderTime > threshold) {
    if (logToConsole) {
      console.warn(`[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render${eventsCount ? ` with ${eventsCount} events` : ''}`);
    }
    
    if (logToAnalytics) {
      // Send to analytics service
      try {
        const analyticsData = {
          component: componentName,
          renderTime,
          timestamp: new Date().toISOString(),
          eventsCount
        };
        
        // Analytics tracking code would go here
        // analyticsService.trackMetric('component_render_time', analyticsData);
        
      } catch (error) {
        console.error('[Performance] Failed to send analytics:', error);
      }
    }
  }
};

interface PerformanceData {
  componentName: string;
  renderCount: number;
  totalRenderTime: number;
  lastRenderTime: number;
  averageRenderTime: number;
  worstRenderTime: number;
  renderTimestamps: number[];
}

const performanceStore: Record<string, PerformanceData> = {};

/**
 * Records performance data for a component
 * @param componentName Name of the component
 * @param renderTime Time it took to render in milliseconds
 */
export const recordPerformance = (componentName: string, renderTime: number): void => {
  if (!performanceStore[componentName]) {
    performanceStore[componentName] = {
      componentName,
      renderCount: 0,
      totalRenderTime: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
      worstRenderTime: 0,
      renderTimestamps: []
    };
  }
  
  const data = performanceStore[componentName];
  data.renderCount++;
  data.totalRenderTime += renderTime;
  data.lastRenderTime = renderTime;
  data.averageRenderTime = data.totalRenderTime / data.renderCount;
  data.worstRenderTime = Math.max(data.worstRenderTime, renderTime);
  data.renderTimestamps.push(Date.now());
};

/**
 * Gets performance data for a specific component
 * @param componentName Name of the component
 * @returns Performance data for the component
 */
export const getComponentPerformance = (componentName: string): PerformanceData | null => {
  return performanceStore[componentName] || null;
};

/**
 * Gets all recorded performance data
 * @returns Object with all performance data
 */
export const getAllPerformanceData = (): Record<string, PerformanceData> => {
  return { ...performanceStore };
};

/**
 * Higher-order component that tracks render performance
 * @param WrappedComponent Component to track
 * @param options Performance tracking options
 * @returns Enhanced component with performance tracking
 */
export function withPerformanceTracking<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: PerformanceTrackingOptions = {}
): ComponentType<P> {
  const componentName = options.componentName || WrappedComponent.displayName || WrappedComponent.name || 'UnknownComponent';
  
  class WithPerformance extends Component<P> {
    displayName = `WithPerformance(${componentName})`;
    renderStartTime: number = 0;
    
    componentWillMount() {
      this.renderStartTime = performance.now();
    }
    
    componentDidMount() {
      const renderTime = performance.now() - this.renderStartTime;
      trackRenderPerformance(componentName, this.renderStartTime, {
        ...options,
        logToConsole: true
      });
      recordPerformance(componentName, renderTime);
    }
    
    componentWillUpdate() {
      this.renderStartTime = performance.now();
    }
    
    componentDidUpdate() {
      const renderTime = performance.now() - this.renderStartTime;
      trackRenderPerformance(componentName, this.renderStartTime, options);
      recordPerformance(componentName, renderTime);
    }
    
    render() {
      return <WrappedComponent {...this.props} />;
    }
  }
  
  return WithPerformance;
}

/**
 * Tracks load time for calendar views
 * @param viewName Name of the view (month, week, day)
 * @param startTime Performance start time
 */
export const trackCalendarViewLoad = (viewName: string, startTime: number): void => {
  const loadTime = performance.now() - startTime;
  console.log(`[Calendar] ${viewName} view loaded in ${loadTime.toFixed(2)}ms`);
  
  // Could also send this to analytics
  recordPerformance(`CalendarView_${viewName}`, loadTime);
};
