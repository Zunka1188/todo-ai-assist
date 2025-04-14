
import React from 'react';
import { cn } from '@/lib/utils';
import PageLayout from '@/components/layout/PageLayout';
import AppHeader from '@/components/layout/AppHeader';
import ErrorBoundary from '@/components/ui/error-boundary';
import LoadingState from '@/components/features/calendar/ui/LoadingState';
import ErrorState from '@/components/features/calendar/ui/ErrorState';
import ResponsiveContainer from '@/components/ui/responsive-container';
import { logger } from '@/utils/logger';

interface AppPageProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
  error?: string | null;
  fullHeight?: boolean;
  noPadding?: boolean;
  showBackButton?: boolean;
  backTo?: string;
  className?: string;
  onRetry?: () => void;
}

const AppPage: React.FC<AppPageProps> = ({ 
  title,
  subtitle,
  icon,
  actions,
  children,
  isLoading = false,
  loadingMessage,
  error = null,
  fullHeight = false,
  noPadding = false,
  showBackButton = true,
  backTo = '/',
  className,
  onRetry = () => window.location.reload()
}) => {
  const defaultLoadingMessage = `Loading ${title.toLowerCase()}...`;
  
  return (
    <ErrorBoundary
      fallbackUI={
        <ErrorState 
          error={error || "An unexpected error occurred"} 
          onRetry={onRetry} 
        />
      }
      onError={(err, info) => logger.error(`[${title}] Error:`, err, info)}
    >
      <PageLayout
        maxWidth="full"
        className={cn(
          fullHeight ? 'flex flex-col min-h-[calc(100vh-4rem)]' : '',
          noPadding ? 'p-0' : '',
          className
        )}
      >
        {title && (
          <AppHeader
            title={title}
            subtitle={subtitle}
            icon={icon}
            className="mb-4"
            actions={actions}
            backTo={showBackButton ? backTo : undefined}
          />
        )}
        
        {isLoading ? (
          <LoadingState message={loadingMessage || defaultLoadingMessage} />
        ) : error ? (
          <ErrorState error={error} onRetry={onRetry} />
        ) : (
          <ResponsiveContainer
            direction="column"
            gap="md"
            className="w-full"
            mobileFullWidth={true}
          >
            {children}
          </ResponsiveContainer>
        )}
      </PageLayout>
    </ErrorBoundary>
  );
};

export default AppPage;
