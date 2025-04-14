import React, { ReactElement } from 'react';
import { render as reactTestingLibraryRender, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@/hooks/use-theme';
import { ToastProvider } from '@/hooks/use-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { StoreProvider } from './state/useStore';
import { AuthProvider } from './hooks/use-auth';
import { TooltipProvider } from '@/components/ui/tooltip';
import { vi } from 'vitest';

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0
      }
    }
  });

  return (
    <AuthProvider>
      <StoreProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <ToastProvider>
              <TooltipProvider>
                <BrowserRouter>
                  {children}
                </BrowserRouter>
              </TooltipProvider>
            </ToastProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </StoreProvider>
    </AuthProvider>
  );
};

const render = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => reactTestingLibraryRender(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { render };

// Mock utilities
export const mockUseToast = () => {
  const mockToast = vi.fn();
  
  vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
      toast: mockToast
    }),
    toast: mockToast
  }));
  
  return mockToast;
};

export const mockUseNavigate = () => {
  const mockNavigate = vi.fn();
  
  vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom') as any;
    return {
      ...actual,
      useNavigate: () => mockNavigate
    };
  });
  
  return mockNavigate;
};

export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  const mockStorage = {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => {
        delete store[key];
      });
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    length: Object.keys(store).length
  };
  
  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true
  });
  
  return mockStorage;
};
