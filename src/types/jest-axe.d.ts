
/**
 * Type definitions for jest-axe
 */

declare module 'jest-axe' {
  import { Result } from 'axe-core';
  
  export function axe(html: Element | string): Promise<Result>;
  
  export const toHaveNoViolations: {
    pass: boolean;
    message: () => string;
  };
  
  export interface AxeResults {
    violations: any[];
    passes: any[];
    incomplete: any[];
    inapplicable: any[];
  }
}
