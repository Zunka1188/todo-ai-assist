
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  fullHeight?: boolean;
  noPadding?: boolean;
  maxWidth?: "default" | "narrow" | "wide" | "full" | number;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className,
  fullHeight = false,
  noPadding = false,
  maxWidth = "default",
}) => {
  const { isMobile } = useIsMobile();
  
  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case "narrow": return "max-w-3xl";
      case "wide": return "max-w-7xl";
      case "full": return "max-w-none";
      case "default": return "max-w-5xl";
      default: return typeof maxWidth === 'number' ? `max-w-[${maxWidth}px]` : "max-w-5xl";
    }
  };
  
  return (
    <div 
      className={cn(
        'w-full mx-auto',
        getMaxWidthClass(),
        fullHeight ? 'h-full' : '',
        !noPadding ? isMobile ? 'px-3 py-2' : 'px-4 py-4' : '',
        className
      )}
    >
      {children}
    </div>
  );
};

export default PageLayout;
