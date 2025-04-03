
import React from 'react';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, subtitle, className }) => {
  return (
    <header className={cn("flex flex-col space-y-1 py-6", className)}>
      <h1 className="text-2xl font-bold text-todo-black">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm text-muted-foreground">
          {subtitle}
        </p>
      )}
    </header>
  );
};

export default AppHeader;
