
import React, { useRef } from 'react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AppHeader from '@/components/layout/AppHeader';
import ShoppingList from '@/components/features/shopping/ShoppingList';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/hooks/use-theme';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';

const ShoppingPage = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const { theme } = useTheme();
  const contentRef = useRef<HTMLDivElement>(null);

  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col h-screen">
      <div 
        ref={contentRef}
        className="flex-1 container max-w-5xl mx-auto px-4 sm:px-6 py-4 overflow-y-auto hide-scrollbar"
      >
        <div className="flex items-center justify-between mb-4 sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-2">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={goBack} 
              className="mr-2 md:mr-3 h-9 w-9 md:h-10 md:w-10 hover:bg-secondary"
              aria-label="Go back to home"
            >
              <ArrowLeft className={cn(
                "h-4 w-4 md:h-5 md:w-5",
                theme === 'light' ? "text-foreground" : "text-foreground/90"
              )} />
            </Button>
            <AppHeader 
              title="Shopping" 
              subtitle="Track what you need to buy"
              icon={<ShoppingBag className="h-5 w-5 text-todo-purple" />}
              className="py-0"
            />
          </div>
          {!isMobile && <ThemeToggle />}
        </div>
        <div className="w-full mt-4 pb-16 sm:pb-4">
          <ShoppingList />
        </div>
      </div>
    </div>
  );
};

export default ShoppingPage;
