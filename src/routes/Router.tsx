
import { Routes, Route, Navigate } from 'react-router-dom';
import Index from '@/pages/Index';
import ScanPage from '@/pages/ScanPage';
import UploadPage from '@/pages/UploadPage';
import CalendarPage from '@/pages/CalendarPage';
import ShoppingPage from '@/pages/ShoppingPage';
import TasksPage from '@/pages/TasksPage';
import DocumentsPage from '@/pages/DocumentsPage';
import SettingsPage from '@/pages/SettingsPage';
import NotFound from '@/pages/NotFound';
import TroubleshootPage from '@/pages/TroubleshootPage';
import AIModelsPage from '@/pages/AIModelsPage';
import WeatherPage from '@/pages/WeatherPage';

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/scan" element={<ScanPage />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/shopping" element={<ShoppingPage />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/documents" element={<DocumentsPage />} />
      <Route path="/documents/:subtab" element={<DocumentsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/troubleshoot" element={<TroubleshootPage />} />
      <Route path="/ai-models" element={<AIModelsPage />} />
      <Route path="/weather" element={<WeatherPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Router;
