
import { useRoutes } from 'react-router-dom';
import { routes } from './routeConfig';

/**
 * Main router component that uses the route configuration
 */
const Router = () => {
  // useRoutes hook transforms our route config into route elements
  const routeElements = useRoutes(routes);
  
  return routeElements;
};

export default Router;
