
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
  _testAuthValues?: { 
    isAuthenticated: boolean;
    userRoles: string[];
  };
}

const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = false,
  _testAuthValues
}) => {
  const navigate = useNavigate();
  
  // Use test values in tests, or real values in production
  // For now, we'll use a simple auth check. You can integrate your auth system later
  const isAuthenticated = _testAuthValues ? _testAuthValues.isAuthenticated : true; 
  const userRoles: string[] = _testAuthValues ? _testAuthValues.userRoles : ['user'];

  useEffect(() => {
    // Check authentication if required
    if (requireAuth && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this page",
        variant: "destructive",
      });
      navigate('/login', { replace: true });
      return;
    }

    // Check role-based access
    if (allowedRoles.length > 0 && !allowedRoles.some(role => userRoles.includes(role))) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      navigate('/', { replace: true });
      return;
    }
  }, [requireAuth, isAuthenticated, allowedRoles, navigate, userRoles]);

  return <>{children}</>;
};

export default RouteGuard;
