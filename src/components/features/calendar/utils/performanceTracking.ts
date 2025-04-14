
import { logger } from '@/utils/logger';
import React from 'react';

interface RenderTimings {
  componentName: string;
  renderTime: number;
  operationsCount?: number;
  eventsCount?: number;
}

// Performance data store to track performance across renders
const performanceData: Record<string, Array<RenderTimings>> = {};

/**
 * Utility for tracking component render performance
 */
export const trackRenderPerformance = (
  componentName: string, 
  startTime: number,
  options?: { 
    operationsCount?: number;
    eventsCount?: number;
    logToConsole?: boolean;
  }
) => {
  const endTime = performance.now();
  const renderTime = endTime - startTime;
  
  // Store timing data
  if (!performanceData[componentName]) {
    performanceData[componentName] = [];
  }
  
  performanceData[componentName].push({
    componentName,
    renderTime,
    operationsCount: options?.operationsCount,
    eventsCount: options?.eventsCount
  });
  
  // Trim data to keep only last 100 records
  if (performanceData[componentName].length > 100) {
    performanceData[componentName].shift();
  }
  
  // Optionally log to console for immediate feedback
  if (options?.logToConsole) {
    logger.debug(
      `[Performance] ${componentName} render: ${renderTime.toFixed(2)}ms` + 
      (options.operationsCount ? `, Operations: ${options.operationsCount}` : '') +
      (options.eventsCount ? `, Events: ${options.eventsCount}` : '')
    );
  }
  
  return renderTime;
};

/**
 * Get average render time for a component
 */
export const getAverageRenderTime = (componentName: string): number => {
  if (!performanceData[componentName] || performanceData[componentName].length === 0) {
    return 0;
  }
  
  const sum = performanceData[componentName].reduce(
    (acc, record) => acc + record.renderTime, 
    0
  );
  
  return sum / performanceData[componentName].length;
};

/**
 * Get all performance data for analysis
 */
export const getPerformanceData = () => performanceData;

/**
 * Clear performance data
 */
export const clearPerformanceData = (componentName?: string) => {
  if (componentName) {
    performanceData[componentName] = [];
  } else {
    Object.keys(performanceData).forEach(key => {
      performanceData[key] = [];
    });
  }
};

/**
 * Higher order component for performance tracking
 */
export const withPerformanceTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string,
  options?: { logToConsole?: boolean }
) => {
  const WithPerformanceTracking: React.FC<P> = (props) => {
    const startTime = performance.now();
    
    // Use effect to measure render completion
    React.useEffect(() => {
      trackRenderPerformance(componentName, startTime, {
        logToConsole: options?.logToConsole
      });
    });
    
    return <WrappedComponent {...props} />;
  };
  
  WithPerformanceTracking.displayName = `WithPerformanceTracking(${componentName})`;
  return WithPerformanceTracking;
};
