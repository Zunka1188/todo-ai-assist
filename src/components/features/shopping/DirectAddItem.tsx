
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useShoppingItems } from './useShoppingItems';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Check, ShoppingCart } from 'lucide-react';

/**
 * A test component to directly add items to the shopping list
 * This bypasses the dialog UI to help debug issues with item addition
 */
const DirectAddItem = () => {
  const { addItem } = useShoppingItems('all', '');
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [lastAddedStatus, setLastAddedStatus] = useState<{success: boolean, time: string} | null>(null);
  
  const handleAddItem = (repeatOption: 'none' | 'weekly' | 'monthly') => {
    setIsAdding(true);
    
    try {
      console.log(`[DEBUG] DirectAddItem - Adding test item with repeat: ${repeatOption}`);
      
      const timestamp = new Date().toLocaleTimeString();
      const newItem = {
        name: `Test Item ${timestamp}`,
        category: "Test",
        amount: '1', 
        price: "$9.99",
        imageUrl: null, 
        notes: `Test note for ${repeatOption} item`,
        repeatOption: repeatOption,
        completed: false // Explicitly set completed to false
      };
      
      console.log("[DEBUG] DirectAddItem - Adding test item:", JSON.stringify(newItem, null, 2));
      
      const added = addItem(newItem);
      
      if (added) {
        console.log("[DEBUG] DirectAddItem - Test item successfully added:", added);
        
        setLastAddedStatus({success: true, time: new Date().toLocaleTimeString()});
        
        toast({
          title: "Test Item Added",
          description: `${newItem.name} (${repeatOption}) has been added.`,
        });
      } else {
        console.error("[ERROR] DirectAddItem - Failed to add test item");
        setLastAddedStatus({success: false, time: new Date().toLocaleTimeString()});
        
        toast({
          title: "Error",
          description: "Failed to add test item",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("[ERROR] DirectAddItem - Error in direct item addition:", error);
      setLastAddedStatus({success: false, time: new Date().toLocaleTimeString()});
      
      toast({
        title: "Error",
        description: "Error testing item addition: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-0 z-10 p-2 bg-background/80 backdrop-blur-sm rounded-l-md shadow-md border border-primary/20">
      <div className="flex flex-col gap-2">
        <div className="text-xs text-center mb-1 font-medium">Quick Add Test</div>
        
        {lastAddedStatus && (
          <div className={`text-xs text-center p-1 rounded ${lastAddedStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {lastAddedStatus.success ? <Check className="h-3 w-3 inline mr-1" /> : <span className="inline mr-1">❌</span>}
            {lastAddedStatus.time}
          </div>
        )}
        
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => handleAddItem('none')} 
          disabled={isAdding}
          className="text-xs py-1 px-2 border-primary/50 flex items-center gap-1"
        >
          <ShoppingCart className="h-3 w-3" />
          One-Off
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => handleAddItem('weekly')} 
          disabled={isAdding}
          className="text-xs py-1 px-2 border-primary/50 flex items-center gap-1"
        >
          <Plus className="h-3 w-3" />
          Weekly
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => handleAddItem('monthly')} 
          disabled={isAdding}
          className="text-xs py-1 px-2 border-primary/50 flex items-center gap-1"
        >
          <Plus className="h-3 w-3" />
          Monthly
        </Button>
      </div>
    </div>
  );
};

export default DirectAddItem;
