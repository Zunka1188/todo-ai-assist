import React, { useState, useRef } from 'react';
import { ArrowLeft, Search, Plus, FileText, Image, ChefHat, Plane, Dumbbell, Shirt, Upload, Camera, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppHeader from '@/components/layout/AppHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import {
  AlertDialog, 
  AlertDialogContent,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';

type DocumentCategory = 'style' | 'recipes' | 'travel' | 'fitness';

interface DocumentItem {
  id: string;
  title: string;
  category: DocumentCategory;
  type: 'image' | 'note';
  content: string;
  tags: string[];
  date: Date;
  notes?: string;
  dateToRemember?: string;
}

const initialItems: DocumentItem[] = [
  {
    id: '1',
    title: 'Summer Outfit Idea',
    category: 'style',
    type: 'image',
    content: 'https://picsum.photos/id/64/400/300',
    tags: ['summer', 'casual'],
    date: new Date(2025, 3, 1)
  },
  {
    id: '2',
    title: 'Healthy Smoothie Recipe',
    category: 'recipes',
    type: 'note',
    content: 'Blend 1 banana, 1 cup spinach, 1/2 cup blueberries, 1 tbsp chia seeds, and almond milk.',
    tags: ['healthy', 'breakfast'],
    date: new Date(2025, 3, 2)
  },
  {
    id: '3',
    title: 'Paris Trip Ideas',
    category: 'travel',
    type: 'note',
    content: 'Visit Eiffel Tower, Louvre Museum, Notre-Dame Cathedral, and try local pastries.',
    tags: ['europe', 'vacation'],
    date: new Date(2025, 3, 3)
  },
  {
    id: '4',
    title: 'Weekly Workout Plan',
    category: 'fitness',
    type: 'note',
    content: 'Monday: Upper body, Tuesday: Lower body, Wednesday: Rest, Thursday: HIIT, Friday: Full body, Weekend: Active recovery',
    tags: ['workout', 'routine'],
    date: new Date(2025, 3, 4)
  },
  {
    id: '5',
    title: 'Winter Fashion Collection',
    category: 'style',
    type: 'image',
    content: 'https://picsum.photos/id/96/400/300',
    tags: ['winter', 'fashion'],
    date: new Date(2025, 3, 5)
  },
  {
    id: '6',
    title: 'Italian Pasta Recipe',
    category: 'recipes',
    type: 'image',
    content: 'https://picsum.photos/id/292/400/300',
    tags: ['dinner', 'pasta'],
    date: new Date(2025, 3, 6)
  }
];

const DocumentsPage = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<DocumentItem[]>(initialItems);
  const [activeTab, setActiveTab] = useState<DocumentCategory>('style');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DocumentItem | null>(null);
  const [imageOptionsOpen, setImageOptionsOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [title, setTitle] = useState('');
  const [itemType, setItemType] = useState<'note' | 'image'>('note');
  const [content, setContent] = useState('');
  const [itemTags, setItemTags] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [dateToRemember, setDateToRemember] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const goBack = () => {
    navigate('/');
  };

  const getCategoryIcon = (category: DocumentCategory) => {
    switch (category) {
      case 'style':
        return <Shirt className="h-5 w-5" />;
      case 'recipes':
        return <ChefHat className="h-5 w-5" />;
      case 'travel':
        return <Plane className="h-5 w-5" />;
      case 'fitness':
        return <Dumbbell className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: 'image' | 'note') => {
    return type === 'image' 
      ? <Image className="h-5 w-5 text-blue-500" /> 
      : <FileText className="h-5 w-5 text-green-500" />;
  };

  const handleOpenAddDialog = (editing: DocumentItem | null = null) => {
    if (editing) {
      setEditingItem(editing);
      setTitle(editing.title);
      setItemType(editing.type);
      setContent(editing.content);
      setItemTags(editing.tags.join(', '));
      setNotes(editing.notes || '');
      setDateToRemember(editing.dateToRemember || '');
      
      if (editing.type === 'image') {
        setImagePreview(editing.content);
      }
    } else {
      setEditingItem(null);
      setTitle('');
      setItemType('note');
      setContent('');
      setItemTags('');
      setImagePreview(null);
      setNotes('');
      setDateToRemember('');
    }
    setAddDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setItemType('image');
        setImagePreview(event.target.result as string);
        setContent(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    
    setImageOptionsOpen(false);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const handleSaveItem = () => {
    if (title.trim() === '' && !imagePreview) {
      toast({
        title: "Input Required",
        description: "Please enter a title or add an image",
        variant: "destructive",
      });
      return;
    }

    const tags = itemTags.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    const newItem: DocumentItem = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      title: title.trim() || (imagePreview ? 'Untitled Item' : ''),
      category: activeTab,
      type: itemType,
      content: itemType === 'image' ? (imagePreview || '') : content,
      tags: tags,
      date: editingItem ? editingItem.date : new Date(),
      notes: notes.trim() || undefined,
      dateToRemember: dateToRemember || undefined
    };

    if (editingItem) {
      setItems(items.map(item => 
        item.id === editingItem.id ? newItem : item
      ));
      toast({
        title: "Item Updated",
        description: `"${newItem.title}" has been updated`,
      });
    } else {
      setItems([...items, newItem]);
      toast({
        title: "Item Added",
        description: `"${newItem.title}" has been added to your ${activeTab} collection`,
      });
    }

    setAddDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setItemType('note');
    setContent('');
    setItemTags('');
    setImagePreview(null);
    setNotes('');
    setDateToRemember('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast({
      title: "Item Removed",
      description: "The item has been deleted",
    });
  };

  const ImageSourceOptions = () => {
    if (isMobile) {
      return (
        <Sheet open={imageOptionsOpen} onOpenChange={setImageOptionsOpen}>
          <Button
            type="button"
            variant="outline"
            onClick={() => setImageOptionsOpen(true)}
            className="flex-1"
          >
            <Image className="mr-2 h-4 w-4" />
            {imagePreview ? "Change Image" : "Add Image"}
          </Button>
          <SheetContent side="bottom" className="h-auto pb-8">
            <SheetHeader className="mb-4">
              <SheetTitle>Choose Image Source</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col space-y-3">
              <Button 
                onClick={() => {
                  fileInputRef.current?.click();
                  setImageOptionsOpen(false);
                }}
                className="w-full justify-start gap-3"
                variant="outline"
              >
                <Upload className="h-4 w-4" /> Upload from Device
              </Button>
              <Button 
                onClick={() => {
                  cameraInputRef.current?.click();
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
              <Image className="mr-2 h-4 w-4" />
              {imagePreview ? "Change Image" : "Add Image"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-xs">
            <div className="flex flex-col space-y-3 py-2">
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full justify-start gap-3"
                variant="outline"
              >
                <Upload className="h-4 w-4" /> Upload from Device
              </Button>
              <Button 
                onClick={() => cameraInputRef.current?.click()}
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

  const filteredItems = items.filter(item => 
    (item.category === activeTab) && 
    (searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-4 py-2 sm:py-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goBack} 
          className="shrink-0"
          aria-label="Go back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <AppHeader 
            title="Documents" 
            subtitle="Organize your personal collection"
            icon={<FileText className="h-6 w-6 text-primary" />}
            className="py-0"
          />
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 my-3">
        <Button 
          className="bg-todo-purple hover:bg-todo-purple/90 text-white gap-2 h-10 sm:w-auto w-full flex justify-center items-center"
          size={isMobile ? "default" : "sm"}
          onClick={() => handleOpenAddDialog()}
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Add Item</span>
        </Button>
        
        <div className="relative w-full sm:w-auto sm:max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search items..."
            className="pl-8 h-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Separator className="my-2" />
      
      <div className="mb-4">
        <Tabs 
          defaultValue="style" 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as DocumentCategory)} 
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="style" className="flex items-center gap-2">
              <Shirt className="h-4 w-4" />
              <span className={isMobile ? "hidden" : "inline"}>Style</span>
            </TabsTrigger>
            <TabsTrigger value="recipes" className="flex items-center gap-2">
              <ChefHat className="h-4 w-4" />
              <span className={isMobile ? "hidden" : "inline"}>Recipes</span>
            </TabsTrigger>
            <TabsTrigger value="travel" className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              <span className={isMobile ? "hidden" : "inline"}>Travel</span>
            </TabsTrigger>
            <TabsTrigger value="fitness" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              <span className={isMobile ? "hidden" : "inline"}>Fitness</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="style" className="mt-0 pt-4">
            <DocumentItemsList 
              items={filteredItems}
              getTypeIcon={getTypeIcon}
              onEdit={handleOpenAddDialog}
              onDelete={handleDeleteItem}
            />
          </TabsContent>
          
          <TabsContent value="recipes" className="mt-0 pt-4">
            <DocumentItemsList 
              items={filteredItems}
              getTypeIcon={getTypeIcon}
              onEdit={handleOpenAddDialog}
              onDelete={handleDeleteItem}
            />
          </TabsContent>
          
          <TabsContent value="travel" className="mt-0 pt-4">
            <DocumentItemsList 
              items={filteredItems}
              getTypeIcon={getTypeIcon}
              onEdit={handleOpenAddDialog}
              onDelete={handleDeleteItem}
            />
          </TabsContent>
          
          <TabsContent value="fitness" className="mt-0 pt-4">
            <DocumentItemsList 
              items={filteredItems}
              getTypeIcon={getTypeIcon}
              onEdit={handleOpenAddDialog}
              onDelete={handleDeleteItem}
            />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className={cn("sm:max-w-md", isMobile && "w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto")}>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Item" : "Add New Item"}
            </DialogTitle>
            <DialogDescription>
              {`Add to your ${activeTab} collection`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title (Optional if image is provided)</Label>
              <Input
                id="title"
                placeholder="Enter a title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Type</Label>
              <div className="flex gap-4">
                <Label
                  htmlFor="type-note"
                  className={cn(
                    "flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 cursor-pointer",
                    itemType === "note" && "border-primary"
                  )}
                >
                  <FileText className="mb-2 h-6 w-6" />
                  <span>Note</span>
                  <input
                    type="radio"
                    id="type-note"
                    value="note"
                    className="sr-only"
                    checked={itemType === "note"}
                    onChange={() => {
                      setItemType("note");
                      setImagePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                      if (cameraInputRef.current) cameraInputRef.current.value = '';
                    }}
                  />
                </Label>
                <Label
                  htmlFor="type-image"
                  className={cn(
                    "flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 cursor-pointer",
                    itemType === "image" && "border-primary"
                  )}
                >
                  <Image className="mb-2 h-6 w-6" />
                  <span>Image</span>
                  <input
                    type="radio"
                    id="type-image"
                    value="image"
                    className="sr-only"
                    checked={itemType === "image"}
                    onChange={() => setItemType("image")}
                  />
                </Label>
              </div>
            </div>

            {itemType === "note" ? (
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter your notes here"
                  className="min-h-[120px]"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="image">Image</Label>
                <div className="flex gap-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={cameraInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  <ImageSourceOptions />
                  
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearImage}
                      className="p-2"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {imagePreview && (
                  <div className="mt-2 relative rounded-lg overflow-hidden border">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-32 mx-auto object-contain"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="date-remember">Date to Remember (Optional)</Label>
              <Input
                id="date-remember"
                type="date"
                value={dateToRemember}
                onChange={(e) => setDateToRemember(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes here"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                placeholder="e.g. inspiration, ideas, favorite"
                value={itemTags}
                onChange={(e) => setItemTags(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className={cn(isMobile && "flex-col gap-2")}>
            <Button 
              variant="outline" 
              onClick={() => {
                resetForm();
                setAddDialogOpen(false);
              }}
              className={cn(isMobile && "w-full")}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveItem}
              className={cn("bg-todo-purple hover:bg-todo-purple/90", isMobile && "w-full")}
              disabled={itemType === 'note' && content.trim() === '' && title.trim() === '' && !imagePreview}
            >
              {editingItem ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface DocumentItemsListProps {
  items: DocumentItem[];
  getTypeIcon: (type: 'image' | 'note') => React.ReactNode;
  onEdit: (item: DocumentItem) => void;
  onDelete: (id: string) => void;
}

const DocumentItemsList: React.FC<DocumentItemsListProps> = ({ 
  items, 
  getTypeIcon, 
  onEdit,
  onDelete
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">No items found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first item to get started
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <Card 
          key={item.id}
          className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onEdit(item)}
        >
          <CardContent className="p-0">
            {item.type === 'image' ? (
              <div className="relative">
                <img 
                  src={item.content} 
                  alt={item.title} 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <h3 className="font-medium text-white truncate">{item.title}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.tags.map((tag, i) => (
                      <span 
                        key={i}
                        className="text-xs bg-black/20 text-white px-2 py-0.5 rounded-full truncate"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0 bg-black/20 hover:bg-black/40"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(item);
                    }}
                  >
                    <FileText className="h-4 w-4 text-white" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 w-8 p-0 bg-black/20 hover:bg-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                  >
                    <span className="sr-only">Delete</span>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-white"
                    >
                      <path
                        d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H3.5C3.22386 4 3 3.77614 3 3.5ZM3.5 5C3.22386 5 3 5.22386 3 5.5C3 5.77614 3.22386 6 3.5 6H4V12C4 12.5523 4.44772 13 5 13H10C10.5523 13 11 12.5523 11 12V6H11.5C11.7761 6 12 5.77614 12 5.5C12 5.22386 11.7761 5 11.5 5H3.5ZM5 6H10V12H5V6Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Button>
                </div>
                {item.dateToRemember && (
                  <div className="absolute top-2 left-2 bg-todo-purple text-white px-2 py-1 text-xs rounded-md">
                    {new Date(item.dateToRemember).toLocaleDateString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{item.content}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.map((tag, i) => (
                        <span 
                          key={i}
                          className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full truncate"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    {item.notes && (
                      <p className="text-muted-foreground text-xs mt-2 line-clamp-1 italic">
                        {item.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(item);
                      }}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                    >
                      <span className="sr-only">Delete</span>
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                      >
                        <path
                          d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H3.5C3.22386 4 3 3.77614 3 3.5ZM3.5 5C3.22386 5 3 5.22386 3 5.5C3 5.77614 3.22386 6 3.5 6H4V12C4 12.5523 4.44772 13 5 13H10C10.5523 13 11 12.5523 11 12V6H11.5C11.7761 6 12 5.777614 12 5.5C12 5.22386 11.7761 5 11.5 5H3.5ZM5 6H10V12H5V6Z"
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                  <span>{item.date.toLocaleDateString()}</span>
                  {item.dateToRemember && (
                    <span className="bg-todo-purple/15 text-todo-purple px-2 py-0.5 rounded-full">
                      {new Date(item.dateToRemember).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DocumentsPage;
