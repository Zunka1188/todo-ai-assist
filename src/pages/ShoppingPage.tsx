
import React, { useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AppHeader from '@/components/layout/AppHeader';
import ShoppingList from '@/components/features/shopping/ShoppingList';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/hooks/use-theme';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const ShoppingPage = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const { theme } = useTheme();
  const contentRef = useRef<HTMLDivElement>(null);

  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="flex h-screen">
      <div 
        ref={contentRef}
        className="flex flex-col pb-20 sm:pb-0 py-1 sm:py-4 px-2 sm:px-6 md:px-8 container mx-auto max-w-4xl overflow-y-auto hide-scrollbar smooth-scroll"
      >
        <div className="flex items-center justify-between mb-1 md:mb-4 sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-2">
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
              className="py-0"
            />
          </div>
          {!isMobile && <ThemeToggle />}
        </div>
        <div className="w-full flex-1 mt-2">
          <ShoppingList />
        </div>
      </div>
    </div>
  );
};

export default ShoppingPage;

// Need to import cn
import { cn } from '@/lib/utils';
