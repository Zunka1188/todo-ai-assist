
import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import RouteGuard from '@/components/auth/RouteGuard';
import { useNavigate } from 'react-router-dom';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}));

// Mock auth values - proper way to mock module variables
const mockIsAuthenticated = vi.fn().mockReturnValue(true);
const mockUserRoles = vi.fn().mockReturnValue(['user']);

// Mock the auth values that would normally be imported
vi.mock('@/components/auth/RouteGuard', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    // Override the default export to access the wrapper component
    default: (props: any) => {
      // Use the mocked auth values
      const auth = {
        isAuthenticated: mockIsAuthenticated(),
        userRoles: mockUserRoles()
      };
      
      // Apply auth values to original component
      return actual.default({
        ...props,
        _testAuthValues: auth
      });
    }
  };
}, { actual: true });

describe('RouteGuard', () => {
  const mockNavigate = vi.fn();
  const mockToast = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(require('@/hooks/use-toast').toast).mockReturnValue(mockToast);
  });

  it('renders children when authenticated and no roles required', () => {
    // Set mock auth as authenticated
    mockIsAuthenticated.mockReturnValue(true);
    
    render(
      <RouteGuard requireAuth={true}>
        <div data-testid="protected-content">Protected Content</div>
      </RouteGuard>
    );
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  it('redirects to login when authentication required but not authenticated', () => {
    // Set mock auth as not authenticated
    mockIsAuthenticated.mockReturnValue(false);
    
    render(
      <RouteGuard requireAuth={true}>
        <div data-testid="protected-content">Protected Content</div>
      </RouteGuard>
    );
    
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    expect(require('@/hooks/use-toast').toast).toHaveBeenCalled();
  });
  
  it('renders children when user has required role', () => {
    // Set mock auth as authenticated with admin role
    mockIsAuthenticated.mockReturnValue(true);
    mockUserRoles.mockReturnValue(['user', 'admin']);
    
    render(
      <RouteGuard requireAuth={true} allowedRoles={['admin']}>
        <div data-testid="admin-content">Admin Content</div>
      </RouteGuard>
    );
    
    expect(screen.getByTestId('admin-content')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  it('redirects to home when user doesn\'t have required role', () => {
    // Set mock auth as authenticated but without admin role
    mockIsAuthenticated.mockReturnValue(true);
    mockUserRoles.mockReturnValue(['user']);
    
    render(
      <RouteGuard requireAuth={true} allowedRoles={['admin']}>
        <div data-testid="admin-content">Admin Content</div>
      </RouteGuard>
    );
    
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    expect(require('@/hooks/use-toast').toast).toHaveBeenCalled();
  });
});
