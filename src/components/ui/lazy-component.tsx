
import React, { Suspense, lazy, ComponentType, LazyExoticComponent } from 'react';
import { Loader2 } from 'lucide-react';
import { performanceMonitor } from '@/utils/performance-monitor';

interface LazyComponentProps {
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

/**
 * Enhanced lazy loading with performance tracking
 */
export function createLazyComponent<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  componentName: string
): LazyExoticComponent<T> {
  return lazy(() => {
    performanceMonitor.mark(`lazy_load_start_${componentName}`);
    
    return factory().then(module => {
      performanceMonitor.mark(`lazy_load_end_${componentName}`);
      performanceMonitor.measure(
        `lazy_load_${componentName}`,
        `lazy_load_start_${componentName}`,
        `lazy_load_end_${componentName}`
      );
      
      return module;
    });
  });
}

/**
 * Default fallback component for lazy loading
 */
const DefaultLoadingFallback = () => (
  <div className="flex justify-center items-center p-8 min-h-[100px]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

/**
 * Default error fallback for lazy loading failures
 */
const DefaultErrorFallback = () => (
  <div className="p-4 text-center border border-destructive bg-destructive/10 rounded-md">
    <p className="text-destructive">Failed to load component</p>
  </div>
);

/**
 * Lazy Component Wrapper with error boundary and loading state
 */
export function LazyComponent<P>({
  component: LazyComp,
  fallback = <DefaultLoadingFallback />,
  errorFallback = <DefaultErrorFallback />,
  ...props
}: {
  component: React.ComponentType<P>;
} & P & LazyComponentProps) {
  return (
    <React.Fragment>
      <Suspense fallback={fallback}>
        <ErrorBoundaryForLazyLoad fallback={errorFallback}>
          <LazyComp {...(props as P)} />
        </ErrorBoundaryForLazyLoad>
      </Suspense>
    </React.Fragment>
  );
}

/**
 * Error boundary specifically for lazy-loaded components
 */
class ErrorBoundaryForLazyLoad extends React.Component<{
  children: React.ReactNode;
  fallback: React.ReactNode;
}, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    performanceMonitor.mark('lazy_load_error');
    console.error('Error loading lazy component:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Helper function to create a lazy-loaded route component
export function lazyRoute(
  factory: () => Promise<{ default: React.ComponentType<any> }>,
  componentName: string
) {
  const LazyComp = createLazyComponent(factory, componentName);
  
  return (props: any) => (
    <LazyComponent 
      component={LazyComp} 
      {...props} 
      fallback={<DefaultLoadingFallback />} 
    />
  );
}
