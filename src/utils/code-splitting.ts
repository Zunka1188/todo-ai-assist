
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
      throw error;
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

/**
 * A wrapper for conditional code splitting
 * Only splits the code in production mode, for easier debugging in development
 */
export function conditionalLazyLoad<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  moduleName: string
) {
  if (process.env.NODE_ENV === 'production') {
    return lazyLoad(factory, moduleName);
  } else {
    // In development, load synchronously
    return factory().then(module => module.default) as unknown as ReturnType<typeof lazyLoad>;
  }
}

/**
 * Dynamically import a component with retry logic
 * @param factory Function that returns a promise for the component
 * @param moduleName Name of the module being loaded (for tracking)
 * @param retries Number of retries
 * @param retryDelay Delay between retries in ms
 */
export function lazyLoadWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  moduleName: string,
  retries: number = 3,
  retryDelay: number = 1000
) {
  return lazy(() => {
    let attempts = 0;
    
    const attemptLoad = (): Promise<{ default: T }> => {
      performanceMonitor.mark(`lazy_load_attempt_${attempts}_${moduleName}`);
      return factory()
        .then(module => {
          performanceMonitor.mark(`lazy_load_end_${moduleName}`);
          performanceMonitor.measure(
            `lazy_load_${moduleName}`,
            `lazy_load_attempt_${attempts}_${moduleName}`,
            `lazy_load_end_${moduleName}`
          );
          
          logger.log(`[CodeSplitting] Successfully loaded module: ${moduleName} on attempt ${attempts + 1}`);
          return module;
        })
        .catch(error => {
          attempts++;
          
          if (attempts <= retries) {
            logger.warn(`[CodeSplitting] Retry ${attempts}/${retries} loading module: ${moduleName}`);
            
            return new Promise(resolve => {
              setTimeout(() => resolve(attemptLoad()), retryDelay);
            });
          }
          
          logger.error(`[CodeSplitting] Failed to load module after ${retries} retries: ${moduleName}`, error);
          throw error;
        });
    };
    
    return attemptLoad();
  });
}
