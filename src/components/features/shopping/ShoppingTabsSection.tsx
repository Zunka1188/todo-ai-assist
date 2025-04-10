
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ShoppingList from './ShoppingList';

interface ShoppingTabsSectionProps {
  activeTab: string;
  handleTabChange: (value: string) => void;
  searchTerm: string;
  onEditItem?: (id: string, name?: string, item?: any) => void;
  readOnly?: boolean;
}

const ShoppingTabsSection: React.FC<ShoppingTabsSectionProps> = ({ 
  activeTab, 
  handleTabChange,
  searchTerm,
  onEditItem,
  readOnly = false
}) => {
  return (
    <div className="flex-grow flex flex-col">
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="flex-grow flex flex-col">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="one-off">One-off</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        
        <TabsContent value="one-off" className="flex-grow">
          <ShoppingList 
            searchTerm={searchTerm} 
            filterMode="one-off"
            onEditItem={onEditItem}
            readOnly={readOnly}
          />
        </TabsContent>
        
        <TabsContent value="weekly" className="flex-grow">
          <ShoppingList 
            searchTerm={searchTerm} 
            filterMode="weekly"
            onEditItem={onEditItem}
            readOnly={readOnly}
          />
        </TabsContent>
        
        <TabsContent value="monthly" className="flex-grow">
          <ShoppingList 
            searchTerm={searchTerm} 
            filterMode="monthly"
            onEditItem={onEditItem}
            readOnly={readOnly}
          />
        </TabsContent>
        
        <TabsContent value="all" className="flex-grow">
          <ShoppingList 
            searchTerm={searchTerm} 
            filterMode="all"
            onEditItem={onEditItem}
            readOnly={readOnly}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShoppingTabsSection;
