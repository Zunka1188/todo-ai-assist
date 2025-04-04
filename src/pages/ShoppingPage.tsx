
import React, { useRef } from 'react';
import { ArrowLeft, ShoppingBag, Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppHeader from '@/components/layout/AppHeader';
import ShoppingList from '@/components/features/shopping/ShoppingList';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/hooks/use-theme';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const ShoppingPage = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const { theme } = useTheme();
  const contentRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="space-y-4 py-4 h-full flex flex-col">
      <div className="flex items-center mb-2">
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
          title="Shopping" 
          subtitle="Track what you need to buy"
          icon={<ShoppingBag className="h-5 w-5 text-todo-purple" />}
          className="py-0"
        />
      </div>

      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search items..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {!isMobile && <ThemeToggle />}
      </div>

      <Separator className="my-2" />
      
      <div className="flex-1 overflow-hidden">
        <ShoppingList searchTerm={searchTerm} />
      </div>
    </div>
  );
};

export default ShoppingPage;
