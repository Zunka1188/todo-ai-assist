
// This file implements performance tracking for calendar components

/**
 * Track component performance with timing information
 * @param componentName Name of the component being tracked
 * @param operation Operation being performed
 * @param duration Duration in milliseconds
 */
export const trackPerformance = (componentName: string, operation: string, duration: number) => {
  console.log(`Performance tracking: ${componentName} - ${operation} took ${duration}ms`);
  
  // Report to performance monitoring service
  if (typeof window !== 'undefined' && window.performance) {
    const mark = `${componentName}_${operation}`;
    performance.mark(mark);
    
    try {
      performance.measure(
        `${componentName}_${operation}_measure`, 
        mark
      );
    } catch (e) {
      console.error('Performance measurement error:', e);
    }
  }
};

// For backwards compatibility with existing code
export const trackRenderPerformance = trackPerformance;

export const startTracking = (componentName: string, operation: string) => {
  const markName = `${componentName}_${operation}_start`;
  if (typeof window !== 'undefined' && window.performance) {
    performance.mark(markName);
  }
  return markName;
};

export const endTracking = (startMark: string, componentName: string, operation: string) => {
  if (typeof window !== 'undefined' && window.performance) {
    const endMark = `${componentName}_${operation}_end`;
    performance.mark(endMark);
    
    try {
      performance.measure(
        `${componentName}_${operation}_measure`,
        startMark,
        endMark
      );
      
      const entries = performance.getEntriesByName(`${componentName}_${operation}_measure`);
      if (entries && entries.length > 0) {
        const duration = entries[0].duration;
        console.log(`${componentName} - ${operation}: ${duration.toFixed(2)}ms`);
        return duration;
      }
    } catch (e) {
      console.error('Performance measurement error:', e);
    }
  }
  return 0;
};

// Store performance data for components
const performanceData: Record<string, Array<{ component: string, operation: string, renderTime: number }>> = {};

// Get performance data for component(s)
export const getPerformanceData = (componentName?: string) => {
  if (componentName) {
    return performanceData[componentName] || [];
  }
  return performanceData;
};

// Clear performance data for component(s)
export const clearPerformanceData = (componentName?: string) => {
  if (componentName) {
    performanceData[componentName] = [];
  } else {
    Object.keys(performanceData).forEach(key => {
      performanceData[key] = [];
    });
  }
};

export default {
  trackPerformance,
  trackRenderPerformance,
  startTracking,
  endTracking,
  getPerformanceData,
  clearPerformanceData
};
