
import { GlobalState, GlobalAction } from '../types';
import { Middleware } from '../middleware';
import { createRateLimiter, createIpRateLimiter } from '@/utils/rate-limiter';
import { logger } from '@/utils/logger';
import { errorHandler, ErrorType } from '@/utils/errorHandling';

// Create various rate limiters for different action types
const defaultLimiter = createRateLimiter({ 
  windowMs: 60000,        // 1 minute
  maxRequests: 100,       // 100 requests per minute
  blockDuration: 120000   // 2 minute block
});

const apiLimiter = createIpRateLimiter({
  windowMs: 60000,        // 1 minute
  maxRequests: 60,        // 60 requests per minute
  blockDuration: 300000   // 5 minute block
});

const authLimiter = createIpRateLimiter({
  windowMs: 300000,       // 5 minutes
  maxRequests: 10,        // 10 login attempts per 5 minutes
  blockDuration: 900000   // 15 minute block
});

/**
 * Rate limiting middleware - throttles actions based on predefined limits
 */
export const rateLimitMiddleware: Middleware = (state, action, next) => {
  // Skip rate limiting in development mode
  if (process.env.NODE_ENV === 'development') {
    return next(action);
  }
  
  // Extract action type for more specific rate limiting
  const actionType = `${action.type}_${action.action?.type || 'unknown'}`;
  
  // Choose appropriate limiter based on action type
  let limiter;
  let requestInfo = {};
  
  if (actionType.includes('AUTH') || actionType.includes('LOGIN') || actionType.includes('REGISTER')) {
    limiter = authLimiter;
    requestInfo = { type: 'auth', actionType };
  } else if (actionType.includes('API') || actionType.includes('FETCH') || actionType.includes('QUERY')) {
    limiter = apiLimiter;
    requestInfo = { type: 'api', actionType };
  } else {
    limiter = defaultLimiter;
    requestInfo = { type: 'default', actionType };
  }
  
  // Check if request is allowed
  const result = limiter(requestInfo);
  
  if (!result.allowed) {
    logger.warn(`[RateLimit] Request blocked: ${actionType}, retry after ${result.retryAfter}s`);
    
    // Create and handle rate limit error
    const rateLimitError = errorHandler.createError(
      `Too many requests. Please try again in ${result.retryAfter} seconds.`,
      ErrorType.CLIENT,
      { retryAfter: result.retryAfter }
    );
    
    errorHandler.handle(rateLimitError, {
      showToast: true,
      logToService: true,
      rethrow: false
    });
    
    // Instead of proceeding with the action, we dispatch an error action
    if (action.type === 'APP') {
      next({
        type: 'APP',
        action: { 
          type: 'SET_ERROR',
          payload: `Rate limit exceeded. Please wait ${result.retryAfter} seconds.`
        }
      });
    }
    
    // Don't proceed with the original action
    return;
  }
  
  // If not rate limited, proceed with the action
  next(action);
};
