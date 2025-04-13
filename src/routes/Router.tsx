
import { useRoutes } from 'react-router-dom';
import { routes } from './improved-routes';
import { useRouteGuard } from '@/hooks/use-route-guard';
import { useEffect } from 'react';
import { performanceMonitor } from '@/utils/performance-monitor';
import { prefetchModule } from '@/utils/code-splitting';

/**
 * Main router component that uses the enhanced route configuration
 */
const Router = () => {
  // Initialize route guard
  useRouteGuard();
  
  // Mark performance for router initialization
  useEffect(() => {
    performanceMonitor.mark('router_initialized');
  }, []);
  
  // useRoutes hook transforms our route config into route elements
  const routeElements = useRoutes(routes);
  
  // Prefetch important routes for faster future navigation
  useEffect(() => {
    // Delay prefetching to prioritize current route rendering
    const prefetchTimer = setTimeout(() => {
      const routesToPrefetch = ['/', '/shopping', '/calendar', '/scan', '/upload', '/documents', '/weather'];
      
      console.log('Prefetching routes:', routesToPrefetch);
      
      // Actually prefetch the modules (only if the prefetchModule function exists)
      if (typeof prefetchModule === 'function') {
        routesToPrefetch.forEach(route => {
          // Use a function that returns a promise instead of a string
          const importFunc = () => import(`../pages${route === '/' ? '/Index' : route}`);
          prefetchModule(importFunc, `Route_${route}`);
        });
      }
    }, 2000);
    
    return () => clearTimeout(prefetchTimer);
  }, []);
  
  return routeElements;
};

export default Router;
