
import React from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';

interface QuickInfoProps {
  className?: string;
}

const QuickInfo: React.FC<QuickInfoProps> = ({ className }) => {
  const { theme } = useTheme();
  
  return (
    <div className={cn("bg-todo-purple/5 dark:bg-todo-purple/20 p-4 sm:p-6 rounded-xl border border-todo-purple/10 dark:border-todo-purple/30", className)}>
      <h3 className={cn(
        "font-medium mb-2",
        theme === 'light' 
          ? "text-todo-purple-dark" 
          : "text-todo-purple-light"
      )}>
        Your AI-Powered Assistant
      </h3>
      <p className="text-sm text-muted-foreground dark:text-gray-300 mb-4">
        ToDo helps you scan, organize, and manage everything in your life. 
        Use the camera to scan items, documents, or receipts, and let AI do the rest.
      </p>
      <div className="flex justify-center">
        <a 
          href="/troubleshoot" 
          className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-todo-purple/10 hover:bg-todo-purple/20 transition-colors text-todo-purple min-h-[44px] touch-manipulation"
        >
          <HelpCircle className="h-4 w-4" />
          Need help? Visit our troubleshooting page
        </a>
      </div>
    </div>
  );
};

export default QuickInfo;
