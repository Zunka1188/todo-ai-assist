
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
  center?: boolean;
  justifyContent?: "start" | "end" | "center" | "between" | "around" | "evenly";
  noGutters?: boolean; // Removes horizontal padding
  contentAlign?: "left" | "center" | "right"; // New prop for horizontal text alignment
  fitContent?: boolean; // New prop to make container only as wide as its content
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
  center = false,
  justifyContent = "start",
  noGutters = false,
  contentAlign = "left",
  fitContent = false,
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
  
  const justifyContentClass = () => {
    switch (justifyContent) {
      case "start": return "justify-start";
      case "end": return "justify-end";
      case "center": return "justify-center";
      case "between": return "justify-between";
      case "around": return "justify-around";
      case "evenly": return "justify-evenly";
      default: return "";
    }
  };
  
  const contentAlignClass = () => {
    switch (contentAlign) {
      case "center": return "text-center";
      case "right": return "text-right";
      default: return "text-left";
    }
  };
  
  return (
    <Component
      className={cn(
        (fluid || fullWidth) ? "w-full" : "",
        fullWidth ? "max-w-full" : "",
        fitContent ? "w-fit" : "",
        gap !== "none" || center ? "flex" : "",
        gap !== "none" ? directionClass : "",
        gap !== "none" ? gapClass() : "",
        center ? "items-center" : "",
        center && direction === "row" ? justifyContentClass() : "",
        noGutters ? "px-0" : "",
        contentAlignClass(),
        className,
        isMobile ? mobileClassName : desktopClassName
      )}
    >
      {children}
    </Component>
  );
};

export default ResponsiveContainer;
