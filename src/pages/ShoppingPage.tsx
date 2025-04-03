
import React from 'react';
import AppHeader from '@/components/layout/AppHeader';
import ShoppingList from '@/components/features/shopping/ShoppingList';

const ShoppingPage = () => {
  return (
    <div className="space-y-6 py-4">
      <AppHeader 
        title="Shopping List" 
        subtitle="Track items you need to buy"
      />
      <ShoppingList />
    </div>
  );
};

export default ShoppingPage;
