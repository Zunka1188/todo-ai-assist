
import { useRoutes } from 'react-router-dom';
import { routes } from './routeConfig';
import { useRouteGuard } from '@/hooks/use-route-guard';

/**
 * Main router component that uses the route configuration
 */
const Router = () => {
  // Initialize route guard
  useRouteGuard();
  
  // useRoutes hook transforms our route config into route elements
  const routeElements = useRoutes(routes);
  
  return routeElements;
};

export default Router;
