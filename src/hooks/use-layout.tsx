
import { useEffect, useState } from 'react';
import { useIsMobile } from './use-mobile';
import { useTheme } from './use-theme';
import { cn } from '@/lib/utils';

export interface LayoutConfig {
  containerClass: string;
  contentClass: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isDarkMode: boolean;
  sectionClass: string;
}

export function useLayout() {
  const { isMobile, windowWidth } = useIsMobile();
  const { theme } = useTheme();
  const [layout, setLayout] = useState<LayoutConfig>({
    containerClass: '',
    contentClass: '',
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isDarkMode: false,
    sectionClass: '',
  });

  useEffect(() => {
    const isTablet = windowWidth >= 640 && windowWidth < 1024;
    const isDesktop = windowWidth >= 1024;
    const isDarkMode = theme === 'dark';

    setLayout({
      containerClass: cn(
        'w-full h-full',
        isMobile ? 'px-2' : isTablet ? 'px-4' : 'px-6',
      ),
      contentClass: cn(
        'rounded-lg',
        isMobile ? 'p-3' : isTablet ? 'p-4' : 'p-6',
        isDarkMode ? 'bg-gray-800' : 'bg-white',
      ),
      isMobile,
      isTablet,
      isDesktop,
      isDarkMode,
      sectionClass: cn(
        'mb-4',
        isMobile ? 'mt-2' : isTablet ? 'mt-3' : 'mt-6'
      ),
    });
  }, [isMobile, windowWidth, theme]);

  return layout;
}

// Remove the local cn helper function since we're now importing it
