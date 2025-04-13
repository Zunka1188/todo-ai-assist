
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { ToastProvider } from "@/hooks/use-toast";
import AppLayout from "./components/layout/AppLayout";
import Router from "./routes/Router";
import { StoreProvider } from "./state/useStore";
import { SecurityProvider } from "./state/SecurityProvider";
import ErrorBoundary from "./components/ui/error-boundary";

// Create query client with default options and error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
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

const App = () => {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <ToastProvider>
              <SecurityProvider>
                <TooltipProvider>
                  <BrowserRouter {...routerOptions}>
                    <Toaster />
                    <Sonner />
                    <AppLayout>
                      <Router />
                    </AppLayout>
                  </BrowserRouter>
                </TooltipProvider>
              </SecurityProvider>
            </ToastProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </StoreProvider>
    </ErrorBoundary>
  );
};

export default App;
