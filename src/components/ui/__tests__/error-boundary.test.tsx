
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ErrorBoundary from '@/components/ui/error-boundary';
import GlobalErrorBoundary from '@/components/ui/global-error-boundary';

// Create components that will throw errors
const ThrowError = () => {
  throw new Error('Test error');
};

const ThrowErrorOnClick = () => {
  const [shouldThrow, setShouldThrow] = React.useState(false);
  
  if (shouldThrow) {
    throw new Error('Button click error');
  }
  
  return (
    <button onClick={() => setShouldThrow(true)}>
      Throw Error
    </button>
  );
};

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    error: vi.fn()
  }
}));

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}));

// Mock performance monitor
vi.mock('@/utils/performance-monitor', () => ({
  performanceMonitor: {
    mark: vi.fn()
  }
}));

describe('ErrorBoundary', () => {
  const originalConsoleError = console.error;
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress React's error logging in test output
    console.error = vi.fn();
  });
  
  afterEach(() => {
    console.error = originalConsoleError;
  });
  
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary componentName="TestComponent">
        <div data-testid="child">Normal content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
  });
  
  it('displays fallback UI when an error occurs', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary componentName="TestComponent">
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/test error/i)).toBeInTheDocument();
    
    // Check if logger was called
    expect(require('@/utils/logger').logger.error).toHaveBeenCalled();
    
    // Check if toast was called
    expect(require('@/hooks/use-toast').toast).toHaveBeenCalled();
  });
  
  it('uses custom fallback UI when provided', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const customFallback = <div data-testid="custom-fallback">Custom error message</div>;
    
    render(
      <ErrorBoundary 
        componentName="TestComponent"
        fallbackUI={customFallback}
      >
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
  });
  
  it('calls onError callback when provided', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const onErrorMock = vi.fn();
    
    render(
      <ErrorBoundary 
        componentName="TestComponent"
        onError={onErrorMock}
      >
        <ThrowError />
      </ErrorBoundary>
    );
    
    expect(onErrorMock).toHaveBeenCalled();
  });
  
  it('resets error state when try again button is clicked', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const handleReset = vi.fn();
    
    // Mock ErrorBoundary.prototype.handleReset
    const originalHandleReset = ErrorBoundary.prototype.handleReset;
    ErrorBoundary.prototype.handleReset = handleReset;
    
    render(
      <ErrorBoundary componentName="TestComponent">
        <ThrowError />
      </ErrorBoundary>
    );
    
    const tryAgainButton = screen.getByText(/try again/i);
    fireEvent.click(tryAgainButton);
    
    expect(handleReset).toHaveBeenCalled();
    
    // Restore original method
    ErrorBoundary.prototype.handleReset = originalHandleReset;
  });
});

describe('GlobalErrorBoundary', () => {
  const originalConsoleError = console.error;
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress React's error logging in test output
    console.error = vi.fn();
  });
  
  afterEach(() => {
    console.error = originalConsoleError;
  });
  
  it('renders children when there is no error', () => {
    render(
      <GlobalErrorBoundary>
        <div data-testid="child">Normal content</div>
      </GlobalErrorBoundary>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
  });
  
  it('displays fallback UI when an error occurs', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <GlobalErrorBoundary>
        <ThrowError />
      </GlobalErrorBoundary>
    );
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    
    // Check if logger was called
    expect(require('@/utils/logger').logger.error).toHaveBeenCalled();
    
    // Check if performance monitor was called
    expect(require('@/utils/performance-monitor').performanceMonitor.mark).toHaveBeenCalled();
  });
  
  it('uses custom fallback UI when provided', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const customFallback = <div data-testid="custom-global-fallback">Custom global error</div>;
    
    render(
      <GlobalErrorBoundary fallback={customFallback}>
        <ThrowError />
      </GlobalErrorBoundary>
    );
    
    expect(screen.getByTestId('custom-global-fallback')).toBeInTheDocument();
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
  });
  
  it('resets error state when try again button is clicked', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const handleReset = vi.fn();
    
    // Mock GlobalErrorBoundary.prototype.handleReset
    const originalHandleReset = GlobalErrorBoundary.prototype.handleReset;
    GlobalErrorBoundary.prototype.handleReset = handleReset;
    
    render(
      <GlobalErrorBoundary>
        <ThrowError />
      </GlobalErrorBoundary>
    );
    
    const tryAgainButton = screen.getByText(/try again/i);
    fireEvent.click(tryAgainButton);
    
    expect(handleReset).toHaveBeenCalled();
    
    // Restore original method
    GlobalErrorBoundary.prototype.handleReset = originalHandleReset;
  });
});
