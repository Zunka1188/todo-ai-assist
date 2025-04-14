
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';
import { toast } from '@/hooks/use-toast';

interface ShoppingListErrorBoundaryProps {
  children: ReactNode;
  fallbackUI?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ShoppingListErrorBoundary extends Component<ShoppingListErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ShoppingListErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error using our logger utility
    logger.error('[ShoppingList] Component error:', error);
    logger.error('[ShoppingList] Component stack:', errorInfo.componentStack);
    
    // Show toast notification
    toast({
      variant: "destructive",
      title: "Shopping List Error",
      description: error.message || "An unexpected error occurred in the shopping list"
    });
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
            {this.state.error?.message || 'An unexpected error occurred in the shopping list'}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={this.handleReset} variant="outline" className="flex items-center gap-1">
              <RefreshCw className="h-4 w-4" /> Try Again
            </Button>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      );

      return this.props.fallbackUI || defaultFallbackUI;
    }

    return this.props.children;
  }
}

export default ShoppingListErrorBoundary;
