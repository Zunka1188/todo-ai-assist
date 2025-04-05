
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  fullHeight?: boolean;
  noPadding?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className,
  fullHeight = false,
  noPadding = false,
}) => {
  const { isMobile } = useIsMobile();
  
  return (
    <div 
      className={cn(
        'w-full',
        fullHeight ? 'h-full' : '',
        !noPadding ? 'px-2 sm:px-4 py-2 sm:py-4' : '',
        className
      )}
    >
      {children}
    </div>
  );
};

export default PageLayout;
