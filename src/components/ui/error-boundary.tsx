
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackUI?: ReactNode;
  componentName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: any[];
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Generic error boundary component that can be used throughout the application.
 * This component catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error using our logger utility
    const { componentName } = this.props;
    const component = componentName || 'UnknownComponent';
    
    logger.error(`[${component}] Component error:`, error);
    logger.error(`[${component}] Component stack:`, errorInfo.componentStack);
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Show toast notification
    toast({
      variant: "destructive",
      title: `Error in ${component}`,
      description: error.message || "An unexpected error occurred"
    });
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // If resetKeys changed, reset the error boundary
    if (this.props.resetKeys && 
        prevProps.resetKeys &&
        this.state.hasError &&
        this.didResetKeysChange(prevProps.resetKeys, this.props.resetKeys)) {
      this.setState({ hasError: false, error: null });
    }
  }

  didResetKeysChange(prevResetKeys: any[], currentResetKeys: any[]) {
    if (prevResetKeys.length !== currentResetKeys.length) {
      return true;
    }
    
    for (let i = 0; i < prevResetKeys.length; i++) {
      if (prevResetKeys[i] !== currentResetKeys[i]) {
        return true;
      }
    }
    
    return false;
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallbackUI, componentName } = this.props;
    
    if (hasError) {
      // Use custom fallback UI if provided
      if (fallbackUI) {
        return fallbackUI;
      }
      
      // Default fallback UI
      return (
        <Alert variant="destructive" className="p-6 flex flex-col items-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <AlertTitle className="text-xl font-semibold mb-2">Something went wrong</AlertTitle>
          <AlertDescription className="text-center mb-4">
            {error?.message || `An unexpected error occurred${componentName ? ` in ${componentName}` : ''}`}
          </AlertDescription>
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={this.handleReset} variant="outline" className="flex items-center gap-1">
              <RefreshCw className="h-4 w-4" /> Try Again
            </Button>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </Alert>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
