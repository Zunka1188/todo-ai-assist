
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
import { ThemeProvider } from '@/hooks/use-theme';
import { ToastProvider } from '@/components/ui/toast';

/**
 * Custom render function that includes providers necessary for component testing
 */
function customRender(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const AllProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <ThemeProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ThemeProvider>
    );
  };

  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };

/**
 * Create a mock function that returns a resolved promise with the given value
 */
export function mockResolvedValue<T>(value: T) {
  return vi.fn().mockResolvedValue(value);
}

/**
 * Create a mock function that returns a rejected promise with the given error
 */
export function mockRejectedValue(error: Error) {
  return vi.fn().mockRejectedValue(error);
}

/**
 * Create a snapshot test for a component
 */
export function createSnapshotTest(Component: React.ComponentType<any>, props?: Record<string, any>) {
  return () => {
    const { container } = render(<Component {...props} />);
    expect(container).toMatchSnapshot();
  };
}

/**
 * Mock the useToast hook
 */
export function mockUseToast() {
  const mockToast = vi.fn();
  
  vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
      toast: mockToast
    }),
    toast: mockToast
  }));
  
  return mockToast;
}

/**
 * Create a test for checking accessibility
 */
export function createAccessibilityTest(Component: React.ComponentType<any>, props?: Record<string, any>) {
  return async () => {
    const { container } = render(<Component {...props} />);
    const axeResults = await import('axe-core').then(axe => 
      axe.default.run(container)
    );
    expect(axeResults.violations).toEqual([]);
  };
}
