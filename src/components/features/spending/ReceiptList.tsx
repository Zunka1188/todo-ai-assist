
import React, { useState } from 'react';
import { Receipt, ShoppingBag, Plane, Tag, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface ReceiptItem {
  id: string;
  name: string;
  category: 'Groceries' | 'Travel' | 'Fashion' | 'Other';
  amount: number;
  date: Date;
}

// Sample receipts data
const initialReceipts: ReceiptItem[] = [
  {
    id: '1',
    name: 'Grocery Store',
    category: 'Groceries',
    amount: 67.89,
    date: new Date(2025, 3, 1)
  },
  {
    id: '2',
    name: 'Airline Ticket',
    category: 'Travel',
    amount: 328.45,
    date: new Date(2025, 2, 28)
  },
  {
    id: '3',
    name: 'Department Store',
    category: 'Fashion',
    amount: 124.99,
    date: new Date(2025, 3, 2)
  },
  {
    id: '4',
    name: 'Electronics Shop',
    category: 'Other',
    amount: 89.95,
    date: new Date(2025, 3, 3)
  }
];

const categories = [
  'All',
  'Groceries',
  'Travel',
  'Fashion',
  'Other'
];

const ReceiptList: React.FC = () => {
  const [receipts] = useState<ReceiptItem[]>(initialReceipts);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReceipts = receipts
    .filter(receipt => 
      receipt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(receipt => 
      selectedCategory === 'All' || receipt.category === selectedCategory
    )
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Groceries':
        return <ShoppingBag className="text-green-500" size={20} />;
      case 'Travel':
        return <Plane className="text-blue-500" size={20} />;
      case 'Fashion':
        return <Tag className="text-pink-500" size={20} />;
      default:
        return <Receipt className="text-todo-purple" size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search receipts..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              "py-1.5 px-3 rounded-full text-sm whitespace-nowrap",
              selectedCategory === category
                ? "bg-todo-purple text-white"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredReceipts.map((receipt) => (
          <div
            key={receipt.id}
            className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="bg-todo-purple bg-opacity-10 p-2 rounded-lg mr-3">
              {getCategoryIcon(receipt.category)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-todo-black truncate">
                {receipt.name}
              </h4>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <span className="truncate">
                  {receipt.date.toLocaleDateString()}
                </span>
                <span className="mx-1.5">•</span>
                <span className="bg-secondary/50 px-2 py-0.5 rounded-full truncate">
                  {receipt.category}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-medium">${receipt.amount.toFixed(2)}</span>
            </div>
          </div>
        ))}

        {filteredReceipts.length === 0 && (
          <div className="text-center py-8">
            <Receipt className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No receipts found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Scan or upload receipts to track your spending
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptList;
