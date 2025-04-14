
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

// Create mock functions for auth values
const mockIsAuthenticated = vi.fn().mockReturnValue(true);
const mockUserRoles = vi.fn().mockReturnValue(['user']);

describe('RouteGuard', () => {
  const mockNavigate = vi.fn();
  const mockToast = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(require('@/hooks/use-toast').toast).mockImplementation(mockToast);
  });

  it('renders children when authenticated and no roles required', () => {
    // Set mock auth as authenticated
    const isAuthenticated = true;
    const userRoles = ['user'];
    
    render(
      <RouteGuard 
        requireAuth={true}
        _testAuthValues={{
          isAuthenticated,
          userRoles
        }}
      >
        <div data-testid="protected-content">Protected Content</div>
      </RouteGuard>
    );
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  it('redirects to login when authentication required but not authenticated', () => {
    // Set mock auth as not authenticated
    const isAuthenticated = false;
    const userRoles = ['user'];
    
    render(
      <RouteGuard 
        requireAuth={true}
        _testAuthValues={{
          isAuthenticated,
          userRoles
        }}
      >
        <div data-testid="protected-content">Protected Content</div>
      </RouteGuard>
    );
    
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    expect(require('@/hooks/use-toast').toast).toHaveBeenCalled();
  });
  
  it('renders children when user has required role', () => {
    // Set mock auth as authenticated with admin role
    const isAuthenticated = true;
    const userRoles = ['user', 'admin'];
    
    render(
      <RouteGuard 
        requireAuth={true} 
        allowedRoles={['admin']}
        _testAuthValues={{
          isAuthenticated,
          userRoles
        }}
      >
        <div data-testid="admin-content">Admin Content</div>
      </RouteGuard>
    );
    
    expect(screen.getByTestId('admin-content')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  it('redirects to home when user doesn\'t have required role', () => {
    // Set mock auth as authenticated but without admin role
    const isAuthenticated = true;
    const userRoles = ['user'];
    
    render(
      <RouteGuard 
        requireAuth={true} 
        allowedRoles={['admin']}
        _testAuthValues={{
          isAuthenticated,
          userRoles
        }}
      >
        <div data-testid="admin-content">Admin Content</div>
      </RouteGuard>
    );
    
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    expect(require('@/hooks/use-toast').toast).toHaveBeenCalled();
  });
});
