
import { useRoutes } from 'react-router-dom';
import { enhancedRoutes, prefetchRoutes } from './improved-routes';
import { useRouteGuard } from '@/hooks/use-route-guard';
import { useEffect } from 'react';
import { performanceMonitor } from '@/utils/performance-monitor';

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
  const routeElements = useRoutes(enhancedRoutes);
  
  // Prefetch important routes for faster future navigation
  useEffect(() => {
    // Delay prefetching to prioritize current route rendering
    const prefetchTimer = setTimeout(() => {
      prefetchRoutes(['/', '/scan', '/upload', '/shopping', '/calendar', '/documents', '/weather']);
    }, 2000);
    
    return () => clearTimeout(prefetchTimer);
  }, []);
  
  return routeElements;
};

export default Router;
