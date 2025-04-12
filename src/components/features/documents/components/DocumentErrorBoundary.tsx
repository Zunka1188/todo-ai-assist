
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logger } from "@/utils/logger";
import { handleError } from "@/utils/errorHandling";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  context?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class DocumentErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { context = 'DocumentManagement' } = this.props;
    
    // Log the error using our logger utility
    logger.error(`[${context}] Error caught in boundary:`, error, errorInfo);
    
    // Use our centralized error handler
    handleError(error, {
      context,
      message: 'An error occurred in document management',
      showToast: true,
      severity: 'error',
      captureError: true
    });
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="flex flex-col items-center justify-center p-8 rounded-md border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" aria-hidden="true" />
          <h2 className="text-lg font-semibold mb-2 text-red-800 dark:text-red-200">Something went wrong</h2>
          <p className="text-sm text-center mb-4 text-red-700 dark:text-red-300">
            {this.state.error?.message || "An unexpected error occurred while managing documents"}
          </p>
          <div className="flex space-x-4">
            <Button
              onClick={() => window.location.reload()}
              className="bg-red-100 hover:bg-red-200 text-red-800"
              aria-label="Reload page"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DocumentErrorBoundary;
