
import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';

interface HomeHeaderProps {
  className?: string;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ className }) => {
  const { theme } = useTheme();
  
  return (
    <div className={cn("text-center space-y-2", className)}>
      <h1 className={cn(
        "text-3xl font-bold",
        theme === 'light' ? "text-foreground" : "text-white"
      )}>ToDo</h1>
      <p className="text-muted-foreground dark:text-gray-300">Your All-in-One AI-Powered Assistant</p>
    </div>
  );
};

export default HomeHeader;
