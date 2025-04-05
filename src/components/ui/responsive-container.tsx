
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  mobileClassName?: string;
  desktopClassName?: string;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  as: Component = 'div',
  mobileClassName,
  desktopClassName,
}) => {
  const { isMobile } = useIsMobile();
  
  return (
    <Component
      className={cn(
        className,
        isMobile ? mobileClassName : desktopClassName
      )}
    >
      {children}
    </Component>
  );
};

export default ResponsiveContainer;
