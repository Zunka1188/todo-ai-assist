
import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, subtitle, className }) => {
  const { theme } = useTheme();
  
  return (
    <header className={cn("flex flex-col space-y-1 py-4", className)}>
      <h1 className={cn(
        "text-[28px] font-bold sm:text-[32px] md:text-[36px]",
        theme === 'light' 
          ? "text-todo-black" 
          : "text-white"
      )}>
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-muted-foreground sm:text-sm md:text-base">
          {subtitle}
        </p>
      )}
    </header>
  );
};

export default AppHeader;
