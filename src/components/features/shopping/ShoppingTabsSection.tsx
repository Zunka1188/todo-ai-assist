
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ShoppingList from './ShoppingList';

interface ShoppingTabsSectionProps {
  activeTab: string;
  handleTabChange: (value: string) => void;
  searchTerm: string;
  onEditItem: (id: string, name?: string, item?: any) => void;
  readOnly: boolean;
}

const ShoppingTabsSection: React.FC<ShoppingTabsSectionProps> = ({
  activeTab,
  handleTabChange,
  searchTerm,
  onEditItem,
  readOnly
}) => {
  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full shopping-tabs-container">
      <div className="mb-2">
        <TabsList className="w-full flex justify-around gap-1 px-0">
          <TabsTrigger value="one-off" className="flex-1 text-sm px-1 py-1.5 h-10">
            One-off
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex-1 text-sm px-1 py-1.5 h-10">
            Weekly
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex-1 text-sm px-1 py-1.5 h-10">
            Monthly
          </TabsTrigger>
          <TabsTrigger value="all" className="flex-1 text-sm px-1 py-1.5 h-10">
            All Items
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="one-off" className="mt-0 p-0">
        <div className="shopping-list-container">
          <ShoppingList 
            searchTerm={searchTerm}
            filterMode="one-off"
            onEditItem={onEditItem}
            readOnly={readOnly}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="weekly" className="mt-0 p-0">
        <div className="shopping-list-container">
          <ShoppingList 
            searchTerm={searchTerm}
            filterMode="weekly"
            onEditItem={onEditItem}
            readOnly={readOnly}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="monthly" className="mt-0 p-0">
        <div className="shopping-list-container">
          <ShoppingList 
            searchTerm={searchTerm}
            filterMode="monthly"
            onEditItem={onEditItem}
            readOnly={readOnly}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="all" className="mt-0 p-0">
        <div className="shopping-list-container">
          <ShoppingList 
            searchTerm={searchTerm}
            filterMode="all"
            onEditItem={onEditItem}
            readOnly={readOnly}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ShoppingTabsSection;
