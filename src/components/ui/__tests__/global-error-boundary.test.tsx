
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import GlobalErrorBoundary from '@/components/ui/global-error-boundary';

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    error: vi.fn(),
    log: vi.fn(),
    warn: vi.fn()
  }
}));

// Mock performance monitor
vi.mock('@/utils/performance-monitor', () => ({
  performanceMonitor: {
    mark: vi.fn(),
    measure: vi.fn(),
    time: vi.fn(),
    timeAsync: vi.fn(),
    getReport: vi.fn(),
    enable: vi.fn(),
    clear: vi.fn()
  }
}));

// Create a component that throws an error
const ErrorComponent = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('GlobalErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <GlobalErrorBoundary>
        <div data-testid="child">Test Child</div>
      </GlobalErrorBoundary>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders fallback UI when an error occurs', () => {
    // We need to suppress the error console since ErrorComponent will throw
    const spy = vi.spyOn(console, 'error');
    spy.mockImplementation(() => {});
    
    render(
      <GlobalErrorBoundary>
        <ErrorComponent />
      </GlobalErrorBoundary>
    );
    
    // Check for fallback UI elements
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/try again/i)).toBeInTheDocument();
    expect(screen.getByText(/reload page/i)).toBeInTheDocument();
    
    // Check that error was logged
    expect(require('@/utils/logger').logger.error).toHaveBeenCalled();
    
    // Reset console.error mock
    spy.mockRestore();
  });

  it('resets error state when Try Again is clicked', () => {
    const ErrorToggleComponent = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true);
      
      return (
        <GlobalErrorBoundary>
          {shouldThrow ? (
            <ErrorComponent />
          ) : (
            <div data-testid="recovered">Recovered from error</div>
          )}
          <button onClick={() => setShouldThrow(false)} style={{ display: 'none' }}>
            Fix Error
          </button>
        </GlobalErrorBoundary>
      );
    };
    
    // Suppress error logs
    const spy = vi.spyOn(console, 'error');
    spy.mockImplementation(() => {});
    
    render(<ErrorToggleComponent />);
    
    // Error UI should be shown
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    
    // Click Try Again button and simultaneously fix the error condition
    const tryAgainButton = screen.getByText('Try Again');
    const fixButton = document.querySelector('button');
    fixButton.click(); // Fix the error condition
    fireEvent.click(tryAgainButton);
    
    // Component should recover and show normal UI
    expect(screen.getByTestId('recovered')).toBeInTheDocument();
    
    // Reset console.error mock
    spy.mockRestore();
  });

  it('uses custom fallback UI when provided', () => {
    // Suppress error logs
    const spy = vi.spyOn(console, 'error');
    spy.mockImplementation(() => {});
    
    render(
      <GlobalErrorBoundary 
        fallback={<div data-testid="custom-fallback">Custom Error UI</div>}
      >
        <ErrorComponent />
      </GlobalErrorBoundary>
    );
    
    // Custom fallback should be shown
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    
    // Reset console.error mock
    spy.mockRestore();
  });
});
