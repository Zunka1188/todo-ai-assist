
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { logger } from '@/utils/logger';

interface AIModelTrainingErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class AIModelTrainingErrorBoundary extends Component<AIModelTrainingErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: AIModelTrainingErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('[AIModelTraining] Error:', error);
    logger.error('[AIModelTraining] Component stack:', errorInfo.componentStack);
    
    this.setState({
      errorInfo
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-destructive" /> 
              <CardTitle>AI Model Training & Performance</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Training Model Error</h3>
              <p className="text-muted-foreground mb-6">
                {this.state.error?.message || 'An error occurred while loading AI model training data'}
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <div className="w-full mb-4 p-2 bg-muted/50 rounded text-xs text-left overflow-auto max-h-32">
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </div>
              )}
              
              <Button onClick={this.handleReset} variant="default">
                Retry Loading
              </Button>
            </div>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-xs text-muted-foreground">
              Error details have been logged for our team
            </p>
          </CardFooter>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default AIModelTrainingErrorBoundary;
