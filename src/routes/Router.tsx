
import { useRoutes } from 'react-router-dom';
import { routes, prefetchRoutes } from './routeConfig';
import { useRouteGuard } from '@/hooks/use-route-guard';
import { useEffect } from 'react';

/**
 * Main router component that uses the route configuration
 */
const Router = () => {
  // Initialize route guard
  useRouteGuard();
  
  // useRoutes hook transforms our route config into route elements
  const routeElements = useRoutes(routes);
  
  // Prefetch important routes for faster future navigation
  useEffect(() => {
    // Delay prefetching to prioritize current route rendering
    const prefetchTimer = setTimeout(() => {
      prefetchRoutes(['/', '/scan', '/upload', '/shopping']);
    }, 2000);
    
    return () => clearTimeout(prefetchTimer);
  }, []);
  
  return routeElements;
};

export default Router;
