
import { z } from 'zod';
import { logger } from './logger';

/**
 * Basic shopping item schema for validation
 */
export const ShoppingItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  completed: z.boolean(),
  dateAdded: z.instanceof(Date),
  // Optional fields with validation
  amount: z.string().optional(),
  price: z.string().optional()
    .refine(val => !val || !isNaN(parseFloat(val)), {
      message: "Price must be a valid number"
    }),
  imageUrl: z.string().nullable().optional(),
  notes: z.string().optional(),
  repeatOption: z.enum(['none', 'weekly', 'monthly']).optional(),
  lastPurchased: z.instanceof(Date).optional(),
});

/**
 * Type definition for shopping item
 */
export type ShoppingItem = z.infer<typeof ShoppingItemSchema>;

/**
 * Validates a shopping item against the schema
 * @param item Item to validate
 * @returns Object with validation result
 */
export function validateShoppingItem(item: any): { 
  valid: boolean; 
  errors?: string[];
  value?: ShoppingItem;
} {
  try {
    const result = ShoppingItemSchema.safeParse(item);
    
    if (result.success) {
      return { valid: true, value: result.data };
    } else {
      return {
        valid: false,
        errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
  } catch (error) {
    logger.error('[Validation] Error validating shopping item:', error);
    return { 
      valid: false,
      errors: ['Unknown validation error']
    };
  }
}

/**
 * Validates an array of shopping items
 * @param items Array of items to validate
 * @returns Object with validation results and valid items
 */
export function validateShoppingItems(items: any[]): {
  valid: boolean;
  validItems: ShoppingItem[];
  invalidItems: any[];
  errorCount: number;
} {
  if (!Array.isArray(items)) {
    return { valid: false, validItems: [], invalidItems: [], errorCount: 1 };
  }
  
  const validItems: ShoppingItem[] = [];
  const invalidItems: any[] = [];
  
  for (const item of items) {
    const validation = validateShoppingItem(item);
    
    if (validation.valid && validation.value) {
      validItems.push(validation.value);
    } else {
      invalidItems.push(item);
    }
  }
  
  return {
    valid: invalidItems.length === 0,
    validItems,
    invalidItems,
    errorCount: invalidItems.length
  };
}

/**
 * Converts date strings to Date objects in shopping items
 * @param items Items to process
 * @returns Processed items with Date objects
 */
export function processShoppingItems(items: any[]): any[] {
  if (!Array.isArray(items)) return [];
  
  try {
    return items.map(item => ({
      ...item,
      dateAdded: item.dateAdded ? new Date(item.dateAdded) : new Date(),
      lastPurchased: item.lastPurchased ? new Date(item.lastPurchased) : undefined
    }));
  } catch (error) {
    logger.error('[Validation] Error processing shopping items:', error);
    return [];
  }
}
