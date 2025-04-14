
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '@/hooks/use-auth';

// Create a wrapper component for context
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth Hook', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('should provide initial authentication state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.register).toBe('function');
  });

  it('should update auth state on login', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
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
    expect(result.current.user).toEqual(mockUser);
    expect(localStorage.getItem('token')).toBe('fake-token');
  });

  it('should clear auth state on logout', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Set initial authenticated state
    localStorage.setItem('token', 'fake-token');
    
    // Mock the user being logged in
    Object.defineProperty(result.current, 'isAuthenticated', {
      value: true
    });
    
    Object.defineProperty(result.current, 'user', {
      value: {
        id: '123',
        email: 'test@example.com',
        name: 'Test User'
      }
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should handle login errors', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Mock fetch for failed login
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Invalid credentials' })
    });

    let error;
    await act(async () => {
      try {
        await result.current.login('test@example.com', 'wrong-password');
      } catch (e) {
        error = e;
      }
    });

    expect(error).toBeDefined();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should handle registration', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    const mockUser = {
      id: '123',
      email: 'newuser@example.com',
      name: 'New User'
    };
    
    // Mock fetch for registration
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser, token: 'new-fake-token' })
    });

    await act(async () => {
      await result.current.register({
        email: 'newuser@example.com',
        password: 'password',
        name: 'New User'
      });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(localStorage.getItem('token')).toBe('new-fake-token');
  });
});
