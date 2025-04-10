
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Check, ShoppingCart } from 'lucide-react';

interface DirectAddItemProps {
  onSave: (item: any) => boolean | void;
  readOnly: boolean;
}

/**
 * A test component to directly add items to the shopping list
 * This bypasses the dialog UI to help debug issues with item addition
 */
const DirectAddItem = ({ onSave, readOnly }: DirectAddItemProps) => {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [lastAddedStatus, setLastAddedStatus] = useState<{success: boolean, time: string} | null>(null);
  
  const handleAddItem = (repeatOption: 'none' | 'weekly' | 'monthly') => {
    if (readOnly) {
      toast({
        title: "Read-only Mode",
        description: "You don't have permission to add items in this shared list.",
        variant: "destructive",
      });
      return;
    }
    
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
        completed: false // Added the missing 'completed' property
      };
      
      console.log("[DEBUG] DirectAddItem - Adding test item:", JSON.stringify(newItem, null, 2));
      
      // Use the provided onSave function
      const result = onSave(newItem);
      
      console.log("[DEBUG] DirectAddItem - Test item save result:", result);
      
      setLastAddedStatus({success: true, time: new Date().toLocaleTimeString()});
      
      toast({
        title: "Test Item Added",
        description: `${newItem.name} (${repeatOption}) has been added.`,
      });
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

  // Always return null to hide this component
  return null;
};

export default DirectAddItem;
