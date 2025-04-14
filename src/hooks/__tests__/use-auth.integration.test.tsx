
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthProvider, useAuth } from '@/hooks/use-auth';

// Mock local storage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Create a wrapper component for the test hooks
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  it('provides default unauthenticated state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.userRoles).toEqual([]);
  });

  it('logs in a user and stores token in localStorage', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      const loginResult = await result.current.login('test@example.com', 'password123');
      expect(loginResult.success).toBe(true);
    });
    
    // Check that user is authenticated
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).not.toBe(null);
    
    // Check localStorage
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'auth_token',
      expect.any(String)
    );
  });

  it('fails login with incorrect credentials', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      const loginResult = await result.current.login('invalid@example.com', 'wrongpassword');
      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toBeTruthy();
    });
    
    // Check that user is not authenticated
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
  });

  it('logs out a user and clears localStorage', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // First login
    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    
    // Then logout
    await act(async () => {
      await result.current.logout();
    });
    
    // Check that user is logged out
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    
    // Check localStorage
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token');
  });

  it('restores authentication from localStorage on init', async () => {
    // Set a mock token in localStorage
    mockLocalStorage.setItem('auth_token', 'valid-test-token');
    
    // Render the hook which should initialize from localStorage
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for auth to initialize
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
    
    expect(result.current.user).not.toBe(null);
  });

  it('handles role-based permissions correctly', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Login as admin
    await act(async () => {
      await result.current.login('admin@example.com', 'adminpass', ['admin', 'user']);
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.userRoles).toContain('admin');
    expect(result.current.hasRole('admin')).toBe(true);
    
    // Login as regular user
    await act(async () => {
      await result.current.logout();
      await result.current.login('user@example.com', 'userpass', ['user']);
    });
    
    expect(result.current.userRoles).not.toContain('admin');
    expect(result.current.hasRole('admin')).toBe(false);
    expect(result.current.hasRole('user')).toBe(true);
  });
});
