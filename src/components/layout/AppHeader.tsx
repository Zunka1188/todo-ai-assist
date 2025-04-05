
import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, subtitle, icon, className, actions }) => {
  const { theme } = useTheme();
  const { isMobile } = useIsMobile();
  
  return (
    <header className={cn(
      "flex flex-col space-y-1",
      isMobile ? "mb-3" : "mb-4", 
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <div className="flex items-center justify-center">{icon}</div>}
          <h1 className={cn(
            isMobile ? "text-[20px] font-bold" : "text-2xl font-bold sm:text-3xl", // 20px for mobile headings
            theme === 'light' ? "text-foreground" : "text-white"
          )}>
            {title}
          </h1>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {subtitle && (
        <p className={cn(
          "text-muted-foreground",
          isMobile ? "text-[14px]" : "text-sm sm:text-base" // 14px for mobile body text
        )}>
          {subtitle}
        </p>
      )}
    </header>
  );
};

export default AppHeader;
