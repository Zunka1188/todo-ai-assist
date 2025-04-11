
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ScanButton from '@/components/features/ScanButton';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/hooks/use-theme';
import HomeHeader from '@/components/features/home/HomeHeader';
import WidgetGrid from '@/components/features/home/WidgetGrid';
import FeatureCardGrid from '@/components/features/home/FeatureCardGrid';
import QuickInfo from '@/components/features/home/QuickInfo';
import ErrorBoundary from '@/components/ui/error-boundary';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const { theme } = useTheme();
  const { toast } = useToast();

  const handleScan = () => {
    navigate('/scan');
  };
  
  useEffect(() => {
    // Prefetch critical routes for smoother navigation
    const prefetchRoutes = async () => {
      try {
        // Simulate prefetching by touching the cache for these routes
        const routes = ['/scan', '/upload', '/shopping', '/calendar', '/documents'];
        // We don't need to actually do anything here, just simulate the prefetch
      } catch (error) {
        console.error('Error prefetching routes:', error);
      }
    };
    
    prefetchRoutes();
    
    // Clean up any previous session data that might be stale
    sessionStorage.removeItem('returnToAfterScan');
    sessionStorage.removeItem('scanAction');
    sessionStorage.removeItem('preferredScanMode');
  }, []);

  return (
    <div className="space-y-5 py-3 sm:space-y-6 sm:py-4 w-full fade-in">
      {/* Header */}
      <HomeHeader />

      {/* Main scan button */}
      <div className="flex justify-center my-4 sm:my-6">
        <ScanButton 
          className="transform hover:scale-105 transition-transform active:scale-95 touch-manipulation" 
          onScan={handleScan}
        />
      </div>

      {/* Widgets section */}
      <ErrorBoundary>
        <WidgetGrid />
      </ErrorBoundary>

      {/* Feature cards */}
      <ErrorBoundary>
        <FeatureCardGrid />
      </ErrorBoundary>

      {/* Quick info */}
      <ErrorBoundary>
        <QuickInfo className="mt-5 sm:mt-6" />
      </ErrorBoundary>
    </div>
  );
};

export default Index;
