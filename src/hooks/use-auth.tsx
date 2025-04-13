
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { logger } from '@/utils/logger';
import { performanceMonitor } from '@/utils/performance-monitor';

// Define types for auth
export type User = {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  profileImageUrl?: string;
  lastLogin?: Date;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
};

// Create auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Initialize auth state
  useEffect(() => {
    performanceMonitor.mark('auth_init_start');
    
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        
        // Check local storage for tokens
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          setUser(null);
          return;
        }
        
        // Validate the token (this is a placeholder - will need API call in real implementation)
        // In a real app, this would verify the token with your backend
        const userData = JSON.parse(localStorage.getItem('user_data') || 'null');
        
        if (userData) {
          setUser(userData);
        } else {
          // Token exists but no user data - clear auth
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        }
      } catch (err) {
        logger.error('[Auth] Error checking auth status:', err);
        setError(err instanceof Error ? err : new Error('Unknown authentication error'));
        
        // Clear potentially corrupted auth data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      } finally {
        setIsLoading(false);
        performanceMonitor.mark('auth_init_end');
        performanceMonitor.measure(
          'auth_initialization',
          'auth_init_start',
          'auth_init_end'
        );
      }
    };
    
    checkAuthStatus();
    
    // Set up token expiration check
    const tokenCheckInterval = setInterval(() => {
      const tokenExpiry = localStorage.getItem('token_expiry');
      if (tokenExpiry && new Date(tokenExpiry) < new Date()) {
        logger.log('[Auth] Token expired, logging out user');
        logout();
      }
    }, 60000); // Check every minute
    
    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, []);
  
  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    performanceMonitor.mark('login_start');
    
    try {
      setIsLoading(true);
      setError(null);
      
      // This is a placeholder - in a real app, this would call your authentication API
      if (email === 'demo@example.com' && password === 'password123') {
        // Simulate successful login
        const mockUser: User = {
          id: '123456',
          email: 'demo@example.com',
          name: 'Demo User',
          role: 'user',
          lastLogin: new Date()
        };
        
        // Store auth data
        localStorage.setItem('auth_token', 'mock_token_123456');
        localStorage.setItem('user_data', JSON.stringify(mockUser));
        localStorage.setItem('token_expiry', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());
        
        setUser(mockUser);
        logger.log('[Auth] User logged in:', email);
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (err) {
      logger.error('[Auth] Login error:', err);
      setError(err instanceof Error ? err : new Error('Failed to login'));
      throw err;
    } finally {
      setIsLoading(false);
      performanceMonitor.mark('login_end');
      performanceMonitor.measure(
        'login_process',
        'login_start',
        'login_end'
      );
    }
  };
  
  // Logout function
  const logout = async (): Promise<void> => {
    performanceMonitor.mark('logout_start');
    
    try {
      setIsLoading(true);
      
      // Clear stored auth data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('token_expiry');
      
      setUser(null);
      logger.log('[Auth] User logged out');
    } catch (err) {
      logger.error('[Auth] Logout error:', err);
      setError(err instanceof Error ? err : new Error('Failed to logout'));
      throw err;
    } finally {
      setIsLoading(false);
      performanceMonitor.mark('logout_end');
      performanceMonitor.measure(
        'logout_process',
        'logout_start',
        'logout_end'
      );
    }
  };
  
  // Signup function
  const signup = async (email: string, password: string, name: string): Promise<void> => {
    performanceMonitor.mark('signup_start');
    
    try {
      setIsLoading(true);
      setError(null);
      
      // This is a placeholder - in a real app, this would call your API
      // Simulate signup process
      
      // Check if email is already used (mock implementation)
      if (email === 'demo@example.com') {
        throw new Error('Email already in use');
      }
      
      // Create mock user
      const mockUser: User = {
        id: `user_${Date.now()}`,
        email,
        name,
        role: 'user',
        lastLogin: new Date()
      };
      
      // Store auth data
      localStorage.setItem('auth_token', `mock_token_${mockUser.id}`);
      localStorage.setItem('user_data', JSON.stringify(mockUser));
      localStorage.setItem('token_expiry', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());
      
      setUser(mockUser);
      logger.log('[Auth] User signed up:', email);
    } catch (err) {
      logger.error('[Auth] Signup error:', err);
      setError(err instanceof Error ? err : new Error('Failed to sign up'));
      throw err;
    } finally {
      setIsLoading(false);
      performanceMonitor.mark('signup_end');
      performanceMonitor.measure(
        'signup_process',
        'signup_start',
        'signup_end'
      );
    }
  };
  
  // Reset password function
  const resetPassword = async (email: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // This is a placeholder - in a real app, this would call your API
      // Simulate password reset process
      logger.log('[Auth] Password reset requested for:', email);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would send a reset email
    } catch (err) {
      logger.error('[Auth] Password reset error:', err);
      setError(err instanceof Error ? err : new Error('Failed to reset password'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update profile function
  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('No authenticated user');
      }
      
      // This is a placeholder - in a real app, this would call your API
      // Update user in local state
      const updatedUser = { ...user, ...updates };
      
      // Update stored user data
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      setUser(updatedUser);
      logger.log('[Auth] User profile updated');
    } catch (err) {
      logger.error('[Auth] Profile update error:', err);
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // The value provided to consumers
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    signup,
    resetPassword,
    updateProfile
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Higher-order component to protect routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedRoute(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) {
      return <div>Loading authentication...</div>;
    }
    
    if (!isAuthenticated) {
      return <div>Please log in to access this page.</div>;
    }
    
    return <Component {...props} />;
  };
}
