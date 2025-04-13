
import { useState, useEffect, useCallback } from 'react';
import { generateCSRFToken, validateCSRFToken, SecurityConfig } from '@/utils/security';
import { useToast } from './use-toast';
import { useAppState } from '@/state/useStore';
import { logger } from '@/utils/logger';

interface UseSecurityOptions {
  csrfEnabled?: boolean;
  secureStorage?: boolean;
}

export function useSecurity(options: UseSecurityOptions = {}) {
  const [csrfToken, setCsrfToken] = useState<string>('');
  const { toast } = useToast();
  const { debugMode } = useAppState();
  
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
    }
  }, [options.csrfEnabled, debugMode]);
  
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
  }, []);
  
  return {
    csrfToken,
    validateToken,
    refreshToken,
    // Form helper that includes the CSRF token
    getFormSecurityProps: () => ({
      'data-csrf': csrfToken,
    })
  };
}

export default useSecurity;
