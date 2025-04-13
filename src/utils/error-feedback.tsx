
import React from 'react';
import { errorHandler, ErrorType } from './errorHandling';
import { logger } from './logger';
import { toast } from '@/components/ui/use-toast';
import { AlertCircle, AlertTriangle, Ban, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Error feedback options
 */
interface ErrorFeedbackOptions {
  title?: string;
  description?: string;
  severity?: ErrorSeverity;
  duration?: number; // in milliseconds
  action?: {
    label: string;
    onClick: () => void;
  };
  autoClose?: boolean;
  showDebugInfo?: boolean;
}

/**
 * Error icon mapping
 */
const ErrorIcons = {
  [ErrorSeverity.INFO]: Info,
  [ErrorSeverity.WARNING]: AlertTriangle,
  [ErrorSeverity.ERROR]: AlertCircle,
  [ErrorSeverity.CRITICAL]: Ban
};

/**
 * Show error toast with appropriate styling based on severity
 */
export function showErrorToast(
  error: Error | string,
  options: ErrorFeedbackOptions = {}
) {
  const {
    title = 'Error',
    severity = ErrorSeverity.ERROR,
    duration = 5000,
    action,
    autoClose = true,
    showDebugInfo = false
  } = options;
  
  const errorMessage = typeof error === 'string' ? error : error.message;
  const description = options.description || errorMessage;
  
  const Icon = ErrorIcons[severity];
  
  toast({
    title: title,
    description: (
      <div className="flex flex-col space-y-2">
        <div className="flex items-start space-x-2">
          <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{description}</span>
        </div>
        
        {showDebugInfo && typeof error !== 'string' && error.stack && (
          <details className="text-xs text-muted-foreground mt-2 bg-muted p-2 rounded overflow-auto max-h-[200px]">
            <summary>Debug info</summary>
            <pre className="whitespace-pre-wrap">{error.stack}</pre>
          </details>
        )}
        
        {action && (
          <div className="mt-2 flex justify-end">
            <Button
              variant="outline" 
              size="sm"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>
    ),
    duration: autoClose ? duration : Infinity,
  });
  
  // Log the error
  if (severity === ErrorSeverity.ERROR || severity === ErrorSeverity.CRITICAL) {
    logger.error('[ErrorFeedback]', error);
  } else if (severity === ErrorSeverity.WARNING) {
    logger.warn('[ErrorFeedback]', error);
  } else {
    logger.info('[ErrorFeedback]', error);
  }
}

/**
 * Initialize error feedback handler
 */
export function initErrorFeedback() {
  try {
    // Check if errorHandler exists and has the setFeedbackHandler method
    if (errorHandler && typeof errorHandler.setFeedbackHandler === 'function') {
      // Override the global error handler's feedback mechanism
      errorHandler.setFeedbackHandler((error, errorType, metadata) => {
        let severity = ErrorSeverity.ERROR;
        
        // Determine severity based on error type
        switch (errorType) {
          case 'INFO':
            severity = ErrorSeverity.INFO;
            break;
          case 'WARNING':
            severity = ErrorSeverity.WARNING;
            break;
          case 'CRITICAL':
            severity = ErrorSeverity.CRITICAL;
            break;
          default:
            severity = ErrorSeverity.ERROR;
        }
        
        // Show toast with appropriate severity
        showErrorToast(error, {
          severity,
          title: metadata?.title || 'Application Error',
          description: metadata?.message || error.message,
          showDebugInfo: process.env.NODE_ENV !== 'production',
          action: metadata?.actionable ? {
            label: metadata.actionLabel || 'Retry',
            onClick: metadata.actionHandler || (() => window.location.reload())
          } : undefined
        });
      });
      
      logger.log('[ErrorFeedback] Error feedback handler initialized');
    } else {
      logger.error('[ErrorFeedback] Error handler or setFeedbackHandler not available');
    }
  } catch (err) {
    logger.error('[ErrorFeedback] Failed to initialize error feedback:', err);
  }
}

/**
 * Create a user-friendly error component
 */
export function UserFriendlyError({
  title = 'Something went wrong',
  description,
  severity = ErrorSeverity.ERROR,
  action
}: {
  title?: string;
  description: string;
  severity?: ErrorSeverity;
  action?: {
    label: string;
    onClick: () => void;
  };
}) {
  const Icon = ErrorIcons[severity];
  
  const colors = {
    [ErrorSeverity.INFO]: 'bg-blue-50 border-blue-200 text-blue-800',
    [ErrorSeverity.WARNING]: 'bg-amber-50 border-amber-200 text-amber-800',
    [ErrorSeverity.ERROR]: 'bg-red-50 border-red-200 text-red-800',
    [ErrorSeverity.CRITICAL]: 'bg-red-50 border-red-300 text-red-900'
  };
  
  const buttonColors = {
    [ErrorSeverity.INFO]: 'bg-blue-100 hover:bg-blue-200 text-blue-800',
    [ErrorSeverity.WARNING]: 'bg-amber-100 hover:bg-amber-200 text-amber-800',
    [ErrorSeverity.ERROR]: 'bg-red-100 hover:bg-red-200 text-red-800',
    [ErrorSeverity.CRITICAL]: 'bg-red-100 hover:bg-red-200 text-red-900'
  };
  
  return (
    <div className={`p-4 rounded-md border ${colors[severity]}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          <Icon className="h-5 w-5" />
        </div>
        <div className="ml-3">
          <h3 className="font-medium">{title}</h3>
          <div className="mt-2 text-sm">
            <p>{description}</p>
          </div>
          {action && (
            <div className="mt-4">
              <button
                type="button"
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${buttonColors[severity]}`}
                onClick={action.onClick}
              >
                {action.label}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
