
import React from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/page-header';
import { useToast } from '@/components/ui/use-toast';

interface ShoppingPageHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddItem: () => void;
  onOpenInviteDialog: () => void;
  showAddButton: boolean;
}

const ShoppingPageHeader: React.FC<ShoppingPageHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onAddItem,
  onOpenInviteDialog,
  showAddButton
}) => {
  return (
    <PageHeader 
      title="Shopping List"
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      onAddItem={onAddItem}
      addItemLabel="Add Item"
      showAddButton={showAddButton}
      rightContent={
        <Button
          onClick={onOpenInviteDialog}
          variant="ghost"
          size="icon"
          className="mr-2"
          aria-label="Share shopping list"
        >
          <Users className="h-5 w-5" />
        </Button>
      }
      className="px-0" // Remove any padding from the header itself
    />
  );
};

export default ShoppingPageHeader;
