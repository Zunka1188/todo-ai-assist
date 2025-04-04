
import React, { useRef } from 'react';
import { ArrowLeft, ShoppingBag, Search, Plus, FileText } from 'lucide-react';
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
  const [activeCategory, setActiveCategory] = React.useState('All');

  const goBack = () => {
    navigate('/');
  };

  const categories = ['All', 'Groceries', 'Household', 'Personal', 'Other'];

  return (
    <div className="space-y-4 py-6 h-full flex flex-col max-w-[1200px] mx-auto px-4 sm:px-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goBack} 
          className="shrink-0"
          aria-label="Go back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <AppHeader 
            title="Shopping" 
            subtitle="Track what you need to buy"
            icon={<ShoppingBag className="h-6 w-6 text-primary" />}
            className="py-0"
          />
        </div>
      </div>

      <div className="flex justify-between items-center gap-4 mt-6 flex-wrap sm:flex-nowrap">
        <Button 
          className="bg-primary text-white hover:bg-primary/90 gap-2 h-10"
          size="sm"
        >
          <Plus className="h-5 w-5" />
          <span>Add Item</span>
        </Button>
        
        <div className="relative flex-1 max-w-md ml-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search items..."
            className="pl-8 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex space-x-2 overflow-x-auto scrollbar-none pb-2 mt-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            size="sm"
            className={cn(
              "rounded-full px-4 py-1 h-8 text-sm font-medium",
              activeCategory === category 
                ? "bg-primary text-white" 
                : "bg-secondary text-muted-foreground hover:bg-accent"
            )}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>
      
      <div className="flex-1 overflow-hidden mt-4">
        <ShoppingList searchTerm={searchTerm} />
      </div>
    </div>
  );
};

export default ShoppingPage;
