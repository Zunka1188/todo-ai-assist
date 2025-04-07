
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import AppLayout from "./components/layout/AppLayout";
import Index from "./pages/Index";
import ShoppingPage from "./pages/ShoppingPage";
import CalendarPage from "./pages/CalendarPage";
import ScanPage from "./pages/ScanPage";
import DocumentsPage from "./pages/DocumentsPage";
import UploadPage from "./pages/UploadPage";
import TasksPage from "./pages/TasksPage";
import SettingsPage from "./pages/SettingsPage";
import TroubleshootPage from "./pages/TroubleshootPage";
import AIModelsPage from "./pages/AIModelsPage";
import WeatherPage from "./pages/WeatherPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Index />} />
              <Route path="/shopping" element={<ShoppingPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/scan" element={<ScanPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/documents/:subtab" element={<DocumentsPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/troubleshoot" element={<TroubleshootPage />} />
              <Route path="/ai-models" element={<AIModelsPage />} />
              <Route path="/weather" element={<WeatherPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
