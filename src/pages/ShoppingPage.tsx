
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AppHeader from '@/components/layout/AppHeader';
import ShoppingList from '@/components/features/shopping/ShoppingList';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const ShoppingPage = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();

  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="space-y-3 py-1 sm:py-4 px-2 sm:px-6 md:px-8 container mx-auto max-w-4xl">
      <div className="flex items-center justify-between mb-1 md:mb-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={goBack} 
            className="mr-2 md:mr-3"
            aria-label="Go back to home"
          >
            <ArrowLeft className="h-4 w-4 md:h-6 md:w-6" />
          </Button>
          <AppHeader 
            title="Shopping" 
            subtitle="Track items you need to buy"
            className="py-0"
          />
        </div>
        {!isMobile && <ThemeToggle />}
      </div>
      <ShoppingList />
    </div>
  );
};

export default ShoppingPage;
