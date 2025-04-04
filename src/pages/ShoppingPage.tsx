
import React, { useRef, useState } from 'react';
import { ArrowLeft, ShoppingBag, Search, Plus, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppHeader from '@/components/layout/AppHeader';
import ShoppingList from '@/components/features/shopping/ShoppingList';
import AddItemDialog from '@/components/features/shopping/AddItemDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

const ShoppingPage = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const { theme } = useTheme();
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const goBack = () => {
    navigate('/');
  };

  const handleAddItem = (item: { name: string, category: string, image?: string | null }) => {
    // In a real app, this would add the item to a database
    console.log('Adding item:', item);
    
    toast({
      title: "Item Added",
      description: `"${item.name}" has been added to your shopping list`,
      variant: "default",
    });
    
    // The ShoppingList component would need to be updated to handle new items
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-4 py-2 sm:py-4">
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

      <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 my-3">
        <Button 
          className="bg-primary text-white hover:bg-primary/90 gap-2 h-10 sm:w-auto w-full flex justify-center items-center"
          size={isMobile ? "default" : "sm"}
          onClick={() => setAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Add Item</span>
        </Button>
        
        <div className="relative w-full sm:w-auto sm:max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search items..."
            className="pl-8 h-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Separator className="my-2" />
      
      <div className="flex-1 overflow-hidden mt-2">
        <ShoppingList searchTerm={searchTerm} />
      </div>
      
      <AddItemDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
        onSave={handleAddItem}
      />
    </div>
  );
};

export default ShoppingPage;
