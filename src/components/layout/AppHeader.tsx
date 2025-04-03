
import React from 'react';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, subtitle, className }) => {
  return (
    <header className={cn("flex flex-col space-y-1 py-4", className)}>
      <h1 className="text-[28px] font-bold text-todo-black sm:text-[32px] md:text-[36px]">
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
