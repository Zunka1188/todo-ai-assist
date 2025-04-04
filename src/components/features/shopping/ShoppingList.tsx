import React, { useState, useRef, useEffect } from 'react';
import { Check, Plus, X, ChevronDown, Tag, SortAsc, SortDesc, MoreHorizontal, CircleCheck, ChevronLeft, ChevronRight, Trash2, Edit, MoreVertical, ImageIcon, Upload, Search, Eye, Camera, Repeat, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ShoppingItemButton from './ShoppingItemButton';

interface ShoppingListProps {
  searchTerm?: string;
  filterMode: 'one-off' | 'weekly' | 'monthly' | 'all';
  onEditItem?: (id: string, name: string, item: ShoppingItem) => void;
}

type SortOption = 'nameAsc' | 'nameDesc' | 'dateAsc' | 'dateDesc' | 'priceAsc' | 'priceDesc' | 'newest' | 'oldest';

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
  lastPurchased?: Date;
}

const defaultCategories = ["Groceries", "Household", "Electronics", "Clothing", "Other"];
const initialItems: ShoppingItem[] = [{
  id: '5',
  name: 'Organic Coffee Beans',
  completed: false,
  category: 'Groceries',
  dateAdded: new Date(),
  amount: '2 bags',
  price: '14.99',
  dateToPurchase: '2025-05-10',
  imageUrl: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
  notes: 'Dark roast from the local fair trade shop. Get the whole beans, not pre-ground.',
  repeatOption: 'monthly'
}, {
  id: '1',
  name: 'Dish Soap',
  completed: false,
  category: 'Household',
  dateAdded: new Date('2023-04-01'),
  repeatOption: 'monthly'
}, {
  id: '2',
  name: 'Apples',
  completed: false,
  category: 'Groceries',
  dateAdded: new Date('2023-04-02'),
  repeatOption: 'weekly'
}, {
  id: '3',
  name: 'Bread',
  completed: false,
  category: 'Groceries',
  dateAdded: new Date('2023-04-02'),
  repeatOption: 'weekly'
}, {
  id: '4',
  name: 'Toothpaste',
  completed: false,
  category: 'Household',
  dateAdded: new Date('2023-04-03'),
  imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
  repeatOption: 'monthly'
}];

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

const ShoppingList: React.FC<ShoppingListProps> = ({
  searchTerm = '',
  filterMode,
  onEditItem
}) => {
  const [imageOptionsOpen, setImageOptionsOpen] = useState(false);
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    localStorage.removeItem('shoppingItems');
    return loadFromLocalStorage<ShoppingItem[]>('shoppingItems', initialItems);
  });
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Groceries');
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(() => loadFromLocalStorage<string[]>('shoppingCategories', defaultCategories));
  const [newCategory, setNewCategory] = useState('');
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [showDetailedEntry, setShowDetailedEntry] = useState(false);
  const [newItemAmount, setNewItemAmount] = useState('');
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
  const {
    isMobile,
    isIOS
  } = useIsMobile();
  const carouselRef = useRef(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const purchasedSectionRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveToLocalStorage('shoppingItems', items);
  }, [items]);

  useEffect(() => {
    saveToLocalStorage('shoppingCategories', categories);
  }, [categories]);

  const scrollToPurchasedSection = () => {
    if (purchasedSectionRef.current) {
      if (isPurchasedSectionCollapsed) {
        setIsPurchasedSectionCollapsed(false);
        const timeout = isMobile ? 400 : 250;
        setTimeout(() => {
          scrollToSection();
        }, timeout);
      } else {
        scrollToSection();
      }
    } else {
      console.log('Purchase section ref not found');
    }
  };

  const scrollToSection = () => {
    if (!purchasedSectionRef.current) return;
    try {
      if (viewportRef.current) {
        const sectionPosition = purchasedSectionRef.current.getBoundingClientRect();
        const viewportPosition = viewportRef.current.getBoundingClientRect();
        const relativeTop = sectionPosition.top - viewportPosition.top;
        const offset = isIOS ? 60 : 40;
        viewportRef.current.scrollBy({
          top: relativeTop - offset,
          behavior: 'smooth'
        });
        console.log('Scrolling using viewport ref, position:', relativeTop);
      } else if (listContainerRef.current) {
        const container = listContainerRef.current;
        const section = purchasedSectionRef.current;
        const topPos = section.offsetTop - container.offsetTop;
        container.scrollTo({
          top: topPos - 40,
          behavior: 'smooth'
        });
        console.log('Scrolling using container ref, position:', topPos);
      } else {
        purchasedSectionRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        console.log('Scrolling using scrollIntoView');
      }
    } catch (error) {
      console.error('Error scrolling to section:', error);
      try {
        if (purchasedSectionRef.current) {
          const yOffset = -40;
          const y = purchasedSectionRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({
            top: y,
            behavior: 'smooth'
          });
          console.log('Scrolling using window.scrollTo');
        }
      } catch (e) {
        console.error('All scrolling methods failed:', e);
      }
    }
  };

  const handleEditItem = (item: ShoppingItem) => {
    if (onEditItem) {
      onEditItem(item.id, item.name, item);
      return;
    }
    setItemToEdit(item);
    setEditItemName(item.name);
    setEditItemCategory(item.category);
    setEditItemAmount(item.amount || '');
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
      reader.onload = e => {
        if (e.target?.result) {
          const newImageUrl = e.target.result as string;
          const updatedItems = items.map(item => item.id === itemToEdit.id ? {
            ...item,
            name: editItemName,
            category: editItemCategory,
            amount: editItemAmount || undefined,
            price: editItemPrice || undefined,
            imageUrl: newImageUrl,
            notes: editItemNotes || undefined,
            repeatOption: editItemRepeatOption
          } : item);
          setItems(updatedItems);
          setIsEditItemDialogOpen(false);
          toast({
            description: `Updated "${editItemName}"`
          });
        }
      };
      reader.readAsDataURL(editItemImage);
    } else {
      const updatedItems = items.map(item => item.id === itemToEdit.id ? {
        ...item,
        name: editItemName,
        category: editItemCategory,
        amount: editItemAmount || undefined,
        price: editItemPrice || undefined,
        imageUrl: imageUrl || undefined,
        notes: editItemNotes || undefined,
        repeatOption: editItemRepeatOption
      } : item);
      setItems(updatedItems);
      setIsEditItemDialogOpen(false);
      toast({
        description: `Updated "${editItemName}"`
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
        reader.onload = event => {
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
        price: newItemPrice || undefined,
        imageUrl: imageUrl,
        dateAdded: new Date()
      };
      setItems([...items, newItem]);
      setNewItemName('');
      setNewItemAmount('');
      setNewItemPrice('');
      setNewItemImage(null);
      if (newItemFileInputRef.current) {
        newItemFileInputRef.current.value = '';
      }
      if (!showDetailedEntry) {
        setShowDetailedEntry(false);
      }
      toast({
        description: `Added ${newItem.name} to ${newItem.category}`
      });
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = 0;
        }
      }, 100);
    };
    if (newItemImage) {
      const reader = new FileReader();
      reader.onload = e => {
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
      const updatedItems = items.map(i => i.id === id ? {
        ...i,
        completed: true,
        lastPurchased: new Date()
      } : i);
      setItems(updatedItems);
      toast({
        description: `Moved "${item.name}" to Purchased`
      });
    } else {
      if (item.repeatOption === 'weekly' || item.repeatOption === 'monthly') {
        const newItem: ShoppingItem = {
          ...item,
          id: Date.now().toString(),
          completed: false,
          dateAdded: new Date()
        };
        const updatedItems = items.map(i => i.id === id ? {
          ...i,
          completed: false
        } : i);
        setItems(updatedItems);
        toast({
          description: `Moved "${item.name}" to Not Purchased`
        });
      } else {
        const updatedItems = items.map(i => i.id === id ? {
          ...i,
          completed: false
        } : i);
        setItems(updatedItems);
        toast({
          description: `Moved "${item.name}" to Not Purchased`
        });
      }
    }
  };

  const removeItem = (id: string) => {
    const itemToRemove = items.find(item => item.id === id);
    setItems(items.filter(item => item.id !== id));
    if (itemToRemove) {
      toast({
        description: `Removed ${itemToRemove.name}`
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
      description: `Added category: ${newCategory.trim()}`
    });
  };

  const handleDeleteCategory = (category: string) => {
    setCategoryToDelete(category);
    setIsDeleteCategoryDialogOpen(true);
  };

  const confirmDeleteCategory = () => {
    if (!categoryToDelete || categoryToDelete === 'All') return;
    const updatedItems = items.map(item => item.category === categoryToDelete ? {
      ...item,
      category: 'Other'
    } : item);
    const updatedCategories = categories.filter(c => c !== categoryToDelete);
    setItems(updatedItems);
    setCategories(updatedCategories);
    if (activeCategory === categoryToDelete) {
      setActiveCategory('All');
    }
    setIsDeleteCategoryDialogOpen(false);
    setCategoryToDelete('');
    toast({
      description: `Deleted category: ${categoryToDelete}. Items moved to "Other"`
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
      description: `Deleted ${count} item${count !== 1 ? 's' : ''}`
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
      filtered = filtered.filter(item => item.name.toLowerCase().includes(lowerSearchTerm) || item.category.toLowerCase().includes(lowerSearchTerm));
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
        case 'dateDesc':
          return a.name.localeCompare(b.name);
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
        description: `Category "${editedCategoryName}" already exists.`
      });
      return;
    }
    const updatedCategories = categories.map(c => c === categoryToEdit ? editedCategoryName.trim() : c);
    const updatedItems = items.map(item => item.category === categoryToEdit ? {
      ...item,
      category: editedCategoryName.trim()
    } : item);
    if (activeCategory === categoryToEdit) {
      setActiveCategory(editedCategoryName.trim());
    }
    setCategories(updatedCategories);
    setItems(updatedItems);
    setIsEditCategoryDialogOpen(false);
    toast({
      description: `Updated category from "${categoryToEdit}" to "${editedCategoryName}"`
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
      return <Sheet open={imageOptionsOpen} onOpenChange={setImageOptionsOpen}>
          <SheetTrigger asChild>
            <Button type="button" variant="outline" onClick={() => setImageOptionsOpen(true)} className="flex-1">
              <ImageIcon className="mr-2 h-4 w-4" />
              {editItemImageUrl ? "Change Image" : "Add Image"}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto pb-8">
            <SheetHeader className="mb-4">
              <SheetTitle>Choose Image Source</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col space-y-3">
              <Button onClick={() => {
              editImageFileRef.current?.click();
              setImageOptionsOpen(false);
            }} className="w-full justify-start gap-3" variant="outline">
                <Upload className="h-4 w-4" /> Upload from Device
              </Button>
              <Button onClick={() => {
              editCameraInputRef.current?.click();
              setImageOptionsOpen(false);
            }} className="w-full justify-start gap-3" variant="outline">
                <Camera className="h-4 w-4" /> Take a Picture
              </Button>
              <SheetClose asChild>
                <Button variant="ghost" className="w-full mt-2">Cancel</Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>;
    } else {
      return <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="outline" className="flex-1">
              <ImageIcon className="mr-2 h-4 w-4" />
              {editItemImageUrl ? "Change Image" : "Add Image"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-xs">
            <div className="flex flex-col space-y-3 py-2">
              <Button onClick={() => editImageFileRef.current?.click()} className="w-full justify-start gap-3" variant="outline">
                <Upload className="h-4 w-4" /> Upload from Device
              </Button>
              <Button onClick={() => editCameraInputRef.current?.click()} className="w-full justify-start gap-3" variant="outline">
                <Camera className="h-4 w-4" /> Take a Picture
              </Button>
              <Button variant="ghost" className="w-full mt-2">Cancel</Button>
            </div>
          </AlertDialogContent>
        </AlertDialog>;
    }
  };

  return <div className="space-y-4" ref={listContainerRef}>
      <div className="flex items-center justify-between">
        <div className="flex-1"></div>
        
        {purchasedItems.length > 0 && <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 flex items-center gap-1" onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          scrollToPurchasedSection();
        }}>
              <ShoppingCart size={12} />
              <span className="text-xs">Go to Purchased</span>
            </Button>
          </div>}
      </div>

      <ScrollArea className="h-[calc(100vh-320px)] pr-4 shopping-items-scroll-area" scrollRef={viewportRef}>
        <div className="mb-4">
          <h3 className="text-xs font-medium mb-3 text-muted-foreground">Not Purchased ({notPurchasedItems.length})</h3>
          
          <AnimatePresence>
            {notPurchasedItems.length === 0 ? <div className="text-center py-3 text-muted-foreground text-sm">
                No items to purchase. Add some new items!
              </div> : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                {notPurchasedItems.map(item => <motion.div key={`not-purchased-${item.id}`} initial={{
              opacity: 0,
              y: -10
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              y: 10
            }} transition={{
              duration: 0.2
            }}>
                    <ShoppingItemButton
                      completed={false}
                      name={item.name}
                      quantity={item.amount}
                      notes={item.notes}
                      repeatOption={item.repeatOption}
                      imageUrl={item.imageUrl}
                      onClick={() => toggleItem(item.id)}
                      onEdit={() => handleEditItem(item)}
                      onDelete={() => removeItem(item.id)}
                    />
                  </motion.div>)}
              </div>}
          </AnimatePresence>
        </div>

        {purchasedItems.length > 0 && <div ref={purchasedSectionRef} className="mt-8 mb-4">
            <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={togglePurchasedSection}>
              <h3 className="text-xs font-medium text-muted-foreground">
                Purchased ({purchasedItems.length})
              </h3>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <ChevronDown size={16} className={cn("transition-transform", !isPurchasedSectionCollapsed && "transform rotate-180")} />
              </Button>
            </div>
            
            {!isPurchasedSectionCollapsed && <AnimatePresence>
                <motion.div initial={{
            height: 0,
            opacity: 0
          }} animate={{
            height: "auto",
            opacity: 1
          }} exit={{
            height: 0,
            opacity: 0
          }} transition={{
            duration: 0.2
          }} className="overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                    {purchasedItems.map(item => <motion.div key={`purchased-${item.id}`} initial={{
                opacity: 0,
                y: -10
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0,
                y: 10
              }} transition={{
                duration: 0.2
              }}>
                        <ShoppingItemButton 
                          completed={true} 
                          name={item.name} 
                          quantity={item.amount} 
                          notes={item.notes} 
                          repeatOption={item.repeatOption} 
                          imageUrl={item.imageUrl} 
                          onClick={() => toggleItem(item.id)}
                          onEdit={() => handleEditItem(item)}
                          onDelete={() => removeItem(item.id)}
                        />
                      </motion.div>)}
                  </div>
                </motion.div>
              </AnimatePresence>}
          </div>}
      </ScrollArea>

      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          <div className="aspect-auto w-full max-h-[70vh] overflow-hidden flex items-center justify-center">
            {previewImage && <img src={previewImage} alt="Preview" className="max-w-full max-h-full object-contain" />}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <input ref={editImageFileRef} type="file" accept="image/*" onChange={handleEditFileChange} className="hidden" />
      <input ref={editCameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleEditFileChange} className="hidden" />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
      <input ref={newItemFileInputRef} type="file" accept="image/*" className="hidden" />
    </div>;
};

export default ShoppingList;
