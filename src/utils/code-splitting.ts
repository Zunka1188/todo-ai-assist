
import { lazy, ComponentType } from 'react';
import { performanceMonitor } from './performance-monitor';
import { logger } from './logger';

/**
 * Enhanced lazy loading with performance tracking and error handling
 * @param factory Function that returns a promise for the component
 * @param moduleName Name of the module being loaded (for tracking)
 */
export function lazyLoad<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  moduleName: string
) {
  return lazy(() => {
    // Mark the start of lazy loading
    performanceMonitor.mark(`lazy_load_start_${moduleName}`);
    
    return factory()
      .then(module => {
        // Successful load - mark completion and measure duration
        performanceMonitor.mark(`lazy_load_end_${moduleName}`);
        performanceMonitor.measure(
          `lazy_load_${moduleName}`,
          `lazy_load_start_${moduleName}`,
          `lazy_load_end_${moduleName}`
        );
        
        logger.log(`[CodeSplitting] Successfully loaded module: ${moduleName}`);
        return module;
      })
      .catch(error => {
        // Failed load - log error
        logger.error(`[CodeSplitting] Failed to load module: ${moduleName}`, error);
        // Re-throw to let error boundaries catch it
        throw error;
      });
  });
}

/**
 * Prefetch a module without rendering it
 * @param factory Function that returns a promise for the component
 * @param moduleName Name of the module being prefetched (for tracking)
 */
export function prefetchModule(
  factory: () => Promise<{ default: ComponentType<any> }>,
  moduleName: string
): Promise<void> {
  performanceMonitor.mark(`prefetch_start_${moduleName}`);
  
  return factory()
    .then(() => {
      performanceMonitor.mark(`prefetch_end_${moduleName}`);
      performanceMonitor.measure(
        `prefetch_${moduleName}`,
        `prefetch_start_${moduleName}`,
        `prefetch_end_${moduleName}`
      );
      
      logger.log(`[CodeSplitting] Successfully prefetched module: ${moduleName}`);
    })
    .catch(error => {
      logger.error(`[CodeSplitting] Failed to prefetch module: ${moduleName}`, error);
    });
}

/**
 * Preload multiple modules at once
 * @param modules Array of module factory functions with their names
 */
export function preloadModules(
  modules: Array<{
    factory: () => Promise<{ default: ComponentType<any> }>;
    name: string;
  }>
): Promise<void[]> {
  return Promise.all(
    modules.map(({ factory, name }) => prefetchModule(factory, name))
  );
}
