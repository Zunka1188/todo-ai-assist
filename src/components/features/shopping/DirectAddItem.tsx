
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useShoppingItems } from './useShoppingItems';
import { useToast } from '@/components/ui/use-toast';

/**
 * A test component to directly add items to the shopping list
 * This bypasses the dialog UI to help debug issues with item addition
 */
const DirectAddItem = () => {
  const { addItem } = useShoppingItems('all', '');
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  
  const handleAddItem = (repeatOption: 'none' | 'weekly' | 'monthly') => {
    setIsAdding(true);
    
    try {
      console.log(`Directly adding test item with repeat: ${repeatOption}`);
      
      const timestamp = new Date().toLocaleTimeString();
      const newItem = {
        name: `Test Item ${timestamp}`,
        category: "Test",
        amount: '1', 
        price: "$9.99",
        imageUrl: null, 
        notes: `Test note for ${repeatOption} item`,
        repeatOption: repeatOption,
      };
      
      console.log("Adding test item:", newItem);
      
      const added = addItem(newItem);
      
      if (added) {
        console.log("Test item successfully added:", added);
        
        toast({
          title: "Test Item Added",
          description: `${newItem.name} (${repeatOption}) has been added.`,
        });
      } else {
        console.error("Failed to add test item");
        toast({
          title: "Error",
          description: "Failed to add test item",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in direct item addition:", error);
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
    <div className="fixed bottom-16 left-0 z-10 p-2 bg-background/50 backdrop-blur-sm rounded-r-md">
      <div className="flex flex-col gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => handleAddItem('none')} 
          disabled={isAdding}
          className="text-xs py-1 px-2"
        >
          Add One-Off
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => handleAddItem('weekly')} 
          disabled={isAdding}
          className="text-xs py-1 px-2"
        >
          Add Weekly
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => handleAddItem('monthly')} 
          disabled={isAdding}
          className="text-xs py-1 px-2"
        >
          Add Monthly
        </Button>
      </div>
    </div>
  );
};

export default DirectAddItem;
