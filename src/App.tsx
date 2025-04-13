
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

// Create query client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
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
    <StoreProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ToastProvider>
            <TooltipProvider>
              <BrowserRouter {...routerOptions}>
                <Toaster />
                <Sonner />
                <AppLayout>
                  <Router />
                </AppLayout>
              </BrowserRouter>
            </TooltipProvider>
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StoreProvider>
  );
};

export default App;
