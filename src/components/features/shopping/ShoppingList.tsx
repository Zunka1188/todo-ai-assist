
import React, { useState, useRef, useEffect } from 'react';
import { 
  Check, 
  Plus,
  X,
  ChevronDown,
  Calendar,
  Tag,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  CircleCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';

interface ShoppingItem {
  id: string;
  name: string;
  completed: boolean;
  category: string;
  amount?: string;
  dateToPurchase?: string;
  price?: string;
  dateAdded: Date;
}

type SortOption = 'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc' | 'priceAsc' | 'priceDesc' | 'newest' | 'oldest';

const defaultCategories = [
  "Groceries",
  "Household",
  "Electronics",
  "Clothing",
  "Other"
];

const initialItems: ShoppingItem[] = [
  { id: '1', name: 'Dish Soap', completed: false, category: 'Household', dateAdded: new Date('2023-04-01') },
  { id: '2', name: 'Apples', completed: false, category: 'Groceries', dateAdded: new Date('2023-04-02') },
  { id: '3', name: 'Bread', completed: false, category: 'Groceries', dateAdded: new Date('2023-04-02') },
  { id: '4', name: 'Toothpaste', completed: false, category: 'Household', dateAdded: new Date('2023-04-03') },
];

const ShoppingList: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>(initialItems);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Groceries');
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [newCategory, setNewCategory] = useState('');
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [showDetailedEntry, setShowDetailedEntry] = useState(false);
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemDate, setNewItemDate] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [isMultiSelectActive, setIsMultiSelectActive] = useState(false);
  const { isMobile } = useIsMobile();
  const carouselRef = useRef(null);

  const addItem = () => {
    if (newItemName.trim() === '') return;
    
    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: newItemName,
      completed: false,
      category: newItemCategory,
      amount: newItemAmount || undefined,
      dateToPurchase: newItemDate || undefined,
      price: newItemPrice || undefined,
      dateAdded: new Date(),
    };
    
    setItems([...items, newItem]);
    setNewItemName('');
    setNewItemAmount('');
    setNewItemDate('');
    setNewItemPrice('');
    
    if (!showDetailedEntry) {
      setShowDetailedEntry(false);
    }
  };

  const toggleItem = (id: string) => {
    if (isMultiSelectActive) {
      handleItemSelect(id);
      return;
    }
    
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };
  
  const addCategory = () => {
    if (newCategory.trim() === '' || categories.includes(newCategory.trim())) {
      return;
    }
    
    setCategories([...categories, newCategory.trim()]);
    setNewCategory('');
    setIsAddCategoryDialogOpen(false);
  };
  
  const handleItemSelect = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };
  
  const deleteSelectedItems = () => {
    setItems(items.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
    setIsMultiSelectActive(false);
  };
  
  const handleSort = (option: SortOption) => {
    setSortOption(option);
  };
  
  const getSortedItems = () => {
    const filteredItems = activeCategory === 'All' 
      ? items 
      : items.filter(item => item.category === activeCategory);
      
    return filteredItems.sort((a, b) => {
      switch (sortOption) {
        case 'nameAsc':
          return a.name.localeCompare(b.name);
        case 'nameDesc':
          return b.name.localeCompare(a.name);
        case 'dateAsc':
          if (!a.dateToPurchase && !b.dateToPurchase) return 0;
          if (!a.dateToPurchase) return 1;
          if (!b.dateToPurchase) return -1;
          return new Date(a.dateToPurchase).getTime() - new Date(b.dateToPurchase).getTime();
        case 'dateDesc':
          if (!a.dateToPurchase && !b.dateToPurchase) return 0;
          if (!a.dateToPurchase) return 1;
          if (!b.dateToPurchase) return -1;
          return new Date(b.dateToPurchase).getTime() - new Date(a.dateToPurchase).getTime();
        case 'priceAsc':
          if (!a.price && !b.price) return 0;
          if (!a.price) return 1;
          if (!b.price) return -1;
          return parseFloat(a.price) - parseFloat(b.price);
        case 'priceDesc':
          if (!a.price && !b.price) return 0;
          if (!a.price) return 1;
          if (!b.price) return -1;
          return parseFloat(b.price) - parseFloat(a.price);
        case 'newest':
          return b.dateAdded.getTime() - a.dateAdded.getTime();
        case 'oldest':
          return a.dateAdded.getTime() - b.dateAdded.getTime();
        default:
          return 0;
      }
    });
  };
  
  const sortedItems = getSortedItems();
  const allCategories = ['All', ...categories];

  // Scroll to active category when it changes
  useEffect(() => {
    // This would be handled by the carousel API in a real implementation
  }, [activeCategory]);

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 pt-2 pb-4 bg-background">
        <div className="mb-4">
          <Carousel
            className="w-full"
            opts={{
              align: "start",
              loop: false,
            }}
          >
            <CarouselContent className="-ml-1">
              {allCategories.map((category) => (
                <CarouselItem key={category} className="pl-1 basis-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveCategory(category)}
                    className={cn(
                      "rounded-full whitespace-nowrap h-9",
                      activeCategory === category && "bg-todo-purple text-white hover:bg-todo-purple-dark"
                    )}
                  >
                    {category}
                  </Button>
                </CarouselItem>
              ))}
              <CarouselItem className="pl-1 basis-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddCategoryDialogOpen(true)}
                  className="rounded-full whitespace-nowrap h-9"
                >
                  <Plus size={16} className="mr-1" /> New Category
                </Button>
              </CarouselItem>
            </CarouselContent>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-background to-transparent w-12 h-9 pointer-events-none" />
            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8" />
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8" />
          </Carousel>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex space-x-2">
            <Input
              placeholder="Add new item..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !showDetailedEntry) addItem();
              }}
            />
            <Button 
              variant="outline" 
              onClick={() => setShowDetailedEntry(!showDetailedEntry)}
              className="min-w-[44px]"
              aria-label={showDetailedEntry ? "Hide details" : "Show details"}
            >
              <MoreHorizontal size={18} />
            </Button>
            <Button 
              onClick={addItem} 
              className="bg-todo-purple hover:bg-todo-purple-dark text-white min-w-[44px]"
              aria-label="Add item"
            >
              <Plus size={18} />
            </Button>
          </div>
          
          {showDetailedEntry && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex space-x-2">
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white flex-1"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-2">
                <Input
                  placeholder="Amount (optional)"
                  value={newItemAmount}
                  onChange={(e) => setNewItemAmount(e.target.value)}
                  className="flex-1"
                />
              </div>
              <div className="flex space-x-2">
                <Input
                  type="date"
                  placeholder="Date to purchase"
                  value={newItemDate}
                  onChange={(e) => setNewItemDate(e.target.value)}
                  className="flex-1"
                />
              </div>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Price (optional)"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsMultiSelectActive(!isMultiSelectActive)}
            className={cn(
              isMultiSelectActive && "bg-accent"
            )}
          >
            <Checkbox checked={isMultiSelectActive} className="mr-1" /> 
            Select
          </Button>
          
          {isMultiSelectActive && selectedItems.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={deleteSelectedItems}
            >
              Delete Selected ({selectedItems.length})
            </Button>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <SortAsc size={16} className="mr-1" /> Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleSort('nameAsc')}>
              Name (A-Z)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('nameDesc')}>
              Name (Z-A)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('dateAsc')}>
              Date (Earliest First)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('dateDesc')}>
              Date (Latest First)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('priceAsc')}>
              Price (Low to High)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('priceDesc')}>
              Price (High to Low)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('newest')}>
              Recently Added
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('oldest')}>
              Oldest Added
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollArea className="h-[calc(100vh-350px)] pr-4">
        <ul className="space-y-2">
          {sortedItems.length === 0 ? (
            <li className="text-center py-6 text-muted-foreground">
              No items in this category. Add some new items!
            </li>
          ) : (
            sortedItems.map((item) => (
              <li 
                key={item.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-colors",
                  item.completed 
                    ? "bg-muted border-muted" 
                    : "bg-card border-border dark:bg-gray-800 dark:border-gray-700"
                )}
              >
                <div className="flex items-center space-x-3">
                  {isMultiSelectActive ? (
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => handleItemSelect(item.id)}
                    />
                  ) : (
                    <button
                      onClick={() => toggleItem(item.id)}
                      className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-full border min-h-[44px] min-w-[44px]",
                        item.completed 
                          ? "bg-todo-purple border-todo-purple text-white" 
                          : "border-gray-300 dark:border-gray-500"
                      )}
                    >
                      {item.completed && <Check size={14} />}
                    </button>
                  )}
                  
                  <div className="flex flex-col">
                    <span className={cn(
                      "dark:text-white",
                      item.completed && "line-through text-muted-foreground"
                    )}>
                      {item.name}
                    </span>
                    
                    <div className="flex flex-wrap items-center text-xs text-muted-foreground mt-1 gap-2">
                      {item.amount && (
                        <span>Qty: {item.amount}</span>
                      )}
                      
                      {item.price && (
                        <span>Price: ${item.price}</span>
                      )}
                      
                      {item.dateToPurchase && (
                        <span className="flex items-center">
                          <Calendar size={12} className="mr-1" /> 
                          {new Date(item.dateToPurchase).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground dark:bg-gray-700 dark:text-gray-100">
                    {item.category}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={`Remove ${item.name}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </ScrollArea>

      <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full"
              onKeyPress={(e) => {
                if (e.key === 'Enter') addCategory();
              }}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={addCategory}>Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShoppingList;
