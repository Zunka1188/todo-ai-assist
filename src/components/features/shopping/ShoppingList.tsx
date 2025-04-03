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
  ChevronRight,
  Trash2,
  Edit,
  MoreVertical,
  Image,
  Upload
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
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from "@/components/ui/use-toast";
import { AnimatePresence, motion } from "framer-motion";

interface ShoppingItem {
  id: string;
  name: string;
  completed: boolean;
  category: string;
  amount?: string;
  dateToPurchase?: string;
  price?: string;
  dateAdded: Date;
  imageUrl?: string;
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

const parseStoredItems = (items: any[]): ShoppingItem[] => {
  return items.map(item => ({
    ...item,
    dateAdded: new Date(item.dateAdded)
  }));
};

const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const storedValue = localStorage.getItem(key);
    if (!storedValue) return defaultValue;
    
    const parsedValue = JSON.parse(storedValue);
    
    if (key === 'shoppingItems' && Array.isArray(parsedValue)) {
      return parseStoredItems(parsedValue) as unknown as T;
    }
    
    return parsedValue;
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return defaultValue;
  }
};

const saveToLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

const ShoppingList: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>(() => 
    loadFromLocalStorage<ShoppingItem[]>('shoppingItems', initialItems)
  );
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Groceries');
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(() => 
    loadFromLocalStorage<string[]>('shoppingCategories', defaultCategories)
  );
  const [newCategory, setNewCategory] = useState('');
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [showDetailedEntry, setShowDetailedEntry] = useState(false);
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemDate, setNewItemDate] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [isMultiSelectActive, setIsMultiSelectActive] = useState(false);
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState('');
  const [isPurchasedSectionCollapsed, setIsPurchasedSectionCollapsed] = useState(false);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState('');
  const [editedCategoryName, setEditedCategoryName] = useState('');
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ShoppingItem | null>(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemCategory, setEditItemCategory] = useState('');
  const [editItemAmount, setEditItemAmount] = useState('');
  const [editItemDate, setEditItemDate] = useState('');
  const [editItemPrice, setEditItemPrice] = useState('');
  const [editItemImage, setEditItemImage] = useState<File | null>(null);
  const [editItemImageUrl, setEditItemImageUrl] = useState('');
  const [newItemImage, setNewItemImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { isMobile } = useIsMobile();
  const carouselRef = useRef(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newItemFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveToLocalStorage('shoppingItems', items);
  }, [items]);

  useEffect(() => {
    saveToLocalStorage('shoppingCategories', categories);
  }, [categories]);

  const handleEditItem = (item: ShoppingItem) => {
    setItemToEdit(item);
    setEditItemName(item.name);
    setEditItemCategory(item.category);
    setEditItemAmount(item.amount || '');
    setEditItemDate(item.dateToPurchase || '');
    setEditItemPrice(item.price || '');
    setEditItemImageUrl(item.imageUrl || '');
    setIsEditItemDialogOpen(true);
  };

  const saveEditedItem = () => {
    if (!itemToEdit || editItemName.trim() === '') return;

    let imageUrl = editItemImageUrl;

    if (editItemImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const newImageUrl = e.target.result as string;
          
          const updatedItems = items.map(item => 
            item.id === itemToEdit.id 
              ? { 
                  ...item, 
                  name: editItemName,
                  category: editItemCategory,
                  amount: editItemAmount || undefined,
                  dateToPurchase: editItemDate || undefined,
                  price: editItemPrice || undefined,
                  imageUrl: newImageUrl
                } 
              : item
          );
          
          setItems(updatedItems);
          setIsEditItemDialogOpen(false);
          
          toast({
            description: `Updated "${editItemName}"`,
          });
        }
      };
      reader.readAsDataURL(editItemImage);
    } else {
      const updatedItems = items.map(item => 
        item.id === itemToEdit.id 
          ? { 
              ...item, 
              name: editItemName,
              category: editItemCategory,
              amount: editItemAmount || undefined,
              dateToPurchase: editItemDate || undefined,
              price: editItemPrice || undefined,
              imageUrl: imageUrl
            } 
          : item
      );
      
      setItems(updatedItems);
      setIsEditItemDialogOpen(false);
      
      toast({
        description: `Updated "${editItemName}"`,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean = false) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (isNew) {
        setNewItemImage(file);
      } else {
        setEditItemImage(file);
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setEditItemImageUrl(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const addItem = () => {
    if (newItemName.trim() === '') return;
    
    const createNewItem = (imageUrl?: string) => {
      const newItem: ShoppingItem = {
        id: Date.now().toString(),
        name: newItemName,
        completed: false,
        category: newItemCategory,
        amount: newItemAmount || undefined,
        dateToPurchase: newItemDate || undefined,
        price: newItemPrice || undefined,
        imageUrl: imageUrl,
        dateAdded: new Date(),
      };
      
      setItems([...items, newItem]);
      setNewItemName('');
      setNewItemAmount('');
      setNewItemDate('');
      setNewItemPrice('');
      setNewItemImage(null);
      
      if (newItemFileInputRef.current) {
        newItemFileInputRef.current.value = '';
      }
      
      if (!showDetailedEntry) {
        setShowDetailedEntry(false);
      }

      toast({
        description: `Added ${newItem.name} to ${newItem.category}`,
      });

      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = 0;
        }
      }, 100);
    };

    if (newItemImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          createNewItem(e.target.result as string);
        }
      };
      reader.readAsDataURL(newItemImage);
    } else {
      createNewItem();
    }
  };

  const toggleItem = (id: string) => {
    if (isMultiSelectActive) {
      handleItemSelect(id);
      return;
    }
    
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    
    setItems(updatedItems);
    
    const item = items.find(item => item.id === id);
    if (item) {
      toast({
        description: item.completed 
          ? `Moved "${item.name}" to Not Purchased` 
          : `Moved "${item.name}" to Purchased`,
      });
    }
  };

  const removeItem = (id: string) => {
    const itemToRemove = items.find(item => item.id === id);
    setItems(items.filter((item) => item.id !== id));
    
    if (itemToRemove) {
      toast({
        description: `Removed ${itemToRemove.name}`,
      });
    }
  };
  
  const addCategory = () => {
    if (newCategory.trim() === '' || categories.includes(newCategory.trim())) {
      return;
    }
    
    const updatedCategories = [...categories, newCategory.trim()];
    setCategories(updatedCategories);
    setNewCategory('');
    setIsAddCategoryDialogOpen(false);
    setActiveCategory(newCategory.trim());
    
    toast({
      description: `Added category: ${newCategory.trim()}`,
    });
  };

  const handleDeleteCategory = (category: string) => {
    setCategoryToDelete(category);
    setIsDeleteCategoryDialogOpen(true);
  };
  
  const confirmDeleteCategory = () => {
    if (!categoryToDelete || categoryToDelete === 'All') return;
    
    const updatedItems = items.map(item => 
      item.category === categoryToDelete ? {...item, category: 'Other'} : item
    );
    
    const updatedCategories = categories.filter(c => c !== categoryToDelete);
    
    setItems(updatedItems);
    setCategories(updatedCategories);
    
    if (activeCategory === categoryToDelete) {
      setActiveCategory('All');
    }
    
    setIsDeleteCategoryDialogOpen(false);
    setCategoryToDelete('');
    
    toast({
      description: `Deleted category: ${categoryToDelete}. Items moved to "Other"`,
    });
  };
  
  const handleItemSelect = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };
  
  const deleteSelectedItems = () => {
    const count = selectedItems.length;
    setItems(items.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
    setIsMultiSelectActive(false);
    
    toast({
      description: `Deleted ${count} item${count !== 1 ? 's' : ''}`,
    });
  };
  
  const handleSort = (option: SortOption) => {
    setSortOption(option);
  };
  
  const getFilteredItems = () => {
    return activeCategory === 'All' 
      ? items 
      : items.filter(item => item.category === activeCategory);
  };
  
  const getSortedItems = (filteredItems: ShoppingItem[]) => {
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
  
  const togglePurchasedSection = () => {
    setIsPurchasedSectionCollapsed(!isPurchasedSectionCollapsed);
  };

  const handleEditCategory = (category: string) => {
    setCategoryToEdit(category);
    setEditedCategoryName(category);
    setIsEditCategoryDialogOpen(true);
  };

  const confirmEditCategory = () => {
    if (!categoryToEdit || categoryToEdit === 'All' || editedCategoryName.trim() === '') return;
    if (categories.includes(editedCategoryName.trim()) && editedCategoryName.trim() !== categoryToEdit) {
      toast({
        description: `Category "${editedCategoryName}" already exists.`,
      });
      return;
    }

    const updatedCategories = categories.map(c => 
      c === categoryToEdit ? editedCategoryName.trim() : c
    );
    
    const updatedItems = items.map(item => 
      item.category === categoryToEdit ? {...item, category: editedCategoryName.trim()} : item
    );
    
    if (activeCategory === categoryToEdit) {
      setActiveCategory(editedCategoryName.trim());
    }
    
    setCategories(updatedCategories);
    setItems(updatedItems);
    setIsEditCategoryDialogOpen(false);
    
    toast({
      description: `Updated category from "${categoryToEdit}" to "${editedCategoryName}"`,
    });
  };

  const handleImagePreview = (imageUrl: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    setPreviewImage(imageUrl);
  };

  const filteredItems = getFilteredItems();
  const notPurchasedItems = getSortedItems(filteredItems.filter(item => !item.completed));
  const purchasedItems = getSortedItems(filteredItems.filter(item => item.completed));
  
  const allCategories = ['All', ...categories];

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 pt-1 pb-3 bg-background">
        <div className="mb-3">
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
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveCategory(category)}
                      className={cn(
                        "rounded-full whitespace-nowrap h-6",
                        activeCategory === category && "bg-todo-purple text-white hover:bg-todo-purple-dark"
                      )}
                    >
                      <span className="text-[10px]">{category}</span>
                    </Button>
                    
                    {category !== 'All' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 rounded-full"
                          >
                            <MoreVertical size={10} className="text-gray-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem 
                            onClick={() => handleEditCategory(category)}
                            className="cursor-pointer"
                          >
                            <Edit size={12} className="mr-2" />
                            <span className="text-[10px]">Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteCategory(category)}
                            className="cursor-pointer text-red-500 hover:text-red-600"
                          >
                            <Trash2 size={12} className="mr-2" />
                            <span className="text-[10px]">Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CarouselItem>
              ))}
              <CarouselItem className="pl-1 basis-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddCategoryDialogOpen(true)}
                  className="rounded-full whitespace-nowrap h-6"
                >
                  <Plus size={10} className="mr-1" /> <span className="text-[10px]">New Category</span>
                </Button>
              </CarouselItem>
            </CarouselContent>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-background to-transparent w-12 h-8 pointer-events-none" />
            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6" />
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6" />
          </Carousel>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex space-x-2">
            <Input
              placeholder="Add new item..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-1 h-7 text-xs"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !showDetailedEntry) addItem();
              }}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="min-w-[32px] h-7"
                  aria-label={showDetailedEntry ? "Hide details" : "Show details"}
                >
                  <MoreHorizontal size={12} />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-60">
                <div className="space-y-2">
                  <div className="text-xs font-medium">Item Details</div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-4 items-center gap-2">
                      <label className="text-xs col-span-1">Category</label>
                      <select
                        value={newItemCategory}
                        onChange={(e) => setNewItemCategory(e.target.value)}
                        className="rounded-md border border-input bg-background px-2 py-1 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white col-span-3"
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-2">
                      <label className="text-xs col-span-1">Amount</label>
                      <Input
                        placeholder="Optional"
                        value={newItemAmount}
                        onChange={(e) => setNewItemAmount(e.target.value)}
                        className="col-span-3 h-6 text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-2">
                      <label className="text-xs col-span-1">Date</label>
                      <Input
                        type="date"
                        placeholder="Optional"
                        value={newItemDate}
                        onChange={(e) => setNewItemDate(e.target.value)}
                        className="col-span-3 h-6 text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-2">
                      <label className="text-xs col-span-1">Price</label>
                      <Input
                        type="number"
                        placeholder="Optional"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                        className="col-span-3 h-6 text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-2">
                      <label className="text-xs col-span-1">Image</label>
                      <div className="col-span-3 flex items-center">
                        <Input
                          type="file"
                          accept="image/*"
                          ref={newItemFileInputRef}
                          onChange={(e) => handleFileChange(e, true)}
                          className="hidden"
                          id="new-item-image"
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-6 w-full text-xs flex justify-center"
                          onClick={() => newItemFileInputRef.current?.click()}
                        >
                          <Image size={12} className="mr-1" />
                          {newItemImage ? 'Change Image' : 'Add Image'}
                        </Button>
                      </div>
                    </div>
                    {newItemImage && (
                      <div className="text-[10px] text-center text-muted-foreground">
                        Image selected: {newItemImage.name}
                      </div>
                    )}
                    <Button 
                      size="sm" 
                      onClick={addItem} 
                      className="mt-1 w-full bg-todo-purple hover:bg-todo-purple-dark text-white h-7"
                    >
                      <span className="text-xs">Add Item with Details</span>
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button 
              onClick={addItem} 
              className="bg-todo-purple hover:bg-todo-purple-dark text-white min-w-[32px] h-7"
              aria-label="Add item"
            >
              <Plus size={12} />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsMultiSelectActive(!isMultiSelectActive)}
            className={cn(
              "h-6",
              isMultiSelectActive && "bg-accent"
            )}
          >
            <Checkbox checked={isMultiSelectActive} className="mr-1 h-3 w-3" /> 
            <span className="text-[10px]">Select</span>
          </Button>
          
          {isMultiSelectActive && selectedItems.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              className="h-6 text-[10px]"
              onClick={deleteSelectedItems}
            >
              Delete Selected ({selectedItems.length})
            </Button>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-6">
              <SortAsc size={10} className="mr-1" /> <span className="text-[10px]">Sort</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleSort('nameAsc')}>
              <span className="text-[10px]">Name (A-Z)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('nameDesc')}>
              <span className="text-[10px]">Name (Z-A)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('dateAsc')}>
              <span className="text-[10px]">Date (Earliest First)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('dateDesc')}>
              <span className="text-[10px]">Date (Latest First)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('priceAsc')}>
              <span className="text-[10px]">Price (Low to High)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('priceDesc')}>
              <span className="text-[10px]">Price (High to Low)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('newest')}>
              <span className="text-[10px]">Recently Added</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort('oldest')}>
              <span className="text-[10px]">Oldest Added</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollArea className="h-[calc(100vh-280px)] pr-4 shopping-items-scroll-area" ref={scrollAreaRef}>
        <div className="mb-4">
          <h3 className="text-xs font-medium mb-2 text-muted-foreground">Not Purchased ({notPurchasedItems.length})</h3>
          
          <AnimatePresence>
            {notPurchasedItems.length === 0 ? (
              <div className="text-center py-3 text-muted-foreground text-[10px]">
                No items to purchase. Add some new items!
              </div>
            ) : (
              <ul className="space-y-1">
                {notPurchasedItems.map((item) => (
                  <motion.li 
                    key={`not-purchased-${item.id}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "flex flex-col p-1 rounded-lg border transition-colors",
                      "bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800/50"
                    )}
                  >
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => !isMultiSelectActive && toggleItem(item.id)}
                    >
                      <div className="flex items-center space-x-1.5">
                        {isMultiSelectActive ? (
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={() => handleItemSelect(item.id)}
                            className="h-3 w-3"
                          />
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleItem(item.id);
                            }}
                            className={cn(
                              "flex items-center justify-center w-3 h-3 rounded-full border",
                              "border-green-300 dark:border-green-700"
                            )}
                          >
                            {item.completed && <Check size={8} />}
                          </button>
                        )}
                        
                        <div className="flex flex-col">
                          <span className="text-[11px] dark:text-white">
                            {item.name}
                          </span>
                          
                          <div className="flex flex-wrap items-center text-[8px] text-muted-foreground mt-0.5 gap-1">
                            {item.amount && (
                              <span className="text-[8px]">Qty: {item.amount}</span>
                            )}
                            
                            {item.price && (
                              <span className="text-[8px]">Price: ${item.price}</span>
                            )}
                            
                            {item.dateToPurchase && (
                              <span className="flex items-center text-[8px]">
                                <Calendar size={7} className="mr-0.5" /> 
                                {new Date(item.dateToPurchase).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[8px] px-1 py-0.5 rounded-full bg-secondary text-secondary-foreground dark:bg-gray-700 dark:text-gray-100">
                          {item.category}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-5 w-5 p-0"
                            >
                              <MoreVertical size={10} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem onClick={() => handleEditItem(item)} className="cursor-pointer">
                              <Edit size={12} className="mr-1" />
                              <span className="text-[10px]">Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => removeItem(item.id)} className="cursor-pointer text-red-500">
                              <Trash2 size={12} className="mr-1" />
                              <span className="text-[10px]">Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    {item.imageUrl && (
                      <div className="mt-1 flex justify-center">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="max-h-24 rounded-md object-contain cursor-pointer hover:brightness-90 transition-all"
                          onClick={(e) => handleImagePreview(item.imageUrl!, e)}
                        />
                      </div>
                    )}
                  </motion.li>
                ))}
              </ul>
            )}
          </AnimatePresence>
        </div>
        
        <div className="mb-2">
          <div 
            className="flex items-center justify-between cursor-pointer mb-2"
            onClick={togglePurchasedSection}
          >
            <h3 className="text-xs font-medium text-muted-foreground">
              Purchased ({purchasedItems.length})
            </h3>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <ChevronDown 
                size={14} 
                className={cn(
                  "transition-transform",
                  isPurchasedSectionCollapsed && "transform rotate-180"
                )}
              />
            </Button>
          </div>
          
          <AnimatePresence>
            {!isPurchasedSectionCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {purchasedItems.length === 0 ? (
                  <div className="text-center py-3 text-muted-foreground text-[10px]">
                    No items purchased yet.
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {purchasedItems.map((item) => (
                      <motion.li 
                        key={`purchased-${item.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => !isMultiSelectActive && toggleItem(item.id)}
                        className={cn(
                          "flex flex-col p-1 rounded-lg border transition-colors cursor-pointer",
                          "bg-gray-50 border-gray-100 dark:bg-gray-800/30 dark:border-gray-700/50"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            {isMultiSelectActive ? (
                              <Checkbox
                                checked={selectedItems.includes(item.id)}
                                onCheckedChange={() => handleItemSelect(item.id)}
                                className="h-3 w-3"
                              />
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleItem(item.id);
                                }}
                                className={cn(
                                  "flex items-center justify-center w-3 h-3 rounded-full border",
                                  "bg-gray-300 border-gray-400 dark:bg-gray-600 dark:border-gray-500"
                                )}
                              >
                                <Check size={8} className="text-white" />
                              </button>
                            )}
                            
                            <div className="flex flex-col">
                              <span className="text-[11px] text-gray-500 dark:text-gray-400 line-through">
                                {item.name}
                              </span>
                              
                              <div className="flex flex-wrap items-center text-[8px] text-muted-foreground mt-0.5 gap-1">
                                {item.amount && (
                                  <span className="text-[8px] text-gray-400">Qty: {item.amount}</span>
                                )}
                                
                                {item.price && (
                                  <span className="text-[8px] text-gray-400">Price: ${item.price}</span>
                                )}
                                
                                {item.dateToPurchase && (
                                  <span className="flex items-center text-[8px] text-gray-400">
                                    <Calendar size={7} className="mr-0.5" /> 
                                    {new Date(item.dateToPurchase).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                            <span className="text-[8px] px-1 py-0.5 rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                              {item.category}
                            </span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-5 w-5 p-0"
                                >
                                  <MoreVertical size={10} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-32">
                                <DropdownMenuItem onClick={() => handleEditItem(item)} className="cursor-pointer">
                                  <Edit size={12} className="mr-1" />
                                  <span className="text-[10px]">Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => removeItem(item.id)} className="cursor-pointer text-red-500">
                                  <Trash2 size={12} className="mr-1" />
                                  <span className="text-[10px]">Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        {item.imageUrl && (
                          <div className="mt-1 flex justify-center">
                            <img 
                              src={item.imageUrl} 
                              alt={item.name} 
                              className="max-h-24 rounded-md object-contain opacity-60 cursor-pointer hover:brightness-90 transition-all"
                              onClick={(e) => handleImagePreview(item.imageUrl!, e)}
                            />
                          </div>
                        )}
                      </motion.li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      <Dialog open={isEditCategoryDialogOpen} onOpenChange={setIsEditCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="edit-category"
                value={editedCategoryName}
                onChange={(e) => setEditedCategoryName(e.target.value)}
                className="col-span-3"
                placeholder="Category name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditCategoryDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={confirmEditCategory}
              className="bg-todo-purple hover:bg-todo-purple-dark text-white"
              disabled={!editedCategoryName.trim() || editedCategoryName === categoryToEdit}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="new-category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="col-span-3"
                placeholder="Category name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddCategoryDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={addCategory}
              className="bg-todo-purple hover:bg-todo-purple-dark text-white"
              disabled={!newCategory.trim() || categories.includes(newCategory.trim())}
            >
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteCategoryDialogOpen} onOpenChange={setIsDeleteCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete the category "{categoryToDelete}"? All items in this category will be moved to "Other".
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteCategoryDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={confirmDeleteCategory}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditItemDialogOpen} onOpenChange={setIsEditItemDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <div className="grid grid-cols-4 items-center gap-2">
                <label className="text-sm col-span-1">Name</label>
                <Input
                  id="edit-item-name"
                  value={editItemName}
                  onChange={(e) => setEditItemName(e.target.value)}
                  className="col-span-3"
                  placeholder="Item name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <label className="text-sm col-span-1">Category</label>
                <select
                  value={editItemCategory}
                  onChange={(e) => setEditItemCategory(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white col-span-3"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <label className="text-sm col-span-1">Amount</label>
                <Input
                  id="edit-item-amount"
                  value={editItemAmount}
                  onChange={(e) => setEditItemAmount(e.target.value)}
                  className="col-span-3"
                  placeholder="Optional"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <label className="text-sm col-span-1">Date</label>
                <Input
                  id="edit-item-date"
                  type="date"
                  value={editItemDate}
                  onChange={(e) => setEditItemDate(e.target.value)}
                  className="col-span-3"
                  placeholder="Optional"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <label className="text-sm col-span-1">Price</label>
                <Input
                  id="edit-item-price"
                  type="number"
                  value={editItemPrice}
                  onChange={(e) => setEditItemPrice(e.target.value)}
                  className="col-span-3"
                  placeholder="Optional"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <label className="text-sm col-span-1">Image</label>
                <div className="col-span-3">
                  <Input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    id="edit-item-image"
                  />
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Image className="mr-2 h-4 w-4" />
                    {editItemImageUrl ? 'Change Image' : 'Add Image'}
                  </Button>
                </div>
              </div>
              {editItemImageUrl && (
                <div className="col-span-4 flex justify-center mt-2">
                  <img 
                    src={editItemImageUrl} 
                    alt="Preview" 
                    className="max-h-40 rounded-md object-contain border p-1"
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditItemDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={saveEditedItem}
              className="bg-todo-purple hover:bg-todo-purple-dark text-white"
              disabled={!editItemName.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-3xl p-1 bg-transparent border-none">
          <div className="relative w-full rounded-lg overflow-hidden bg-background p-1 shadow-lg">
            <DialogClose className="absolute right-2 top-2 z-10 rounded-full bg-background/80 p-1">
              <X className="h-4 w-4" />
            </DialogClose>
            {previewImage && (
              <div className="flex items-center justify-center max-h-[80vh]">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="object-contain max-h-[80vh] max-w-full rounded"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShoppingList;
