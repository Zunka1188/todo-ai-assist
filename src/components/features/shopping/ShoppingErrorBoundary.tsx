
import React, { Component, ErrorInfo, ReactNode } from "react";
import ErrorState from "@/components/features/calendar/ui/ErrorState";
import { logger } from "@/utils/logger";

interface ShoppingErrorBoundaryProps {
  children: ReactNode;
  fallbackUI?: ReactNode;
}

interface ShoppingErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component for shopping-related features
 * Catches errors in child components and displays a fallback UI
 */
class ShoppingErrorBoundary extends Component<ShoppingErrorBoundaryProps, ShoppingErrorBoundaryState> {
  constructor(props: ShoppingErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ShoppingErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error("[ShoppingErrorBoundary] Uncaught error:", error, errorInfo);
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallbackUI || (
        <ErrorState 
          error={this.state.error?.message || "An unexpected error occurred"}
          onRetry={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children;
  }
}

export default ShoppingErrorBoundary;
