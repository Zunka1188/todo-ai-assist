
import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, Search, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
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

// Updated tab types to include the "one-off" option
type ShoppingTab = 'one-off' | 'weekly' | 'monthly' | 'all';

// Interface for shopping item data
interface ItemData {
  id?: string;
  name: string;
  notes?: string;
  amount?: string;
  file?: string | null;
  fileName?: string;
  fileType?: string;
  repeatOption?: 'none' | 'weekly' | 'monthly';
}

const ShoppingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useIsMobile();
  const { theme } = useTheme();
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ShoppingTab>('all'); // Start with 'all' tab
  const [editItem, setEditItem] = useState<ItemData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Check URL search params for tab selection
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['one-off', 'weekly', 'monthly', 'all'].includes(tabParam)) {
      setActiveTab(tabParam as ShoppingTab);
    } else if (!activeTab) {
      setActiveTab('all');
    }
  }, [location.search]);

  const goBack = () => {
    navigate('/');
  };

  const handleAddItem = (item: ItemData) => {
    // In a real app, this would add the item to a database
    console.log('Adding/Editing item:', item);
    
    if (isEditing) {
      toast({
        title: "Item Updated",
        description: `"${item.name}" has been updated`,
        variant: "default",
      });
    } else {
      toast({
        title: "Item Added",
        description: `"${item.name}" has been added to your shopping list`,
        variant: "default",
      });
    }
    
    // Update tab based on repeat option
    if (item.repeatOption === 'weekly') {
      setActiveTab('weekly');
    } else if (item.repeatOption === 'monthly') {
      setActiveTab('monthly');
    } else {
      setActiveTab('one-off');
    }
    
    // Reset editing state
    setIsEditing(false);
    setEditItem(null);
  };

  const handleEditItem = (id: string, itemName?: string, item?: any) => {
    // Update to use the actual item data passed from the ShoppingList component
    // instead of creating mock data
    if (item) {
      const itemToEdit: ItemData = {
        id,
        name: item.name,
        notes: item.notes || '',
        amount: item.amount || '',
        file: item.imageUrl || null,
        fileName: '',
        fileType: '',
        repeatOption: item.repeatOption || 'none',
      };
      
      setEditItem(itemToEdit);
      setIsEditing(true);
      setAddDialogOpen(true);
    } else {
      // Fallback to mock data if no item object is provided (backward compatibility)
      const mockItem = {
        id,
        name: itemName || `Item ${id}`,
        notes: `Some notes for item ${id}`,
        amount: '1',
        file: null,
        fileName: '',
        fileType: '',
        repeatOption: 'none' as const,
      };
      
      setEditItem(mockItem);
      setIsEditing(true);
      setAddDialogOpen(true);
    }
  };

  // Update URL when active tab changes
  const handleTabChange = (value: string) => {
    const newTab = value as ShoppingTab;
    setActiveTab(newTab);
    
    // Update URL with tab parameter for better navigation
    const params = new URLSearchParams(location.search);
    params.set('tab', newTab);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
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
          className="gap-2 h-10 sm:w-auto w-full flex justify-center items-center"
          size={isMobile ? "default" : "sm"}
          onClick={() => {
            setIsEditing(false);
            setEditItem(null);
            setAddDialogOpen(true);
          }}
          variant="purple" // Using the purple variant
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
      
      {/* Updated Tab Navigation - One-off, Weekly, Monthly, All */}
      <div className="mb-4">
        <Tabs 
          defaultValue={activeTab} 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="one-off">One-off</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value="one-off" className="mt-0 pt-4">
            <ShoppingList 
              searchTerm={searchTerm} 
              filterMode="one-off"
              onEditItem={handleEditItem}
            />
          </TabsContent>
          
          <TabsContent value="weekly" className="mt-0 pt-4">
            <ShoppingList 
              searchTerm={searchTerm} 
              filterMode="weekly"
              onEditItem={handleEditItem}
            />
          </TabsContent>
          
          <TabsContent value="monthly" className="mt-0 pt-4">
            <ShoppingList 
              searchTerm={searchTerm} 
              filterMode="monthly"
              onEditItem={handleEditItem}
            />
          </TabsContent>
          
          <TabsContent value="all" className="mt-0 pt-4">
            <ShoppingList 
              searchTerm={searchTerm} 
              filterMode="all"
              onEditItem={handleEditItem}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <AddItemDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
        onSave={handleAddItem}
        editItem={editItem}
        isEditing={isEditing}
      />
    </div>
  );
};

export default ShoppingPage;
