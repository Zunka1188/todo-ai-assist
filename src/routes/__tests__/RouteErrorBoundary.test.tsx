
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RouteErrorBoundary from '@/routes/RouteErrorBoundary';
import { useNavigate, useLocation } from 'react-router-dom';

// Component that throws an error for testing
const ErrorComponent = () => {
  throw new Error('Test route error');
};

// Mock react-router-dom hooks
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useLocation: vi.fn()
}));

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    error: vi.fn()
  }
}));

// Mock error handling
vi.mock('@/utils/errorHandling', () => ({
  handleError: vi.fn()
}));

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

describe('RouteErrorBoundary', () => {
  const originalConsoleError = console.error;
  const mockNavigate = vi.fn();
  const mockToast = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress React's error logging in test output
    console.error = vi.fn();
    
    // Mock necessary hooks
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useLocation).mockReturnValue({ pathname: '/test', search: '', hash: '', state: null, key: 'default' });
    vi.mocked(require('@/hooks/use-toast').useToast).mockReturnValue({ toast: mockToast });
  });
  
  afterEach(() => {
    console.error = originalConsoleError;
  });
  
  it('renders children when there is no error', () => {
    render(
      <RouteErrorBoundary routeName="TestRoute">
        <div data-testid="child">Normal route content</div>
      </RouteErrorBoundary>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
  });
  
  it('displays error UI when a route component throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <RouteErrorBoundary routeName="ErrorRoute">
        <ErrorComponent />
      </RouteErrorBoundary>
    );
    
    // Should show error message
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/test route error/i)).toBeInTheDocument();
    
    // Should log the error
    expect(require('@/utils/logger').logger.error).toHaveBeenCalled();
    
    // Should show a toast notification
    expect(mockToast).toHaveBeenCalled();
  });
  
  it('navigates home when Go Home button is clicked', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <RouteErrorBoundary routeName="ErrorRoute">
        <ErrorComponent />
      </RouteErrorBoundary>
    );
    
    // Find and click the Go Home button
    const goHomeButton = screen.getByText(/go home/i);
    fireEvent.click(goHomeButton);
    
    // Should navigate to home
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });
  
  it('reloads the page when Try Again button is clicked', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock window.location.reload
    const originalReload = window.location.reload;
    window.location.reload = vi.fn();
    
    render(
      <RouteErrorBoundary routeName="ErrorRoute">
        <ErrorComponent />
      </RouteErrorBoundary>
    );
    
    // Find and click the Try Again button
    const tryAgainButton = screen.getByText(/try again/i);
    fireEvent.click(tryAgainButton);
    
    // Should reload the page
    expect(window.location.reload).toHaveBeenCalled();
    
    // Restore original
    window.location.reload = originalReload;
  });
  
  it('includes route name in error logging', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <RouteErrorBoundary routeName="SpecificRoute">
        <ErrorComponent />
      </RouteErrorBoundary>
    );
    
    // Should include route name in error log
    expect(require('@/utils/logger').logger.error).toHaveBeenCalledWith(
      expect.stringContaining('SpecificRoute'),
      expect.anything(),
      expect.anything()
    );
  });
});
