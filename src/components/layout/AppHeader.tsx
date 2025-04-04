
import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, subtitle, icon, className }) => {
  const { theme } = useTheme();
  
  return (
    <header className={cn("flex flex-col space-y-1", className)}>
      <div className="flex items-center gap-2">
        {icon && <div className="flex items-center justify-center">{icon}</div>}
        <h1 className={cn(
          "text-2xl font-bold sm:text-3xl",
          theme === 'light' 
            ? "text-todo-black" 
            : "text-white"
        )}>
          {title}
        </h1>
      </div>
      {subtitle && (
        <p className="text-sm text-muted-foreground sm:text-base">
          {subtitle}
        </p>
      )}
    </header>
  );
};

export default AppHeader;
