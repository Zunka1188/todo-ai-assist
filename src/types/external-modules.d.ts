
// Type definitions for external modules that don't have their own type declarations

declare module '@playwright/test' {
  export const test: any;
  export const expect: any;
  export const page: any;
  export const browser: any;
  export const context: any;
}

declare module 'axe-core' {
  const axe: any;
  export default axe;
}
