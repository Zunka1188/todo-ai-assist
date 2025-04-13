
import { useState, useEffect, useCallback, useRef } from 'react';
import { generateCSRFToken, validateCSRFToken, SecurityConfig } from '@/utils/security';
import { useToast } from './use-toast';
import { useAppState } from '@/state/useStore';
import { logger } from '@/utils/logger';

interface UseSecurityOptions {
  csrfEnabled?: boolean;
  secureStorage?: boolean;
  tokenRefreshInterval?: number; // In milliseconds
}

export function useSecurity(options: UseSecurityOptions = {}) {
  const [csrfToken, setCsrfToken] = useState<string>('');
  const { toast } = useToast();
  const { debugMode } = useAppState();
  const tokenRefreshIntervalRef = useRef<number | null>(null);
  const tokenRefreshTime = options.tokenRefreshInterval || 30 * 60 * 1000; // Default 30 minutes
  
  // Generate a new CSRF token on mount
  useEffect(() => {
    if (options.csrfEnabled !== false) {
      const newToken = generateCSRFToken();
      setCsrfToken(newToken);
      
      // Store token in sessionStorage for persistence
      try {
        sessionStorage.setItem('csrf_token', newToken);
      } catch (error) {
        if (debugMode) {
          logger.error('[Security] Failed to store CSRF token:', error);
        }
      }
      
      // Set up automatic token refresh for extra security
      if (tokenRefreshIntervalRef.current) {
        window.clearInterval(tokenRefreshIntervalRef.current);
      }
      
      tokenRefreshIntervalRef.current = window.setInterval(() => {
        refreshToken();
      }, tokenRefreshTime) as unknown as number;
    }
    
    // Cleanup on unmount
    return () => {
      if (tokenRefreshIntervalRef.current) {
        window.clearInterval(tokenRefreshIntervalRef.current);
        tokenRefreshIntervalRef.current = null;
      }
    };
  }, [options.csrfEnabled, debugMode, tokenRefreshTime]);
  
  // Validate a given token against our stored token
  const validateToken = useCallback((tokenToValidate: string): boolean => {
    const storedToken = sessionStorage.getItem('csrf_token') || csrfToken;
    const isValid = validateCSRFToken(tokenToValidate, storedToken);
    
    if (!isValid && debugMode) {
      logger.warn('[Security] CSRF token validation failed');
      toast({
        title: "Security Warning",
        description: "Invalid security token detected.",
        variant: "destructive",
      });
    }
    
    return isValid;
  }, [csrfToken, toast, debugMode]);
  
  // Refresh the CSRF token (useful after form submissions)
  const refreshToken = useCallback(() => {
    const newToken = generateCSRFToken();
    setCsrfToken(newToken);
    
    try {
      sessionStorage.setItem('csrf_token', newToken);
      if (debugMode) {
        logger.log('[Security] CSRF token refreshed');
      }
    } catch (error) {
      if (debugMode) {
        logger.error('[Security] Failed to refresh CSRF token:', error);
      }
    }
    
    return newToken;
  }, [debugMode]);
  
  // Apply CSP headers via meta tags (client-side approach)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    // Only add if it doesn't exist yet
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = 
        "default-src 'self';" +
        "script-src 'self' 'unsafe-inline';" +
        "style-src 'self' 'unsafe-inline';" +
        "img-src 'self' data: blob:;" +
        "connect-src 'self' https://*.lovable.app;";
      document.head.appendChild(meta);
    }
    
    // Add secure headers for extra protection
    const headers = [
      { name: 'X-Content-Type-Options', value: 'nosniff' },
      { name: 'X-Frame-Options', value: 'DENY' },
      { name: 'X-XSS-Protection', value: '1; mode=block' },
      { name: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
    ];
    
    headers.forEach(header => {
      if (!document.querySelector(`meta[http-equiv="${header.name}"]`)) {
        const meta = document.createElement('meta');
        meta.httpEquiv = header.name;
        meta.content = header.value;
        document.head.appendChild(meta);
      }
    });
  }, []);
  
  // Generate a csrf token for fetch requests
  const getCsrfHeaders = useCallback(() => {
    return {
      'X-CSRF-Token': csrfToken,
      'X-Requested-With': 'XMLHttpRequest'
    };
  }, [csrfToken]);
  
  return {
    csrfToken,
    validateToken,
    refreshToken,
    getCsrfHeaders,
    // Form helper that includes the CSRF token
    getFormSecurityProps: useCallback(() => ({
      'data-csrf': csrfToken,
    }), [csrfToken])
  };
}

export default useSecurity;
