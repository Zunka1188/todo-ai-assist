import { GlobalState, GlobalAction } from './types';
import { logger } from '@/utils/logger';
import { performanceMonitor } from '@/utils/performance-monitor';
import { rateLimitMiddleware } from './middleware/rateLimitMiddleware';

/**
 * Middleware function type
 */
export type Middleware = (
  state: GlobalState,
  action: GlobalAction,
  next: (action: GlobalAction) => void
) => void;

/**
 * Logger middleware
 */
export const loggerMiddleware: Middleware = (state, action, next) => {
  logger.group(`[Store] Action: ${action.type}`);
  logger.log('Previous state:', state);
  logger.log('Action:', action);
  
  next(action);
  
  logger.log('New state:', state);
  logger.groupEnd();
};

/**
 * Performance monitoring middleware
 */
export const performanceMiddleware: Middleware = (state, action, next) => {
  const startTime = performance.now();
  const actionType = `${action.type}_${action.action?.type || 'unknown'}`;
  
  performanceMonitor.mark(`action_start_${actionType}`);
  
  next(action);
  
  performanceMonitor.mark(`action_end_${actionType}`);
  performanceMonitor.measure(
    `action_${actionType}`,
    `action_start_${actionType}`,
    `action_end_${actionType}`
  );
  
  const duration = performance.now() - startTime;
  
  if (duration > 16) { // More than 1 frame at 60fps
    logger.warn(`[Store] Slow action detected: ${actionType} took ${duration.toFixed(2)}ms`);
  }
};

/**
 * Local storage persistence middleware
 */
export const persistenceMiddleware: Middleware = (state, action, next) => {
  // First let the action process
  next(action);
  
  // Then persist specific parts of state
  try {
    // Store app theme preference
    localStorage.setItem('app_theme', state.app.theme);
    
    // Store shopping filter preferences
    localStorage.setItem('shopping_preferences', JSON.stringify({
      filterMode: state.shopping.filterMode,
      sortOption: state.shopping.sortOption
    }));
  } catch (error) {
    logger.error('[Store] Error persisting state to localStorage:', error);
  }
};

/**
 * Analytics tracking middleware
 */
export const analyticsMiddleware: Middleware = (state, action, next) => {
  // Track action before processing
  if (process.env.NODE_ENV === 'production') {
    // This is where you would call your analytics service
    // analyticsService.trackEvent(`action_${action.type}`, {
    //   actionType: action.action?.type,
    //   timestamp: new Date().toISOString()
    // });
  }
  
  next(action);
};

/**
 * Debug middleware (only active in development)
 */
export const debugMiddleware: Middleware = (state, action, next) => {
  if (process.env.NODE_ENV !== 'production' && state.app.debugMode) {
    console.log('%c Action', 'background: #9b87f5; color: white; padding: 2px 4px; border-radius: 2px;', action);
    console.log('%c State Before', 'background: #f5f5f5; color: #333; padding: 2px 4px; border-radius: 2px;', state);
  }
  
  next(action);
  
  if (process.env.NODE_ENV !== 'production' && state.app.debugMode) {
    console.log('%c State After', 'background: #f5f5f5; color: #333; padding: 2px 4px; border-radius: 2px;', state);
  }
};

/**
 * Combine multiple middlewares into a single middleware
 */
export function combineMiddlewares(...middlewares: Middleware[]): Middleware {
  return (state, action, next) => {
    // Track middleware execution index
    let index = 0;
    
    // Execute each middleware in sequence
    function executeMiddleware(middlewareAction: GlobalAction) {
      if (index < middlewares.length) {
        const currentMiddleware = middlewares[index];
        index++;
        currentMiddleware(state, middlewareAction, executeMiddleware);
      } else {
        next(middlewareAction);
      }
    }
    
    executeMiddleware(action);
  };
}

/**
 * Create middleware chain for production
 */
export function createProductionMiddleware(): Middleware {
  return combineMiddlewares(
    rateLimitMiddleware,
    performanceMiddleware,
    persistenceMiddleware,
    analyticsMiddleware
  );
}

/**
 * Create middleware chain for development
 */
export function createDevelopmentMiddleware(): Middleware {
  return combineMiddlewares(
    loggerMiddleware,
    performanceMiddleware,
    persistenceMiddleware,
    debugMiddleware
  );
}

/**
 * Default middleware based on environment
 */
export const defaultMiddleware = process.env.NODE_ENV === 'production'
  ? createProductionMiddleware()
  : createDevelopmentMiddleware();
