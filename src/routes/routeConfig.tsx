
import React, { lazy, Suspense } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import LoadingState from '@/components/features/calendar/ui/LoadingState';
import RouteErrorBoundary from './RouteErrorBoundary';
import { useToast } from '@/hooks/use-toast';

// Lazy load pages for better performance
const Index = lazy(() => import('@/pages/Index'));
const ScanPage = lazy(() => import('@/pages/ScanPage'));
const UploadPage = lazy(() => import('@/pages/UploadPage'));
const CalendarPage = lazy(() => import('@/pages/CalendarPage'));
const ShoppingPage = lazy(() => import('@/pages/ShoppingPage'));
const TasksPage = lazy(() => import('@/pages/TasksPage'));
const DocumentsPage = lazy(() => import('@/pages/DocumentsPage'));
const DocumentsSubtabPage = lazy(() => import('@/pages/DocumentsSubtabPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const TroubleshootPage = lazy(() => import('@/pages/TroubleshootPage'));
const AIModelsPage = lazy(() => import('@/pages/AIModelsPage'));
const WeatherPage = lazy(() => import('@/pages/WeatherPage'));
const ProduceRecognitionPage = lazy(() => import('@/pages/ProduceRecognitionPage'));
const RecipePage = lazy(() => import('@/pages/RecipePage'));

// Route guard to check authentication if needed
export function withAuthGuard(element: React.ReactNode): React.ReactNode {
  // This is where you would check for authentication
  // For now, just returning the element since we don't have auth
  return element;
}

// Suspense wrapper for all lazy-loaded routes
export const withSuspense = (element: React.ReactNode): React.ReactNode => (
  <Suspense fallback={<LoadingState message="Loading page..." />}>
    {element}
  </Suspense>
);

// Error boundary wrapper for routes
export const withErrorBoundary = (element: React.ReactNode, name: string): React.ReactNode => (
  <RouteErrorBoundary routeName={name}>
    {element}
  </RouteErrorBoundary>
);

// Helper to combine all wrappers
export const withAllWrappers = (element: React.ReactNode, name: string): React.ReactNode => 
  withErrorBoundary(withSuspense(withAuthGuard(element)), name);

// Custom ShoppingPage with context provider
const EnhancedShoppingPage = () => (
  <ShoppingItemsProvider>
    <ShoppingPage />
  </ShoppingItemsProvider>
);

// Routes configuration
export const routes: RouteObject[] = [
  {
    path: '/',
    element: withAllWrappers(<Index />, 'Home'),
  },
  {
    path: '/scan',
    element: withAllWrappers(<ScanPage />, 'Scan'),
  },
  {
    path: '/upload',
    element: withAllWrappers(<UploadPage />, 'Upload'),
  },
  {
    path: '/calendar',
    element: withAllWrappers(<CalendarPage />, 'Calendar'),
  },
  {
    path: '/shopping',
    element: withAllWrappers(<EnhancedShoppingPage />, 'Shopping'),
  },
  {
    path: '/tasks',
    element: withAllWrappers(<TasksPage />, 'Tasks'),
  },
  {
    path: '/documents',
    element: withAllWrappers(<DocumentsPage />, 'Documents'),
  },
  {
    path: '/documents/:subtab',
    element: withAllWrappers(<DocumentsSubtabPage />, 'Documents Subtab'),
  },
  {
    path: '/documents/ocr',
    element: withAllWrappers(<DocumentsPage />, 'OCR Documents'),
  },
  {
    path: '/settings',
    element: withAllWrappers(<SettingsPage />, 'Settings'),
  },
  {
    path: '/troubleshoot',
    element: withAllWrappers(<TroubleshootPage />, 'Troubleshoot'),
  },
  {
    path: '/ai-models',
    element: withAllWrappers(<AIModelsPage />, 'AI Models'),
  },
  {
    path: '/weather',
    element: withAllWrappers(<WeatherPage />, 'Weather'),
  },
  {
    path: '/produce-recognition',
    element: withAllWrappers(<ProduceRecognitionPage />, 'Produce Recognition'),
  },
  {
    path: '/recipes',
    element: withAllWrappers(<RecipePage />, 'Recipes'),
  },
  {
    path: '/recipes/:id',
    element: withAllWrappers(<RecipePage />, 'Recipe Detail'),
  },
  {
    path: '*',
    element: withAllWrappers(<NotFound />, '404 Not Found'),
  },
];

// Add this import to fix the ShoppingItemsProvider reference
import { ShoppingItemsProvider } from '@/components/features/shopping/ShoppingItemsContext';
