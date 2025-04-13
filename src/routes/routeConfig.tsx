
import React from 'react';
import { RouteObject } from 'react-router-dom';

// Import page components
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import CalendarPage from '@/pages/CalendarPage';
import DocumentsPage from '@/pages/DocumentsPage';
import SettingsPage from '@/pages/SettingsPage';
import ShoppingPage from '@/pages/ShoppingPage';
import TasksPage from '@/pages/TasksPage';
import TroubleshootPage from '@/pages/TroubleshootPage';
import WeatherPage from '@/pages/WeatherPage';
import UploadPage from '@/pages/UploadPage';
import AIModelsPage from '@/pages/AIModelsPage';
import AITrainingPage from '@/pages/AITrainingPage';
import ProduceRecognitionPage from '@/pages/ProduceRecognitionPage';
import RecipePage from '@/pages/RecipePage';
import RecipeCollectionPage from '@/pages/RecipeCollectionPage';
import CreateRecipePage from '@/pages/CreateRecipePage';
import EditRecipePage from '@/pages/EditRecipePage';

// Import layout components
import AppLayout from '@/components/layout/AppLayout';
import RouteErrorBoundary from '@/routes/RouteErrorBoundary';

// Define a wrapper component that provides required props to RouteErrorBoundary
const RouteErrorWrapper = ({ children }: { children: React.ReactNode }) => (
  <RouteErrorBoundary routeName="app-routes">
    {children}
  </RouteErrorBoundary>
);

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <RouteErrorWrapper>
      <div>An error occurred loading this page</div>
    </RouteErrorWrapper>,
    children: [
      { index: true, element: <Index /> },
      { path: "calendar", element: <CalendarPage /> },
      { path: "recipes", element: <RecipePage /> },
      { path: "recipes/collection", element: <RecipeCollectionPage /> },
      { path: "recipes/create", element: <CreateRecipePage /> },
      { path: "recipes/:recipeId", element: <RecipePage /> },
      { path: "recipes/:recipeId/edit", element: <EditRecipePage /> },
      { path: "shopping", element: <ShoppingPage /> },
      { path: "documents", element: <DocumentsPage /> },
      { path: "tasks", element: <TasksPage /> },
      { path: "weather", element: <WeatherPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "upload", element: <UploadPage /> },
      { path: "troubleshoot", element: <TroubleshootPage /> },
      { path: "ai-models", element: <AIModelsPage /> },
      { path: "ai-training", element: <AITrainingPage /> },
      { path: "produce-recognition", element: <ProduceRecognitionPage /> },
      { path: "*", element: <NotFound /> }
    ]
  }
];

export default routes;
