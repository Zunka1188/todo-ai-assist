
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';
import { handleError } from '@/utils/errorHandling';
import { useToast } from '@/hooks/use-toast';

interface RouteErrorBoundaryProps {
  children: ReactNode;
  routeName: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// We need to use a class component for error boundaries
class RouteErrorBoundaryClass extends Component<
  RouteErrorBoundaryProps & { navigate: Function; location: any; toast: any }, 
  ErrorBoundaryState
> {
  constructor(props: RouteErrorBoundaryProps & { navigate: Function; location: any; toast: any }) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error: error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to our logging system
    logger.error(`[Route Error][${this.props.routeName}]`, error, errorInfo);
    
    // Show an error notification
    this.props.toast({
      variant: "destructive",
      title: "Page Error",
      description: `There was an error loading this page: ${error.message}`
    });
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    this.props.navigate('/', { replace: true });
    // Reset error state after navigation
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Render error fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 bg-background border border-border rounded-lg m-4">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-2 text-center max-w-md">
            We encountered an error while trying to load this page.
          </p>
          <p className="text-sm text-destructive mb-6 max-w-md text-center">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={this.handleGoHome}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" /> Go Home
            </Button>
            <Button 
              onClick={this.handleReload}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component that provides hooks values to the class component
const RouteErrorBoundary: React.FC<RouteErrorBoundaryProps> = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  return (
    <RouteErrorBoundaryClass 
      {...props} 
      navigate={navigate} 
      location={location} 
      toast={toast} 
    />
  );
};

export default RouteErrorBoundary;
