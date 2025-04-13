
import React from 'react';
import { RouteObject } from 'react-router-dom';
import { lazyLoad, prefetchModule } from '@/utils/code-splitting';
import { performanceMonitor } from '@/utils/performance-monitor';
import ErrorBoundary from '@/components/ui/error-boundary';
import { logger } from '@/utils/logger';

// Lazy-loaded route components
const Index = lazyLoad(() => import('@/pages/Index'), 'IndexPage');
const CalendarPage = lazyLoad(() => import('@/pages/CalendarPage'), 'CalendarPage');
const ShoppingPage = lazyLoad(() => import('@/pages/ShoppingPage'), 'ShoppingPage');
const DocumentsPage = lazyLoad(() => import('@/pages/DocumentsPage'), 'DocumentsPage');
const ScanPage = lazyLoad(() => import('@/pages/ScanPage'), 'ScanPage');
const UploadPage = lazyLoad(() => import('@/pages/UploadPage'), 'UploadPage');
const WeatherPage = lazyLoad(() => import('@/pages/WeatherPage'), 'WeatherPage');
const NotFound = lazyLoad(() => import('@/pages/NotFound'), 'NotFoundPage');
const SettingsPage = lazyLoad(() => import('@/pages/SettingsPage'), 'SettingsPage');
const RecipePage = lazyLoad(() => import('@/pages/RecipePage'), 'RecipePage');
const AIModelsPage = lazyLoad(() => import('@/pages/AIModelsPage'), 'AIModelsPage');
const ProduceRecognitionPage = lazyLoad(() => import('@/pages/ProduceRecognitionPage'), 'ProduceRecognitionPage');

// Common loading component for routes
const RouteLoading = () => (
  <div className="flex justify-center items-center min-h-[50vh]">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
  </div>
);

// Error fallback for routes
const RouteFallback = () => (
  <div className="p-6 text-center">
    <h2 className="text-xl font-semibold mb-2">Failed to load page</h2>
    <p className="mb-4">The requested page couldn't be loaded. Please try again.</p>
    <button 
      onClick={() => window.location.reload()}
      className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
    >
      Reload page
    </button>
  </div>
);

// Wrap route component with Suspense and ErrorBoundary
const withRouteWrapper = (Component: React.LazyExoticComponent<React.ComponentType<any>>) => (
  <React.Suspense fallback={<RouteLoading />}>
    <ErrorBoundary fallback={<RouteFallback />}>
      <Component />
    </ErrorBoundary>
  </React.Suspense>
);

// Enhanced route configuration
export const enhancedRoutes: RouteObject[] = [
  {
    path: '/',
    element: withRouteWrapper(Index),
  },
  {
    path: '/calendar',
    element: withRouteWrapper(CalendarPage),
  },
  {
    path: '/shopping',
    element: withRouteWrapper(ShoppingPage),
  },
  {
    path: '/documents',
    element: withRouteWrapper(DocumentsPage),
  },
  {
    path: '/scan',
    element: withRouteWrapper(ScanPage),
  },
  {
    path: '/upload',
    element: withRouteWrapper(UploadPage),
  },
  {
    path: '/weather',
    element: withRouteWrapper(WeatherPage),
  },
  {
    path: '/settings',
    element: withRouteWrapper(SettingsPage),
  },
  {
    path: '/recipe',
    element: withRouteWrapper(RecipePage),
  },
  {
    path: '/ai-models',
    element: withRouteWrapper(AIModelsPage),
  },
  {
    path: '/produce-recognition',
    element: withRouteWrapper(ProduceRecognitionPage),
  },
  {
    path: '*',
    element: withRouteWrapper(NotFound),
  },
];

// Prefetch specific routes for better UX
export function prefetchRoutes(paths: string[]): void {
  const routesToPrefetch = enhancedRoutes
    .filter(route => paths.includes(route.path || ''));

  performanceMonitor.mark('route_prefetch_start');
  
  // Dynamically import route components
  paths.forEach(path => {
    const route = enhancedRoutes.find(r => r.path === path);
    if (route) {
      // This logs the prefetch intention but doesn't actually do the prefetch
      // The actual prefetch happens in Router.tsx
      logger.log(`[Router] Queueing prefetch for route: ${path}`);
    }
  });
  
  performanceMonitor.mark('route_prefetch_end');
  performanceMonitor.measure(
    'route_prefetch_time',
    'route_prefetch_start',
    'route_prefetch_end'
  );
}

// Map of paths to import functions for actual prefetching
export const routeImportMap: Record<string, () => Promise<{ default: React.ComponentType<any> }>> = {
  '/': () => import('@/pages/Index'),
  '/scan': () => import('@/pages/ScanPage'),
  '/upload': () => import('@/pages/UploadPage'),
  '/shopping': () => import('@/pages/ShoppingPage'),
  '/calendar': () => import('@/pages/CalendarPage'),
  '/documents': () => import('@/pages/DocumentsPage'),
  '/weather': () => import('@/pages/WeatherPage'),
};

// Export enhanced route configuration
export default enhancedRoutes;
