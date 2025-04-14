
import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useRouteGuard } from '@/hooks/use-route-guard';

// Mock dependencies
const mockNavigate = vi.fn();
const mockToast = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/protected-route' })
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe('useRouteGuard Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow access to public routes when unauthenticated', () => {
    // Mock location to a public route
    vi.mocked(require('react-router-dom').useLocation).mockReturnValue({
      pathname: '/'
    });

    renderHook(() => useRouteGuard({ isAuthenticated: false }));
    
    // Should not redirect or show toast for public route
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should redirect from protected routes when unauthenticated', () => {
    // Add a protected route for testing
    const originalProtectedRoutes = require('@/hooks/use-route-guard').PROTECTED_ROUTES;
    
    // Temporarily modify the PROTECTED_ROUTES array to include our test route
    Object.defineProperty(require('@/hooks/use-route-guard'), 'PROTECTED_ROUTES', {
      value: ['/protected-route'],
      writable: true
    });

    // Mock location to a protected route
    vi.mocked(require('react-router-dom').useLocation).mockReturnValue({
      pathname: '/protected-route'
    });

    renderHook(() => useRouteGuard({ isAuthenticated: false }));
    
    // Should redirect to login and show toast
    expect(mockNavigate).toHaveBeenCalledWith('/login', {
      state: { returnUrl: '/protected-route' },
      replace: true
    });
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Authentication Required",
        variant: "destructive"
      })
    );
    
    // Restore original PROTECTED_ROUTES
    Object.defineProperty(require('@/hooks/use-route-guard'), 'PROTECTED_ROUTES', {
      value: originalProtectedRoutes
    });
  });

  it('should allow access to protected routes when authenticated', () => {
    // Add a protected route for testing
    const originalProtectedRoutes = require('@/hooks/use-route-guard').PROTECTED_ROUTES;
    
    // Temporarily modify the PROTECTED_ROUTES array to include our test route
    Object.defineProperty(require('@/hooks/use-route-guard'), 'PROTECTED_ROUTES', {
      value: ['/protected-route'],
      writable: true
    });

    // Mock location to a protected route
    vi.mocked(require('react-router-dom').useLocation).mockReturnValue({
      pathname: '/protected-route'
    });

    renderHook(() => useRouteGuard({ isAuthenticated: true }));
    
    // Should not redirect or show toast when authenticated
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockToast).not.toHaveBeenCalled();
    
    // Restore original PROTECTED_ROUTES
    Object.defineProperty(require('@/hooks/use-route-guard'), 'PROTECTED_ROUTES', {
      value: originalProtectedRoutes
    });
  });

  it('should handle wildcard protected routes', () => {
    // Add a wildcard protected route for testing
    const originalProtectedRoutes = require('@/hooks/use-route-guard').PROTECTED_ROUTES;
    
    // Temporarily modify the PROTECTED_ROUTES array to include our wildcard route
    Object.defineProperty(require('@/hooks/use-route-guard'), 'PROTECTED_ROUTES', {
      value: ['/admin/*'],
      writable: true
    });

    // Mock location to a route that matches the wildcard
    vi.mocked(require('react-router-dom').useLocation).mockReturnValue({
      pathname: '/admin/dashboard'
    });

    renderHook(() => useRouteGuard({ isAuthenticated: false }));
    
    // Should redirect and show toast
    expect(mockNavigate).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalled();
    
    // Restore original PROTECTED_ROUTES
    Object.defineProperty(require('@/hooks/use-route-guard'), 'PROTECTED_ROUTES', {
      value: originalProtectedRoutes
    });
  });
});
