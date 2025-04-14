
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '@/hooks/use-auth';

// Create a wrapper component for context
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth Login/Logout Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });
  
  it('should maintain authentication state after login', async () => {
    // First render - login
    const { result, rerender } = renderHook(() => useAuth(), { wrapper });
    
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User'
    };
    
    // Mock fetch for login API call
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser, token: 'fake-token' })
    });

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);
    
    // Force re-render to ensure state persists
    rerender();
    
    // Check if authentication state persists
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });
  
  it('should handle login and then logout sequence', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Set up mocked login response
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: { id: '123', email: 'test@example.com', name: 'Test User' },
        token: 'fake-token'
      })
    });

    // Login
    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('auth_token')).toBe('fake-token');
    
    // Logout
    await act(async () => {
      await result.current.logout();
    });
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
  
  it('should handle failed login attempts', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Mock failed login response
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Invalid credentials' })
    });

    // Attempt login with invalid credentials
    let error;
    await act(async () => {
      try {
        await result.current.login('test@example.com', 'wrongpassword');
      } catch (e) {
        error = e;
      }
    });
    
    expect(error).toBeDefined();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
  
  it('should restore auth state from local storage on initialization', async () => {
    // Set up mock storage state before hook renders
    localStorage.setItem('auth_token', 'existing-token');
    localStorage.setItem('user_data', JSON.stringify({
      id: '456',
      email: 'existing@example.com',
      name: 'Existing User'
    }));
    
    // Render hook with existing storage state
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for the initialization effect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Auth state should be restored from localStorage
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual({
      id: '456',
      email: 'existing@example.com',
      name: 'Existing User'
    });
  });
});
