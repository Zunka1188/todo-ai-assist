
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = false 
}) => {
  const navigate = useNavigate();
  // For now, we'll use a simple auth check. You can integrate your auth system later
  const isAuthenticated = true; // Replace with actual auth check
  const userRoles: string[] = ['user']; // Replace with actual user roles

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
  }, [requireAuth, isAuthenticated, allowedRoles, navigate]);

  return <>{children}</>;
};

export default RouteGuard;
