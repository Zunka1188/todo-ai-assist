
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

describe('RouteGuard', () => {
  const mockNavigate = vi.fn();
  const mockToast = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(require('@/hooks/use-toast').toast).mockReturnValue(mockToast);
  });

  it('renders children when authenticated and no roles required', () => {
    // Mock authentication as true
    vi.spyOn(global, 'isAuthenticated', 'get').mockReturnValue(true);
    
    render(
      <RouteGuard requireAuth={true}>
        <div data-testid="protected-content">Protected Content</div>
      </RouteGuard>
    );
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  it('redirects to login when authentication required but not authenticated', () => {
    // Mock authentication as false
    vi.spyOn(global, 'isAuthenticated', 'get').mockReturnValue(false);
    
    render(
      <RouteGuard requireAuth={true}>
        <div data-testid="protected-content">Protected Content</div>
      </RouteGuard>
    );
    
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    expect(require('@/hooks/use-toast').toast).toHaveBeenCalled();
  });
  
  it('renders children when user has required role', () => {
    // Mock authentication and user roles
    vi.spyOn(global, 'isAuthenticated', 'get').mockReturnValue(true);
    vi.spyOn(global, 'userRoles', 'get').mockReturnValue(['user', 'admin']);
    
    render(
      <RouteGuard requireAuth={true} allowedRoles={['admin']}>
        <div data-testid="admin-content">Admin Content</div>
      </RouteGuard>
    );
    
    expect(screen.getByTestId('admin-content')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  it('redirects to home when user doesn\'t have required role', () => {
    // Mock authentication and user roles
    vi.spyOn(global, 'isAuthenticated', 'get').mockReturnValue(true);
    vi.spyOn(global, 'userRoles', 'get').mockReturnValue(['user']);
    
    render(
      <RouteGuard requireAuth={true} allowedRoles={['admin']}>
        <div data-testid="admin-content">Admin Content</div>
      </RouteGuard>
    );
    
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    expect(require('@/hooks/use-toast').toast).toHaveBeenCalled();
  });
});
