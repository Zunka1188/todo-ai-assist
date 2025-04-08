
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  mobileClassName?: string;
  desktopClassName?: string;
  fluid?: boolean;
  gap?: "none" | "sm" | "md" | "lg";
  direction?: "row" | "column";
  fullWidth?: boolean;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  as: Component = 'div',
  mobileClassName,
  desktopClassName,
  fluid = false,
  gap = "none",
  direction = "column",
  fullWidth = false,
}) => {
  const { isMobile } = useIsMobile();
  
  const gapClass = () => {
    switch (gap) {
      case "sm": return "gap-2";
      case "md": return "gap-4";
      case "lg": return "gap-6";
      default: return "";
    }
  };
  
  const directionClass = direction === "row" ? "flex-row" : "flex-col";
  
  return (
    <Component
      className={cn(
        (fluid || fullWidth) ? "w-full" : "",
        fullWidth ? "max-w-full" : "",
        gap !== "none" ? "flex" : "",
        gap !== "none" ? directionClass : "",
        gap !== "none" ? gapClass() : "",
        className,
        isMobile ? mobileClassName : desktopClassName
      )}
    >
      {children}
    </Component>
  );
};

export default ResponsiveContainer;
