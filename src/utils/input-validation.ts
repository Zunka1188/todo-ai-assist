
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
  uuid: z.string().uuid('Invalid UUID format'),
  objectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
  ipAddress: z.string().ip('Invalid IP address format'),
  creditCard: z.string().regex(/^\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}$/, 'Invalid credit card format'),
  hexColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color format'),
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

/**
 * Validate file based on allowed types and size
 * @param file File to validate
 * @param allowedTypes Array of MIME types
 * @param maxSize Maximum file size in bytes
 * @returns Validation result
 */
export function validateFile(
  file: File,
  allowedTypes: string[] = [],
  maxSize: number = 5 * 1024 * 1024 // 5MB default
): { valid: boolean; message?: string } {
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      message: `File size exceeds maximum allowed (${(maxSize / (1024 * 1024)).toFixed(2)}MB)`,
    };
  }
  
  // Check file type if types are specified
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }
  
  return { valid: true };
}

/**
 * Advanced schema composition helpers
 */
export const SchemaHelpers = {
  /**
   * Create an object schema with common validation
   */
  createObjectSchema: <T extends z.ZodRawShape>(shape: T) => {
    return z.object(shape).strict();
  },
  
  /**
   * Create an array schema with common validation
   */
  createArraySchema: <T extends z.ZodTypeAny>(itemSchema: T) => {
    return z.array(itemSchema)
      .nonempty('Array cannot be empty');
  },
  
  /**
   * Transform and validate string to a number
   */
  stringToNumber: () => {
    return z.string()
      .transform((val) => {
        const parsed = parseFloat(val);
        return Number.isNaN(parsed) ? undefined : parsed;
      })
      .refine((val) => val !== undefined, 'Must be a valid number');
  },
};
