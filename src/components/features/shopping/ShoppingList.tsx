
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
  Repeat,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Define the missing interfaces
interface ShoppingListProps {
  searchTerm?: string;
  filterMode: 'all' | 'weekly' | 'monthly';
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
  repeatOption?: 'none' | 'weekly' | 'monthly';
}

const defaultCategories = [
  "Groceries",
  "Household",
  "Electronics",
  "Clothing",
  "Other"
];

const initialItems: ShoppingItem[] = [
  { id: '1', name: 'Dish Soap', completed: false, category: 'Household', dateAdded: new Date('2023-04-01'), repeatOption: 'monthly' },
  { id: '2', name: 'Apples', completed: false, category: 'Groceries', dateAdded: new Date('2023-04-02'), repeatOption: 'weekly' },
  { id: '3', name: 'Bread', completed: false, category: 'Groceries', dateAdded: new Date('2023-04-02'), repeatOption: 'weekly' },
  { id: '4', name: 'Toothpaste', completed: false, category: 'Household', dateAdded: new Date('2023-04-03'), imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60', repeatOption: 'monthly' },
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
  // Added state for image options dialog
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
  const [editItemRepeatOption, setEditItemRepeatOption] = useState<'none' | 'weekly' | 'monthly'>('none');
  
  // Fixed duplicate ref declarations
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
    setEditItemRepeatOption(item.repeatOption || 'none');
    setIsEditItemDialogOpen(true);
  };

  // Added missing clearEditImage function
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
                  notes: editItemNotes || undefined,
                  repeatOption: editItemRepeatOption
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
              notes: editItemNotes || undefined,
              repeatOption: editItemRepeatOption
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
  
  // Added missing handleEditFileChange function
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

  // Modified to handle repeating items
  const toggleItem = (id: string) => {
    if (isMultiSelectActive) {
      handleItemSelect(id);
      return;
    }
    
    const item = items.find(item => item.id === id);
    
    if (!item) return;
    
    // Handle repeating items logic
    if (!item.completed) {
      // Mark as completed
      const updatedItems = items.map((i) =>
        i.id === id ? { ...i, completed: true } : i
      );
      setItems(updatedItems);
      
      toast({
        description: `Moved "${item.name}" to Purchased`,
      });
    } else {
      // If item is repeating, duplicate it when unmarking
      if (item.repeatOption === 'weekly' || item.repeatOption === 'monthly') {
        // Create a new item for next week/month
        const newItem: ShoppingItem = {
          ...item,
          id: Date.now().toString(),
          completed: false,
          dateAdded: new Date()
        };
        
        // Update the original item to be not completed
        const updatedItems = items.map((i) =>
          i.id === id ? { ...i, completed: false } : i
        );
        
        setItems(updatedItems);
        
        toast({
          description: `Moved "${item.name}" to Not Purchased`,
        });
      } else {
        // Non-repeating items just get unmarked
        const updatedItems = items.map((i) =>
          i.id === id ? { ...i, completed: false } : i
        );
        setItems(updatedItems);
        
        toast({
          description: `Moved "${item.name}" to Not Purchased`,
        });
      }
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
    // Apply repeating filter first
    let filtered = items;
    
    switch (filterMode) {
      case 'weekly':
        filtered = items.filter(item => item.repeatOption === 'weekly');
        break;
      case 'monthly':
        filtered = items.filter(item => item.repeatOption === 'monthly');
        break;
      case 'all':
      default:
        break;
    }
    
    // Then apply category filter
    if (activeCategory !== 'All') {
      filtered = filtered.filter(item => item.category === activeCategory);
    }
    
    // Finally apply search term
    if (searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(lowerSearchTerm) || 
        item.category.toLowerCase().includes(lowerSearchTerm)
      );
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
        {/* Not Purchased Items */}
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
                          
                          {item.repeatOption && item.repeatOption !== 'none' && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 flex items-center">
                              <Repeat className="h-3 w-3 mr-1" />
                              {item.repeatOption === 'weekly' ? 'Weekly' : 'Monthly'}
                            </span>
                          )}
                          
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
                          className="h-8 text-xs bg-green-500 hover:bg-green-600 text-white border-green-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleItem(item.id);
                          }}
                        >
                          <Check size={12} className="mr-1" />
                          Mark as Purchased
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Purchased Items */}
        <div className="mb-2">
          <div 
            className="flex items-center justify-between cursor-pointer mb-3"
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
                  <div className="text-center py-3 text-muted-foreground text-sm">
                    No items purchased yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {purchasedItems.map((item) => (
                      <motion.div
                        key={`purchased-${item.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card 
                          className={cn(
                            "overflow-hidden transition-all hover:shadow-md opacity-70",
                            "bg-gray-100 dark:bg-gray-700/50"
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
                                    "flex items-center justify-center w-4 h-4 rounded-full",
                                    "bg-gray-300 border-gray-400 dark:bg-gray-600 dark:border-gray-500"
                                  )}
                                  aria-label="Mark as not purchased"
                                >
                                  <Check size={12} className="text-white" />
                                </button>
                              )}
                              <CardTitle className={cn(
                                "text-sm font-medium line-through text-gray-500 dark:text-gray-400"
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
                              
                              {item.repeatOption && item.repeatOption !== 'none' && (
                                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 flex items-center">
                                  <Repeat className="h-3 w-3 mr-1" />
                                  {item.repeatOption === 'weekly' ? 'Weekly' : 'Monthly'}
                                </span>
                              )}
                              
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
                              className="h-8 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleItem(item.id);
                              }}
                            >
                              <X size={12} className="mr-1" />
                              Mark as Not Purchased
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Edit Item Dialog */}
      <Dialog open={isEditItemDialogOpen} onOpenChange={setIsEditItemDialogOpen}>
        <DialogContent className={cn("sm:max-w-md", isMobile && "w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto")}>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 px-1">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Item Name*</Label>
                  <Input
                    id="edit-name"
                    placeholder="Enter item name"
                    value={editItemName}
                    onChange={(e) => setEditItemName(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Category*</Label>
                  <select
                    id="edit-category"
                    value={editItemCategory}
                    onChange={(e) => setEditItemCategory(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-image">Image</Label>
                  <div className="flex gap-2">
                    <Input
                      id="edit-image"
                      type="file"
                      accept="image/*"
                      ref={editImageFileRef}
                      onChange={handleEditFileChange}
                      className="hidden"
                    />
                    <Input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      ref={editCameraInputRef}
                      onChange={handleEditFileChange}
                      className="hidden"
                    />
                    
                    <ImageOptionsDialog />
                    
                    {editItemImageUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={clearEditImage}
                        className="p-2"
                        title="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {editItemImageUrl && (
                    <div className="mt-2 relative rounded-lg overflow-hidden border">
                      <img 
                        src={editItemImageUrl} 
                        alt="Preview" 
                        className="max-h-32 mx-auto object-contain"
                      />
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-repeat">Repeat</Label>
                  <RadioGroup 
                    value={editItemRepeatOption} 
                    onValueChange={(value) => setEditItemRepeatOption(value as 'none' | 'weekly' | 'monthly')}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="none" />
                      <Label htmlFor="none">None</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="weekly" id="weekly" />
                      <Label htmlFor="weekly">Weekly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly">Monthly</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-amount">Quantity</Label>
                    <Input
                      id="edit-amount"
                      placeholder="e.g., 2 boxes"
                      value={editItemAmount}
                      onChange={(e) => setEditItemAmount(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-price">Price</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      placeholder="e.g., 9.99"
                      value={editItemPrice}
                      onChange={(e) => setEditItemPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-date">Purchase By</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editItemDate}
                    onChange={(e) => setEditItemDate(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    placeholder="Add any additional notes here"
                    value={editItemNotes}
                    onChange={(e) => setEditItemNotes(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className={cn(isMobile && "flex-col gap-2")}>
            <Button 
              variant="outline" 
              className={cn(isMobile && "w-full")}
              onClick={() => setIsEditItemDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={saveEditedItem}
              className={cn(isMobile && "w-full")}
              disabled={editItemName.trim() === ''}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={previewImage !== null} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="flex justify-center p-2">
              <img 
                src={previewImage} 
                alt="Preview" 
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setPreviewImage(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
        <DialogContent className={cn("sm:max-w-md", isMobile && "w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto")}>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="new-category">Category Name</Label>
              <Input
                id="new-category"
                placeholder="Enter category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className={cn(isMobile && "flex-col gap-2")}>
            <Button 
              variant="outline" 
              className={cn(isMobile && "w-full")}
              onClick={() => setIsAddCategoryDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={addCategory}
              className={cn(isMobile && "w-full")}
              disabled={newCategory.trim() === ''}
            >
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={isDeleteCategoryDialogOpen} onOpenChange={setIsDeleteCategoryDialogOpen}>
        <DialogContent className={cn("sm:max-w-md", isMobile && "w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto")}>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="delete-category">Category to Delete</Label>
              <select
                id="delete-category"
                value={categoryToDelete}
                onChange={(e) => setCategoryToDelete(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <p className="text-sm mt-2">Items in this category will be moved to "Other"</p>
            </div>
          </div>
          <DialogFooter className={cn(isMobile && "flex-col gap-2")}>
            <Button 
              variant="outline" 
              className={cn(isMobile && "w-full")}
              onClick={() => setIsDeleteCategoryDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmDeleteCategory}
              variant="destructive"
              className={cn(isMobile && "w-full")}
              disabled={categoryToDelete === ''}
            >
              Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditCategoryDialogOpen} onOpenChange={setIsEditCategoryDialogOpen}>
        <DialogContent className={cn("sm:max-w-md", isMobile && "w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto")}>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category-to-edit">Category</Label>
                <select
                  id="category-to-edit"
                  value={categoryToEdit}
                  onChange={(e) => {
                    setCategoryToEdit(e.target.value);
                    setEditedCategoryName(e.target.value);
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-category-name">New Category Name</Label>
                <Input
                  id="edit-category-name"
                  placeholder="Enter new category name"
                  value={editedCategoryName}
                  onChange={(e) => setEditedCategoryName(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter className={cn(isMobile && "flex-col gap-2")}>
            <Button 
              variant="outline" 
              className={cn(isMobile && "w-full")}
              onClick={() => setIsEditCategoryDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmEditCategory}
              className={cn(isMobile && "w-full")}
              disabled={categoryToEdit === '' || editedCategoryName.trim() === ''}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShoppingList;
