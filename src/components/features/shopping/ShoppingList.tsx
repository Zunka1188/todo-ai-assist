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
  Image as ImageIcon,
  Upload,
  Search,
  Eye,
  Camera,
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
} from '@/components/ui/carousel';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

// Define the missing interfaces
interface ShoppingListProps {
  searchTerm?: string;
  filterMode: 'all' | 'text' | 'image';
}

type SortOption = 
  | 'nameAsc'
  | 'nameDesc'
  | 'dateAsc'
  | 'dateDesc'
  | 'priceAsc'
  | 'priceDesc'
  | 'newest'
  | 'oldest';

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
  notes?: string;
}

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
  { id: '4', name: 'Toothpaste', completed: false, category: 'Household', dateAdded: new Date('2023-04-03'), imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60' },
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

const ShoppingList: React.FC<ShoppingListProps> = ({ searchTerm = '', filterMode }) => {
  // Fix: Added state for image options dialog
  const [imageOptionsOpen, setImageOptionsOpen] = useState(false);
  
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
  const [editItemNotes, setEditItemNotes] = useState('');
  
  // Fix: Removed duplicate declarations and kept only one set of refs
  const editImageFileRef = useRef<HTMLInputElement>(null);
  const editCameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newItemFileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const carouselRef = useRef(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
    setEditItemNotes(item.notes || '');
    setIsEditItemDialogOpen(true);
  };

  // Fix: Added missing clearEditImage function
  const clearEditImage = () => {
    setEditItemImage(null);
    setEditItemImageUrl('');
    
    if (editImageFileRef.current) {
      editImageFileRef.current.value = '';
    }
    
    if (editCameraInputRef.current) {
      editCameraInputRef.current.value = '';
    }
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
                  imageUrl: newImageUrl,
                  notes: editItemNotes || undefined
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
              imageUrl: imageUrl || undefined,
              notes: editItemNotes || undefined
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
  
  // Fix: Added missing handleEditFileChange function, reusing handleFileChange
  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e, false);
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
    let filtered = activeCategory === 'All' 
      ? items 
      : items.filter(item => item.category === activeCategory);
    
    if (searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(lowerSearchTerm) || 
        item.category.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Apply the filterMode
    switch (filterMode) {
      case 'text':
        filtered = filtered.filter(item => !item.imageUrl);
        break;
      case 'image':
        filtered = filtered.filter(item => !!item.imageUrl);
        break;
      case 'all':
      default:
        // No additional filtering needed
        break;
    }
    
    return filtered;
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

  const ImageOptionsDialog = () => {
    if (isMobile) {
      return (
        <Sheet open={imageOptionsOpen} onOpenChange={setImageOptionsOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="outline"
              onClick={() => setImageOptionsOpen(true)}
              className="flex-1"
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              {editItemImageUrl ? "Change Image" : "Add Image"}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto pb-8">
            <SheetHeader className="mb-4">
              <SheetTitle>Choose Image Source</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col space-y-3">
              <Button 
                onClick={() => {
                  editImageFileRef.current?.click();
                  setImageOptionsOpen(false);
                }}
                className="w-full justify-start gap-3"
                variant="outline"
              >
                <Upload className="h-4 w-4" /> Upload from Device
              </Button>
              <Button 
                onClick={() => {
                  editCameraInputRef.current?.click();
                  setImageOptionsOpen(false);
                }}
                className="w-full justify-start gap-3"
                variant="outline"
              >
                <Camera className="h-4 w-4" /> Take a Picture
              </Button>
              <SheetClose asChild>
                <Button variant="ghost" className="w-full mt-2">Cancel</Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      );
    } else {
      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              {editItemImageUrl ? "Change Image" : "Add Image"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-xs">
            <div className="flex flex-col space-y-3 py-2">
              <Button 
                onClick={() => editImageFileRef.current?.click()}
                className="w-full justify-start gap-3"
                variant="outline"
              >
                <Upload className="h-4 w-4" /> Upload from Device
              </Button>
              <Button 
                onClick={() => editCameraInputRef.current?.click()}
                className="w-full justify-start gap-3"
                variant="outline"
              >
                <Camera className="h-4 w-4" /> Take a Picture
              </Button>
              <Button variant="ghost" className="w-full mt-2">Cancel</Button>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsMultiSelectActive(!isMultiSelectActive)}
            className={cn(
              "h-8",
              isMultiSelectActive && "bg-accent"
            )}
          >
            <Checkbox checked={isMultiSelectActive} className="mr-1 h-3 w-3" /> 
            <span className="text-xs">Select</span>
          </Button>
          
          {isMultiSelectActive && selectedItems.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              className="h-8 text-xs"
              onClick={deleteSelectedItems}
            >
              Delete Selected ({selectedItems.length})
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Tag size={12} className="mr-1" /> <span className="text-xs">Category</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {allCategories.map((category) => (
                <DropdownMenuItem 
                  key={category} 
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "cursor-pointer text-xs",
                    activeCategory === category && "bg-accent"
                  )}
                >
                  {category}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem 
                onClick={() => setIsAddCategoryDialogOpen(true)}
                className="cursor-pointer text-primary"
              >
                <Plus size={12} className="mr-1" /> <span className="text-xs">Add Category</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <SortAsc size={12} className="mr-1" /> <span className="text-xs">Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSort('nameAsc')}>
                <span className="text-xs">Name (A-Z)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('nameDesc')}>
                <span className="text-xs">Name (Z-A)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('dateAsc')}>
                <span className="text-xs">Date (Earliest First)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('dateDesc')}>
                <span className="text-xs">Date (Latest First)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('priceAsc')}>
                <span className="text-xs">Price (Low to High)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('priceDesc')}>
                <span className="text-xs">Price (High to Low)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('newest')}>
                <span className="text-xs">Recently Added</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('oldest')}>
                <span className="text-xs">Oldest Added</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-320px)] pr-4 shopping-items-scroll-area smooth-scroll" ref={scrollAreaRef}>
        <div className="mb-4">
          <h3 className="text-xs font-medium mb-3 text-muted-foreground">Not Purchased ({notPurchasedItems.length})</h3>
          
          <AnimatePresence>
            {notPurchasedItems.length === 0 ? (
              <div className="text-center py-3 text-muted-foreground text-sm">
                No items to purchase. Add some new items!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {notPurchasedItems.map((item) => (
                  <motion.div 
                    key={`not-purchased-${item.id}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card 
                      className={cn(
                        "overflow-hidden transition-all hover:shadow-md",
                        "bg-white dark:bg-gray-800"
                      )}
                      onClick={() => !isMultiSelectActive && toggleItem(item.id)}
                    >
                      <CardHeader className="p-3 pb-0 flex flex-row items-center space-y-0 gap-2">
                        <div className="flex-1 flex items-center gap-2">
                          {isMultiSelectActive ? (
                            <Checkbox
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={() => handleItemSelect(item.id)}
                              className="h-4 w-4"
                            />
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleItem(item.id);
                              }}
                              className={cn(
                                "flex items-center justify-center w-4 h-4 rounded-full border",
                                "border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                              )}
                              aria-label="Mark as purchased"
                            >
                              {item.completed && <Check size={12} />}
                            </button>
                          )}
                          <CardTitle className={cn(
                            "text-sm font-medium",
                            item.completed && "line-through text-gray-500 dark:text-gray-400"
                          )}>
                            {item.name}
                          </CardTitle>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleEditItem(item);
                            }} className="cursor-pointer">
                              <Edit size={14} className="mr-2" />
                              <span className="text-sm">Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              removeItem(item.id);
                            }} className="cursor-pointer text-red-500">
                              <Trash2 size={14} className="mr-2" />
                              <span className="text-sm">Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardHeader>
                      
                      <CardContent className="p-3 pt-2">
                        {item.imageUrl ? (
                          <div className="relative w-full">
                            <div className="aspect-[3/2] rounded-md overflow-hidden mb-2">
                              <img 
                                src={item.imageUrl} 
                                alt={item.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="absolute right-2 top-2 h-8 w-8 p-0 bg-black/40 hover:bg-black/60 text-white rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImagePreview(item.imageUrl!);
                              }}
                            >
                              <Eye size={14} />
                            </Button>
                          </div>
                        ) : (
                          <div className="mb-2 flex items-center text-xs text-muted-foreground">
                            <ImageIcon size={14} className="mr-1 text-muted-foreground" /> No image attached
                          </div>
                        )}
                        
                        <div className="flex items-center flex-wrap gap-2 mt-1">
                          <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                            {item.category}
                          </span>
                          
                          {item.price && (
                            <span className="text-xs px-2 py-1 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300">
                              ${item.price}
                            </span>
                          )}
                          
                          {item.amount && (
                            <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                              Qty: {item.amount}
                            </span>
                          )}
                        </div>
                      </CardContent>
                      
                      <CardFooter className="p-3 pt-0 flex justify-between items-center">
                        {item.dateToPurchase ? (
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Calendar size={12} className="mr-1" />
                            {new Date(item.dateToPurchase).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Added {item.dateAdded.toLocaleDateString()}
                          </span>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="
