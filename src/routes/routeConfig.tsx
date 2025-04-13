
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

// Split code into chunks for better loading performance
const pageBundles = {
  home: () => import(/* webpackChunkName: "home" */ '@/pages/Index'),
  scan: () => import(/* webpackChunkName: "scan" */ '@/pages/ScanPage'),
  upload: () => import(/* webpackChunkName: "upload" */ '@/pages/UploadPage'),
  calendar: () => import(/* webpackChunkName: "calendar" */ '@/pages/CalendarPage'),
  shopping: () => import(/* webpackChunkName: "shopping" */ '@/pages/ShoppingPage'),
  tasks: () => import(/* webpackChunkName: "tasks" */ '@/pages/TasksPage'),
  documents: () => import(/* webpackChunkName: "documents" */ '@/pages/DocumentsPage'),
  settings: () => import(/* webpackChunkName: "settings" */ '@/pages/SettingsPage'),
  notFound: () => import(/* webpackChunkName: "not-found" */ '@/pages/NotFound'),
  troubleshoot: () => import(/* webpackChunkName: "troubleshoot" */ '@/pages/TroubleshootPage'),
  aiModels: () => import(/* webpackChunkName: "ai-models" */ '@/pages/AIModelsPage'),
  weather: () => import(/* webpackChunkName: "weather" */ '@/pages/WeatherPage'),
  produceRecognition: () => import(/* webpackChunkName: "produce" */ '@/pages/ProduceRecognitionPage'),
  recipe: () => import(/* webpackChunkName: "recipe" */ '@/pages/RecipePage'),
  documentsSubtab: () => import(/* webpackChunkName: "docs-subtab" */ '@/pages/DocumentsSubtabPage'),
};

// Lazy load pages with retry and code splitting
const Index = lazy(() => retryLoadComponent(pageBundles.home));
const ScanPage = lazy(() => retryLoadComponent(pageBundles.scan));
const UploadPage = lazy(() => retryLoadComponent(pageBundles.upload));
const CalendarPage = lazy(() => retryLoadComponent(pageBundles.calendar));
const ShoppingPage = lazy(() => retryLoadComponent(pageBundles.shopping));
const TasksPage = lazy(() => retryLoadComponent(pageBundles.tasks));
const DocumentsPage = lazy(() => retryLoadComponent(pageBundles.documents));
const SettingsPage = lazy(() => retryLoadComponent(pageBundles.settings));
const NotFound = lazy(() => retryLoadComponent(pageBundles.notFound));
const TroubleshootPage = lazy(() => retryLoadComponent(pageBundles.troubleshoot));
const AIModelsPage = lazy(() => retryLoadComponent(pageBundles.aiModels));
const WeatherPage = lazy(() => retryLoadComponent(pageBundles.weather));
const ProduceRecognitionPage = lazy(() => retryLoadComponent(pageBundles.produceRecognition));
const RecipePage = lazy(() => retryLoadComponent(pageBundles.recipe));
const DocumentsSubtabPage = lazy(() => retryLoadComponent(pageBundles.documentsSubtab));

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

// Function to prefetch routes for faster navigation
export const prefetchRoutes = (routePaths: string[]) => {
  routePaths.forEach(path => {
    switch (path) {
      case '/':
        pageBundles.home();
        break;
      case '/scan':
        pageBundles.scan();
        break;
      case '/upload':
        pageBundles.upload();
        break;
      case '/calendar':
        pageBundles.calendar();
        break;
      case '/shopping':
        pageBundles.shopping();
        break;
      case '/tasks':
        pageBundles.tasks();
        break;
      case '/documents':
        pageBundles.documents();
        break;
      default:
        // No prefetch for other routes
        break;
    }
  });
};
