
/**
 * Utility functions for performance testing React components
 */

/**
 * Measures the rendering time of a component
 * @param callback Function that performs the rendering
 * @param iterations Number of times to repeat the measurement
 * @returns Performance metrics in milliseconds
 */
export function measureRenderTime(callback: () => void, iterations = 5) {
  const times: number[] = [];
  
  // Warm-up render
  callback();
  
  // Perform measurements
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    callback();
    const end = performance.now();
    times.push(end - start);
  }
  
  // Calculate metrics
  const total = times.reduce((sum, time) => sum + time, 0);
  const average = total / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  
  return {
    average,
    min,
    max,
    times,
    total
  };
}

/**
 * Measures a function's execution time
 * @param fn Function to measure
 * @param args Arguments to pass to the function
 * @returns The function result and execution time
 */
export async function measureExecutionTime<T>(
  fn: (...args: any[]) => T | Promise<T>,
  ...args: any[]
): Promise<{ result: T; executionTime: number }> {
  const start = performance.now();
  const result = await fn(...args);
  const end = performance.now();
  
  return {
    result,
    executionTime: end - start
  };
}

/**
 * Creates a performance logger that can be used to track
 * performance metrics throughout an operation
 */
export function createPerformanceLogger(name: string) {
  const markers: Record<string, number> = {};
  const durations: Record<string, number> = {};
  
  const mark = (label: string) => {
    markers[label] = performance.now();
    return markers[label];
  };
  
  const measure = (startLabel: string, endLabel: string, measureLabel?: string) => {
    if (!markers[startLabel] || !markers[endLabel]) {
      throw new Error(`Missing marker: ${!markers[startLabel] ? startLabel : endLabel}`);
    }
    
    const duration = markers[endLabel] - markers[startLabel];
    const label = measureLabel || `${startLabel} to ${endLabel}`;
    durations[label] = duration;
    return duration;
  };
  
  const getReport = () => {
    return {
      name,
      markers,
      durations
    };
  };
  
  return {
    mark,
    measure,
    getReport
  };
}

/**
 * Monitors component re-renders
 * Usage: const renderMonitor = createRenderMonitor(); 
 * In component: useEffect(() => { renderMonitor.onRender('ComponentName'); }, [deps]);
 */
export function createRenderMonitor() {
  const renders: Record<string, number> = {};
  
  const onRender = (componentName: string) => {
    renders[componentName] = (renders[componentName] || 0) + 1;
  };
  
  const getRenderCounts = () => ({ ...renders });
  
  const reset = () => {
    for (const key of Object.keys(renders)) {
      delete renders[key];
    }
  };
  
  return {
    onRender,
    getRenderCounts,
    reset
  };
}
