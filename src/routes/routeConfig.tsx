
import React, { lazy, Suspense, ComponentType } from 'react';
import { RouteObject } from 'react-router-dom';
import LoadingState from '@/components/features/calendar/ui/LoadingState';
import RouteErrorBoundary from './RouteErrorBoundary';
import { ShoppingItemsProvider } from '@/components/features/shopping/ShoppingItemsContext';
import RouteGuard from '@/components/auth/RouteGuard';

// Lazy load pages for better performance with retry logic - fixed type definition
const retryLoadComponent = <T extends { default: ComponentType<any> }>(
  fn: () => Promise<T>, 
  retriesLeft = 3, 
  interval = 1000
): Promise<T> => {
  return new Promise((resolve, reject) => {
    fn()
      .then(resolve)
      .catch((error) => {
        setTimeout(() => {
          if (retriesLeft === 1) {
            reject(error);
            return;
          }
          retryLoadComponent(fn, retriesLeft - 1, interval).then(resolve, reject);
        }, interval);
      });
  });
};

// Lazy load pages with retry
const Index = lazy(() => retryLoadComponent(() => import('@/pages/Index')));
const ScanPage = lazy(() => retryLoadComponent(() => import('@/pages/ScanPage')));
const UploadPage = lazy(() => retryLoadComponent(() => import('@/pages/UploadPage')));
const CalendarPage = lazy(() => retryLoadComponent(() => import('@/pages/CalendarPage')));
const ShoppingPage = lazy(() => retryLoadComponent(() => import('@/pages/ShoppingPage')));
const TasksPage = lazy(() => retryLoadComponent(() => import('@/pages/TasksPage')));
const DocumentsPage = lazy(() => retryLoadComponent(() => import('@/pages/DocumentsPage')));
const SettingsPage = lazy(() => retryLoadComponent(() => import('@/pages/SettingsPage')));
const NotFound = lazy(() => retryLoadComponent(() => import('@/pages/NotFound')));
const TroubleshootPage = lazy(() => retryLoadComponent(() => import('@/pages/TroubleshootPage')));
const AIModelsPage = lazy(() => retryLoadComponent(() => import('@/pages/AIModelsPage')));
const WeatherPage = lazy(() => retryLoadComponent(() => import('@/pages/WeatherPage')));
const ProduceRecognitionPage = lazy(() => retryLoadComponent(() => import('@/pages/ProduceRecognitionPage')));
const RecipePage = lazy(() => retryLoadComponent(() => import('@/pages/RecipePage')));
const DocumentsSubtabPage = lazy(() => retryLoadComponent(() => import('@/pages/DocumentsSubtabPage')));

// Route guard to check authentication if needed
export function withAuthGuard(element: React.ReactNode, requireAuth = false, allowedRoles: string[] = []): React.ReactNode {
  return (
    <RouteGuard requireAuth={requireAuth} allowedRoles={allowedRoles}>
      {element}
    </RouteGuard>
  );
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
export const withAllWrappers = (
  element: React.ReactNode, 
  name: string, 
  requireAuth = false, 
  allowedRoles: string[] = []
): React.ReactNode => 
  withErrorBoundary(
    withSuspense(
      withAuthGuard(element, requireAuth, allowedRoles)
    ), 
    name
  );

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
    element: withAllWrappers(<ScanPage />, 'Scan', true),
  },
  {
    path: '/upload',
    element: withAllWrappers(<UploadPage />, 'Upload', true),
  },
  {
    path: '/calendar',
    element: withAllWrappers(<CalendarPage />, 'Calendar', true),
  },
  {
    path: '/shopping',
    element: withAllWrappers(<EnhancedShoppingPage />, 'Shopping', true),
  },
  {
    path: '/tasks',
    element: withAllWrappers(<TasksPage />, 'Tasks', true),
  },
  {
    path: '/documents',
    element: withAllWrappers(<DocumentsPage />, 'Documents', true),
  },
  {
    path: '/documents/:subtab',
    element: withAllWrappers(<DocumentsSubtabPage />, 'Documents Subtab', true),
  },
  {
    path: '/documents/ocr',
    element: withAllWrappers(<DocumentsPage />, 'OCR Documents', true),
  },
  {
    path: '/settings',
    element: withAllWrappers(<SettingsPage />, 'Settings', true, ['admin']),
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
