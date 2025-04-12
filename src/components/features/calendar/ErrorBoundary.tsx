
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackUI?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

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
    logger.error('[Calendar] Component error:', error);
    logger.error('[Calendar] Component stack:', errorInfo.componentStack);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Default fallback UI
      const defaultFallbackUI = (
        <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-lg text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">
            {this.state.error?.message || 'An unexpected error occurred in the calendar component'}
          </p>
          <Button onClick={this.handleReset} variant="outline" className="mr-2">
            Try Again
          </Button>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      );

      return this.props.fallbackUI || defaultFallbackUI;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
