
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
    <div className="space-y-4 py-2 sm:py-4 px-4 sm:px-4 container mx-auto max-w-4xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={goBack} 
            className="mr-2"
            aria-label="Go back to home"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <AppHeader 
            title="Shopping List" 
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
