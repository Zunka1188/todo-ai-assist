
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from './use-toast';

// Routes that require authentication (currently none, but can be expanded)
const PROTECTED_ROUTES: string[] = [];

// Public routes accessible to all users
const PUBLIC_ROUTES: string[] = [
  '/',
  '/scan',
  '/upload',
  '/calendar',
  '/shopping',
  '/tasks',
  '/documents',
  '/settings',
  '/troubleshoot',
  '/weather',
  '/produce-recognition',
  '/recipes',
];

interface RouteGuardProps {
  isAuthenticated?: boolean;
  loginPath?: string;
}

/**
 * Hook that checks if user can access current route
 * Currently just a placeholder for future auth implementation
 */
export function useRouteGuard({
  isAuthenticated = true, // Default to true since we don't have auth yet
  loginPath = '/login'
}: RouteGuardProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    // Current path
    const { pathname } = location;
    
    // Check if current path is protected
    const requiresAuth = PROTECTED_ROUTES.some(route => {
      if (route.endsWith('*')) {
        return pathname.startsWith(route.slice(0, -1));
      }
      return pathname === route;
    });
    
    // If route requires authentication and user isn't authenticated
    if (requiresAuth && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to access this page",
        variant: "destructive",
      });
      
      // Redirect to login with return url
      navigate(loginPath, {
        state: { returnUrl: pathname },
        replace: true
      });
    }
  }, [location, isAuthenticated, navigate, toast, loginPath]);
  
  // Return nothing as this is just a guard
  return null;
}

export default useRouteGuard;
