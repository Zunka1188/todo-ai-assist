
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import { logger } from './logger';

/**
 * Generate a CSRF token for form submissions
 */
export function generateCSRFToken(): string {
  const timestamp = Date.now().toString();
  const randomPart = Math.random().toString(36).substring(2, 12);
  return `${timestamp}-${randomPart}`;
}

/**
 * Validate a CSRF token (basic validation - compare with stored token)
 */
export function validateCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false;
  return token === storedToken;
}

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return DOMPurify.sanitize(input);
}

/**
 * Apply strict content security policy to response headers
 * (To be used in server-side rendering or service workers)
 */
export function getSecurityHeaders() {
  return {
    'Content-Security-Policy': 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline'; " + 
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: blob:; " +
      "connect-src 'self' https://*.lovable.app;",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  };
}

/**
 * Schema for validating security settings
 */
export const SecurityConfigSchema = z.object({
  csrfEnabled: z.boolean().default(true),
  secureHeadersEnabled: z.boolean().default(true),
  contentValidationEnabled: z.boolean().default(true),
});

/**
 * Type for security configuration
 */
export type SecurityConfig = z.infer<typeof SecurityConfigSchema>;

/**
 * Check for common security issues in the application
 */
export function runSecurityAudit(): { 
  issues: string[];
  recommendations: string[];
  score: number;
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check for localStorage usage of sensitive data
  try {
    const sensitiveKeys = ['token', 'auth', 'password', 'secret', 'key'];
    
    if (typeof window !== 'undefined' && window.localStorage) {
      Object.keys(window.localStorage).forEach(key => {
        if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
          issues.push(`Potentially sensitive data stored in localStorage: ${key}`);
          recommendations.push(`Consider using more secure storage for: ${key}`);
        }
      });
    }
  } catch (error) {
    logger.error('[Security] Error during security audit:', error);
  }
  
  // Calculate basic security score
  const baseScore = 50; // Start at 50%
  const deduction = issues.length * 10; // Deduct 10% per issue
  
  return {
    issues,
    recommendations,
    score: Math.max(0, Math.min(100, baseScore - deduction))
  };
}
