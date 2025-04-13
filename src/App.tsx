import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { ToastProvider } from "@/hooks/use-toast";
import { LanguageProvider } from "@/hooks/use-language";
import AppLayout from "./components/layout/AppLayout";
import Router from "./routes/Router";
import { StoreProvider } from "./state/useStore";
import { SecurityProvider } from "./state/SecurityProvider";
import ErrorBoundary from "./components/ui/error-boundary";
import GlobalErrorBoundary from "./components/ui/global-error-boundary";
import React, { useEffect } from "react";
import { getSecurityHeaders } from "./utils/security";
import { logger } from "./utils/logger";
import { performanceMonitor } from "./utils/performance-monitor";
import { initErrorFeedback } from "./utils/error-feedback";
import { AuthProvider } from "./hooks/use-auth";
import { initBundleOptimizations } from "./utils/bundle-optimization";

// Import i18n configuration
import "@/i18n/i18n";

// Enable performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  performanceMonitor.enable(true);
  logger.log('[App] Performance monitoring enabled');
}

// Create query client with enhanced options and error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Updated to use meta.onError for TanStack Query v5 compatibility
      meta: {
        onError: (error: Error) => {
          logger.error('[QueryClient] Query error:', error);
        }
      }
    },
    mutations: {
      // Updated to use meta.onError for TanStack Query v5 compatibility
      meta: {
        onError: (error: Error) => {
          logger.error('[QueryClient] Mutation error:', error);
        }
      }
    }
  }
});

// Add future flags to address React Router warnings
const routerOptions = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

// Apply CSP headers via meta tag
const SecurityMetaTags = () => {
  useEffect(() => {
    try {
      // Apply security headers to meta tags
      const headers = getSecurityHeaders();
      Object.entries(headers).forEach(([name, content]) => {
        if (name === 'Content-Security-Policy') {
          const existingMeta = document.querySelector(`meta[http-equiv="${name}"]`);
          if (!existingMeta) {
            const meta = document.createElement('meta');
            meta.httpEquiv = name;
            meta.content = content;
            document.head.appendChild(meta);
          }
        }
      });

      // Record performance mark for app initialization
      performanceMonitor.mark('app_initialized');
      
      // Initialize bundle optimizations
      initBundleOptimizations({
        preconnect: [
          'https://fonts.googleapis.com',
          'https://fonts.gstatic.com'
        ],
        preloadImages: [
          '/placeholder.svg'
        ]
      });
      
      // Initialize error feedback system
      try {
        initErrorFeedback();
      } catch (err) {
        logger.error('[App] Failed to initialize error feedback system:', err);
      }
    } catch (error) {
      logger.error('[App] Error in SecurityMetaTags initialization:', error);
    }
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  return null;
};

const App = () => {
  // Record performance mark for app render start
  React.useEffect(() => {
    performanceMonitor.mark('app_render_start');
    
    return () => {
      performanceMonitor.measure('app_render_time', 'app_render_start', 'app_initialized');
    };
  }, []);

  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <StoreProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <ToastProvider>
                <LanguageProvider>
                  <SecurityProvider>
                    <SecurityMetaTags />
                    <TooltipProvider>
                      <BrowserRouter {...routerOptions}>
                        <Toaster />
                        <Sonner />
                        <AppLayout>
                          <ErrorBoundary>
                            <Router />
                          </ErrorBoundary>
                        </AppLayout>
                      </BrowserRouter>
                    </TooltipProvider>
                  </SecurityProvider>
                </LanguageProvider>
              </ToastProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </StoreProvider>
      </AuthProvider>
    </GlobalErrorBoundary>
  );
};

export default App;
