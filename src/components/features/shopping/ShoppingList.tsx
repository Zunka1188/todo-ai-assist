
import React, { useState } from 'react';
import { 
  Check, 
  Plus,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ShoppingItem {
  id: string;
  name: string;
  completed: boolean;
  category: string;
}

const categories = [
  "Groceries",
  "Household",
  "Electronics",
  "Clothing",
  "Other"
];

const initialItems: ShoppingItem[] = [
  { id: '1', name: 'Dish Soap', completed: false, category: 'Household' },
  { id: '2', name: 'Apples', completed: false, category: 'Groceries' },
  { id: '3', name: 'Bread', completed: false, category: 'Groceries' },
  { id: '4', name: 'Toothpaste', completed: false, category: 'Household' },
];

const ShoppingList: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>(initialItems);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Groceries');
  const [activeCategory, setActiveCategory] = useState('All');

  const addItem = () => {
    if (newItemName.trim() === '') return;
    
    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: newItemName,
      completed: false,
      category: newItemCategory,
    };
    
    setItems([...items, newItem]);
    setNewItemName('');
  };

  const toggleItem = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const filteredItems = activeCategory === 'All' 
    ? items 
    : items.filter(item => item.category === activeCategory);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveCategory('All')}
          className={cn(
            "rounded-full",
            activeCategory === 'All' && "bg-todo-purple text-white hover:bg-todo-purple-dark"
          )}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant="outline"
            size="sm"
            onClick={() => setActiveCategory(category)}
            className={cn(
              "rounded-full",
              activeCategory === category && "bg-todo-purple text-white hover:bg-todo-purple-dark"
            )}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="flex space-x-2">
        <Input
          placeholder="Add new item..."
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="flex-1"
          onKeyPress={(e) => {
            if (e.key === 'Enter') addItem();
          }}
        />
        <select
          value={newItemCategory}
          onChange={(e) => setNewItemCategory(e.target.value)}
          className="rounded-md border border-input bg-background px-3"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <Button onClick={addItem} className="bg-todo-purple hover:bg-todo-purple-dark">
          <Plus size={18} />
        </Button>
      </div>

      <ul className="space-y-2">
        {filteredItems.map((item) => (
          <li 
            key={item.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border transition-colors",
              item.completed 
                ? "bg-muted border-muted" 
                : "bg-card border-border"
            )}
          >
            <div className="flex items-center space-x-3">
              <button
                onClick={() => toggleItem(item.id)}
                className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full border",
                  item.completed 
                    ? "bg-todo-purple border-todo-purple text-white" 
                    : "border-gray-300"
                )}
              >
                {item.completed && <Check size={14} />}
              </button>
              <span className={cn(
                item.completed && "line-through text-muted-foreground"
              )}>
                {item.name}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                {item.category}
              </span>
              <button
                onClick={() => removeItem(item.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ShoppingList;
