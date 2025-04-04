
import React, { useRef, useState } from 'react';
import { ArrowLeft, ShoppingBag, Search, Plus, FileText, Image, ListFilter } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define the tab types
type ShoppingTab = 'all' | 'text' | 'image';

const ShoppingPage = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const { theme } = useTheme();
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ShoppingTab>('all');

  const goBack = () => {
    navigate('/');
  };

  const handleAddItem = (item: { 
    name: string, 
    category: string, 
    notes?: string, 
    amount?: string, 
    dateToPurchase?: string, 
    price?: string, 
    file?: string | null,
    fileName?: string,
    fileType?: string
  }) => {
    // In a real app, this would add the item to a database
    console.log('Adding item:', item);
    
    toast({
      title: "Item Added",
      description: `"${item.name}" has been added to your shopping list`,
      variant: "default",
    });
    
    // Determine if the item has a file to update the appropriate tab
    if (item.file) {
      // If we're in text mode but adding an item with file, switch to all view
      if (activeTab === 'text') {
        setActiveTab('all');
      }
    } else {
      // If we're in image mode but adding a text item, switch to all view
      if (activeTab === 'image') {
        setActiveTab('all');
      }
    }
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
          className="bg-green-500 hover:bg-green-600 text-white gap-2 h-10 sm:w-auto w-full flex justify-center items-center"
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
      
      {/* Tab Navigation - similar to Calendar page */}
      <div className="mb-4">
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as ShoppingTab)} 
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="image">Image</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0 pt-4">
            <ShoppingList 
              searchTerm={searchTerm} 
              filterMode="all"
            />
          </TabsContent>
          
          <TabsContent value="text" className="mt-0 pt-4">
            <ShoppingList 
              searchTerm={searchTerm} 
              filterMode="text"
            />
          </TabsContent>
          
          <TabsContent value="image" className="mt-0 pt-4">
            <ShoppingList 
              searchTerm={searchTerm} 
              filterMode="image"
            />
          </TabsContent>
        </Tabs>
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
