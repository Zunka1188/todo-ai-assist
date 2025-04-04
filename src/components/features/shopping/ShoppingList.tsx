
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

interface ShoppingListProps {
  searchTerm?: string;
  filterMode: 'one-off' | 'weekly' | 'monthly' | 'all';
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
  lastPurchased?: Date; // Added lastPurchased field
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
    dateAdded: new Date(item.dateAdded),
    lastPurchased: item.lastPurchased ? new Date(item.lastPurchased) : undefined
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
    
    const item = items.find(item => item.id === id);
    
    if (!item) return;
    
    if (!item.completed) {
      // When marking as completed, add the lastPurchased date
      const updatedItems = items.map((i) =>
        i.id === id ? { ...i, completed: true, lastPurchased: new Date() } : i
      );
      setItems(updatedItems);
      
      toast({
        description: `Moved "${item.name}" to Purchased`,
      });
    } else {
      if (item.repeatOption === 'weekly' || item.repeatOption === 'monthly') {
        const newItem: ShoppingItem = {
          ...item,
          id: Date.now().toString(),
          completed: false,
          dateAdded: new Date()
        };
        
        const updatedItems = items.map((i) =>
          i.id === id ? { ...i, completed: false } : i
        );
        
        setItems(updatedItems);
        
        toast({
          description: `Moved "${item.name}" to Not Purchased`,
        });
      } else {
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
    let filtered = items;
    
    switch (filterMode) {
      case 'weekly':
        filtered = items.filter(item => item.repeatOption === 'weekly');
        break;
      case 'monthly':
        filtered = items.filter(item => item.repeatOption === 'monthly');
        break;
      case 'one-off':
        filtered = items.filter(item => !item.repeatOption || item.repeatOption === 'none');
        break;
      case 'all':
      default:
        break;
    }
    
    if (activeCategory !== 'All') {
      filtered = filtered.filter(item => item.category === activeCategory);
    }
    
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
                        
                        <div className="flex flex-wrap gap-2 text-xs">
                          {item.category && (
                            <div className="bg-secondary/40 px-2 py-1 rounded-md flex items-center">
                              <Tag size={10} className="mr-1" /> {item.category}
                            </div>
                          )}
                          
                          {item.amount && (
                            <div className="bg-secondary/40 px-2 py-1 rounded-md">
                              {item.amount}
                            </div>
                          )}
                          
                          {item.dateToPurchase && (
                            <div className="bg-secondary/40 px-2 py-1 rounded-md flex items-center">
                              <Calendar size={10} className="mr-1" /> {item.dateToPurchase}
                            </div>
                          )}
                          
                          {item.price && (
                            <div className="bg-secondary/40 px-2 py-1 rounded-md">
                              ${item.price}
                            </div>
                          )}
                          
                          {item.repeatOption && item.repeatOption !== 'none' && (
                            <div className="bg-primary/20 text-primary px-2 py-1 rounded-md flex items-center">
                              <Repeat size={10} className="mr-1" /> 
                              {item.repeatOption === 'weekly' ? 'Weekly' : 'Monthly'}
                            </div>
                          )}
                        </div>
                        
                        {item.notes && (
                          <div className="mt-2 text-xs text-muted-foreground border-t pt-2">
                            {item.notes}
                          </div>
                        )}
                        
                        {item.lastPurchased && (
                          <div className="mt-2 text-xs text-muted-foreground border-t pt-2 flex items-center">
                            <CircleCheck size={10} className="mr-1" />
                            Last purchased: {item.lastPurchased.toLocaleDateString()}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="mb-4">
          <div 
            className="flex items-center justify-between mb-3 cursor-pointer"
            onClick={togglePurchasedSection}
          >
            <h3 className="text-xs font-medium text-muted-foreground">
              Purchased ({purchasedItems.length})
            </h3>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              {isPurchasedSectionCollapsed ? 
                <ChevronRight size={14} /> : 
                <ChevronDown size={14} />
              }
            </Button>
          </div>
          
          {!isPurchasedSectionCollapsed && purchasedItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {purchasedItems.map((item) => (
                <Card 
                  key={`purchased-${item.id}`}
                  className="overflow-hidden transition-all bg-muted/50"
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
                          className="flex items-center justify-center w-4 h-4 rounded-full border border-gray-300 bg-primary text-primary-foreground"
                          aria-label="Mark as not purchased"
                        >
                          <Check size={12} />
                        </button>
                      )}
                      <CardTitle className="text-sm font-medium line-through text-gray-500">
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
                    <div className="flex flex-wrap gap-2 text-xs">
                      {item.category && (
                        <div className="bg-secondary/20 px-2 py-1 rounded-md flex items-center">
                          <Tag size={10} className="mr-1" /> {item.category}
                        </div>
                      )}
                      
                      {item.amount && (
                        <div className="bg-secondary/20 px-2 py-1 rounded-md">
                          {item.amount}
                        </div>
                      )}
                      
                      {item.repeatOption && item.repeatOption !== 'none' && (
                        <div className="bg-primary/10 text-muted-foreground px-2 py-1 rounded-md flex items-center">
                          <Repeat size={10} className="mr-1" /> 
                          {item.repeatOption === 'weekly' ? 'Weekly' : 'Monthly'}
                        </div>
                      )}
                    </div>
                    
                    {item.lastPurchased && (
                      <div className="mt-2 text-xs text-muted-foreground border-t pt-2 flex items-center">
                        <CircleCheck size={10} className="mr-1" />
                        Purchased on: {item.lastPurchased.toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Add Item Dialog */}
      <Dialog open={showDetailedEntry} onOpenChange={setShowDetailedEntry}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="name" className="text-xs font-medium">
                Item Name
              </Label>
              <Input
                id="name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="h-8 text-sm"
                placeholder="Enter item name"
              />
            </div>
            
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="category" className="text-xs font-medium">
                Category
              </Label>
              <select
                id="category"
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="amount" className="text-xs font-medium">
                Amount (optional)
              </Label>
              <Input
                id="amount"
                value={newItemAmount}
                onChange={(e) => setNewItemAmount(e.target.value)}
                className="h-8 text-sm"
                placeholder="e.g. 2 lbs, 3 packs"
              />
            </div>
            
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="date" className="text-xs font-medium">
                Purchase By (optional)
              </Label>
              <Input
                id="date"
                type="date"
                value={newItemDate}
                onChange={(e) => setNewItemDate(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="price" className="text-xs font-medium">
                Price (optional)
              </Label>
              <Input
                id="price"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                className="h-8 text-sm"
                placeholder="e.g. 5.99"
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label htmlFor="repeatOption" className="text-xs font-medium">
                Repeat Purchase
              </Label>
              <RadioGroup defaultValue="none" value={editItemRepeatOption} onValueChange={(value) => setEditItemRepeatOption(value as 'none' | 'weekly' | 'monthly')}>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="r1" />
                    <Label htmlFor="r1" className="text-xs">None</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="r2" />
                    <Label htmlFor="r2" className="text-xs">Weekly</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="r3" />
                    <Label htmlFor="r3" className="text-xs">Monthly</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
            
            <div className="grid w-full items-center gap-2">
              <Label className="text-xs font-medium">
                Add Image (optional)
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs h-8"
                >
                  <Upload className="h-3 w-3 mr-1" /> Upload Image
                </Button>
                <input
                  type="file"
                  ref={newItemFileInputRef}
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, true)}
                  className="hidden"
                />
              </div>
              {newItemImage && (
                <div className="mt-2 relative">
                  <div className="aspect-[3/2] rounded-md overflow-hidden">
                    <img
                      src={URL.createObjectURL(newItemImage)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full"
                    onClick={() => {
                      setNewItemImage(null);
                      if (newItemFileInputRef.current) {
                        newItemFileInputRef.current.value = '';
                      }
                    }}
                  >
                    <X size={12} />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowDetailedEntry(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={addItem}
              disabled={newItemName.trim() === ''}
            >
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Item Button */}
      <div className="sticky bottom-4 flex justify-center">
        <Button
          size="lg"
          className="rounded-full shadow-md"
          onClick={() => setShowDetailedEntry(true)}
        >
          <Plus className="mr-1" /> Add Item
        </Button>
      </div>
      
      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="mb-4"
              placeholder="Enter category name"
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsAddCategoryDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={addCategory}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={isDeleteCategoryDialogOpen} onOpenChange={setIsDeleteCategoryDialogOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm">
              Are you sure you want to delete "{categoryToDelete}"?
              All items in this category will be moved to "Other".
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteCategoryDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteCategory}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Category Dialog */}
      <Dialog open={isEditCategoryDialogOpen} onOpenChange={setIsEditCategoryDialogOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={editedCategoryName}
              onChange={(e) => setEditedCategoryName(e.target.value)}
              className="mb-4"
              placeholder="Enter new category name"
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsEditCategoryDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmEditCategory}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Item Dialog */}
      <Dialog open={isEditItemDialogOpen} onOpenChange={(open) => {
        setIsEditItemDialogOpen(open);
        if (!open) setEditItemImage(null);
      }}>
        <DialogContent className="sm:max-w-md overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-full max-h-[calc(90vh-150px)]">
            <div className="space-y-4 py-4 px-1">
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="edit-name" className="text-xs font-medium">
                  Item Name
                </Label>
                <Input
                  id="edit-name"
                  value={editItemName}
                  onChange={(e) => setEditItemName(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="edit-category" className="text-xs font-medium">
                  Category
                </Label>
                <select
                  id="edit-category"
                  value={editItemCategory}
                  onChange={(e) => setEditItemCategory(e.target.value)}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="edit-amount" className="text-xs font-medium">
                  Amount (optional)
                </Label>
                <Input
                  id="edit-amount"
                  value={editItemAmount}
                  onChange={(e) => setEditItemAmount(e.target.value)}
                  className="h-8 text-sm"
                  placeholder="e.g. 2 lbs, 3 packs"
                />
              </div>
              
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="edit-date" className="text-xs font-medium">
                  Purchase By (optional)
                </Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editItemDate}
                  onChange={(e) => setEditItemDate(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="edit-price" className="text-xs font-medium">
                  Price (optional)
                </Label>
                <Input
                  id="edit-price"
                  value={editItemPrice}
                  onChange={(e) => setEditItemPrice(e.target.value)}
                  className="h-8 text-sm"
                  placeholder="e.g. 5.99"
                />
              </div>

              <div className="grid w-full items-center gap-2">
                <Label htmlFor="edit-repeatOption" className="text-xs font-medium">
                  Repeat Purchase
                </Label>
                <RadioGroup value={editItemRepeatOption} onValueChange={(value) => setEditItemRepeatOption(value as 'none' | 'weekly' | 'monthly')}>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="r1-edit" />
                      <Label htmlFor="r1-edit" className="text-xs">None</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="weekly" id="r2-edit" />
                      <Label htmlFor="r2-edit" className="text-xs">Weekly</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="r3-edit" />
                      <Label htmlFor="r3-edit" className="text-xs">Monthly</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="grid w-full items-center gap-2">
                <Label className="text-xs font-medium">Image</Label>
                <div className="flex gap-2">
                  <ImageOptionsDialog />
                  
                  {editItemImageUrl && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={clearEditImage}
                      size="sm"
                      className="flex-none"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <input
                    type="file"
                    ref={editImageFileRef}
                    accept="image/*"
                    onChange={handleEditFileChange}
                    className="hidden"
                  />
                  
                  <input
                    type="file"
                    capture="environment"
                    accept="image/*"
                    ref={editCameraInputRef}
                    onChange={handleEditFileChange}
                    className="hidden"
                  />
                </div>
                {editItemImageUrl && (
                  <div className="mt-2">
                    <div className="aspect-[3/2] rounded-md overflow-hidden">
                      <img
                        src={editItemImageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="edit-notes" className="text-xs font-medium">
                  Notes (optional)
                </Label>
                <Textarea
                  id="edit-notes"
                  value={editItemNotes}
                  onChange={(e) => setEditItemNotes(e.target.value)}
                  className="text-sm min-h-20"
                  placeholder="Add any notes here..."
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              onClick={saveEditedItem}
              disabled={editItemName.trim() === ''}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Image Preview Dialog */}
      <Dialog 
        open={!!previewImage} 
        onOpenChange={(open) => !open && setPreviewImage(null)}
      >
        <DialogContent className="sm:max-w-lg p-1">
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-auto"
            />
          )}
          <DialogClose className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShoppingList;
