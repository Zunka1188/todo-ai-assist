
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import { logger } from './logger';

/**
 * Type for validation errors
 */
export type ValidationError = {
  path: string;
  message: string;
};

/**
 * Validate data against a Zod schema
 * @param schema Zod schema
 * @param data Data to validate
 * @returns Result object with success flag, validated data, and errors
 */
export function validateWithSchema<T>(
  schema: z.ZodType<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
} {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      
      logger.error('[Validation] Schema validation failed', { errors });
      
      return {
        success: false,
        errors,
      };
    }
    
    logger.error('[Validation] Unexpected validation error', error);
    
    return {
      success: false,
      errors: [
        {
          path: '',
          message: 'An unexpected error occurred during validation',
        }
      ],
    };
  }
}

/**
 * Sanitize HTML string to prevent XSS attacks
 * @param html HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
  });
}

/**
 * Sanitize and validate a text input
 * @param input Text input to sanitize
 * @param maxLength Maximum allowed length
 * @param trim Whether to trim whitespace
 * @returns Sanitized input
 */
export function sanitizeTextInput(
  input: string,
  maxLength: number = 255,
  trim: boolean = true
): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  let sanitized = DOMPurify.sanitize(input);
  
  if (trim) {
    sanitized = sanitized.trim();
  }
  
  if (maxLength > 0 && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Common validation schemas
 */
export const ValidationSchemas = {
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, and _.-'),
  url: z.string().url('Invalid URL format'),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number format'),
  date: z.coerce.date(),
};

/**
 * Create a form validator for React Hook Form
 * @param schema Zod schema
 * @returns Validation resolver
 */
export function createFormValidator<T>(schema: z.ZodType<T>) {
  return async (values: unknown) => {
    const result = validateWithSchema(schema, values);
    
    if (result.success) {
      return {
        values: result.data,
        errors: {},
      };
    }
    
    const errors = result.errors?.reduce(
      (acc, error) => {
        if (error.path) {
          acc[error.path] = {
            type: 'validation',
            message: error.message,
          };
        }
        return acc;
      },
      {} as Record<string, { type: string; message: string }>
    ) || {};
    
    return {
      values: {},
      errors,
    };
  };
}

/**
 * Form field validation rules with sanitization
 */
export function createSanitizedField(maxLength: number = 255) {
  return {
    setValueAs: (value: string) => sanitizeTextInput(value, maxLength),
  };
}
