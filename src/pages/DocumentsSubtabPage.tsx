import React, { useState, useRef } from 'react';
import { ArrowLeft, Search, Plus, FileText, Image, Tag, ChefHat, Plane, Dumbbell, Shirt, X, Maximize2, Minimize2, Camera } from 'lucide-react';
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
import { ResponsiveButton } from '@/components/ui/responsive-button';
import ImageAnalysisModal from '@/components/features/documents/ImageAnalysisModal';
import { AnalysisResult } from '@/utils/imageAnalysis';
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

// Define the tab types
type DocumentCategory = 'other' | 'style' | 'recipes' | 'travel' | 'fitness' | 'files';

// Define the item type
interface DocumentItem {
  id: string;
  title: string;
  category: DocumentCategory;
  type: 'image' | 'note';
  content: string;
  tags: string[];
  date: Date;
}

// Sample initial data
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
  },
  {
    id: '7',
    title: 'General Notes',
    category: 'other',
    type: 'note',
    content: 'Some miscellaneous notes that don\'t fit into other categories.',
    tags: ['general', 'misc'],
    date: new Date(2025, 3, 7)
  },
  {
    id: '8',
    title: 'Document File',
    category: 'files',
    type: 'note',
    content: 'This is a sample file in the files category.',
    tags: ['document', 'file'],
    date: new Date(2025, 3, 8)
  }
];

const DocumentsSubtabPage = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<DocumentItem[]>(initialItems);
  const [activeTab, setActiveTab] = useState<DocumentCategory>('style');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DocumentItem | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [itemType, setItemType] = useState<'note' | 'image'>('note');
  const [content, setContent] = useState('');
  const [itemTags, setItemTags] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Image handling states
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageToAnalyze, setImageToAnalyze] = useState<string | null>(null);
  
  // Full screen image preview
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const goBack = () => {
    navigate('/documents');
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
      case 'other':
        return <FileText className="h-5 w-5" />;
      case 'files':
        return <Tag className="h-5 w-5" />;
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
    }
    setAddDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Generate preview URL
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const imageData = event.target.result as string;
        setImagePreview(imageData);
        setContent(imageData);
        
        // Trigger AI analysis
        setIsAnalyzingImage(true);
        setImageToAnalyze(imageData);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setIsAnalyzingImage(false);
    
    if (result) {
      // Populate form with AI analysis results
      if (result.title) setTitle(result.title);
      if (result.category) {
        // Update active tab to match the detected category if possible
        const lowerCategory = result.category.toLowerCase() as DocumentCategory;
        if (['style', 'recipes', 'travel', 'fitness', 'other', 'files'].includes(lowerCategory)) {
          setActiveTab(lowerCategory);
        }
      }
      if (result.tags) setItemTags(result.tags.join(', '));
      if (result.description) setContent(result.description);
      
      toast({
        title: "AI Analysis Complete",
        description: "We've pre-filled some fields based on your image.",
      });
    }
  };

  const handleSaveItem = () => {
    if (title.trim() === '') {
      toast({
        title: "Title Required",
        description: "Please enter a title for your item",
        variant: "destructive",
      });
      return;
    }

    if ((itemType === 'note' && content.trim() === '') || 
        (itemType === 'image' && !imagePreview)) {
      toast({
        title: "Content Required",
        description: `Please add ${itemType === 'note' ? 'text content' : 'an image'}`,
        variant: "destructive",
      });
      return;
    }

    const tags = itemTags.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    const newItem: DocumentItem = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      title: title.trim(),
      category: activeTab,
      type: itemType,
      content: content,
      tags: tags,
      date: editingItem ? editingItem.date : new Date()
    };

    if (editingItem) {
      // Update existing item
      setItems(items.map(item => 
        item.id === editingItem.id ? newItem : item
      ));
      toast({
        title: "Item Updated",
        description: `"${title}" has been updated`,
      });
    } else {
      // Add new item
      setItems([...items, newItem]);
      toast({
        title: "Item Added",
        description: `"${title}" has been added to your ${activeTab} collection`,
      });
    }

    // Clear form and close dialog
    setAddDialogOpen(false);
    setTitle('');
    setContent('');
    setItemTags('');
    setImagePreview(null);
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast({
      title: "Item Removed",
      description: "The item has been deleted",
    });
  };

  const openFullScreenImage = (imageUrl: string) => {
    setFullScreenImage(imageUrl);
  };

  const closeFullScreenImage = () => {
    setFullScreenImage(null);
  };

  // Filter items based on active tab and search term
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
          aria-label="Go back to documents"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <AppHeader 
            title="Categories" 
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
      
      {/* Category Tabs */}
      <div className="mb-4">
        <Tabs 
          defaultValue="style" 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as DocumentCategory)} 
          className="w-full"
        >
          <TabsList className="grid grid-cols-5 w-full">
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
            <TabsTrigger value="other" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className={isMobile ? "hidden" : "inline"}>Other</span>
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span className={isMobile ? "hidden" : "inline"}>Files</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="style" className="mt-0 pt-4">
            <DocumentItemsList 
              items={filteredItems}
              getTypeIcon={getTypeIcon}
              onEdit={handleOpenAddDialog}
              onDelete={handleDeleteItem}
              onViewImage={openFullScreenImage}
            />
          </TabsContent>
          
          <TabsContent value="recipes" className="mt-0 pt-4">
            <DocumentItemsList 
              items={filteredItems}
              getTypeIcon={getTypeIcon}
              onEdit={handleOpenAddDialog}
              onDelete={handleDeleteItem}
              onViewImage={openFullScreenImage}
            />
          </TabsContent>
          
          <TabsContent value="travel" className="mt-0 pt-4">
            <DocumentItemsList 
              items={filteredItems}
              getTypeIcon={getTypeIcon}
              onEdit={handleOpenAddDialog}
              onDelete={handleDeleteItem}
              onViewImage={openFullScreenImage}
            />
          </TabsContent>
          
          <TabsContent value="fitness" className="mt-0 pt-4">
            <DocumentItemsList 
              items={filteredItems}
              getTypeIcon={getTypeIcon}
              onEdit={handleOpenAddDialog}
              onDelete={handleDeleteItem}
              onViewImage={openFullScreenImage}
            />
          </TabsContent>
          
          <TabsContent value="other" className="mt-0 pt-4">
            <DocumentItemsList 
              items={filteredItems}
              getTypeIcon={getTypeIcon}
              onEdit={handleOpenAddDialog}
              onDelete={handleDeleteItem}
              onViewImage={openFullScreenImage}
            />
          </TabsContent>
          
          <TabsContent value="files" className="mt-0 pt-4">
            <DocumentItemsList 
              items={filteredItems}
              getTypeIcon={getTypeIcon}
              onEdit={handleOpenAddDialog}
              onDelete={handleDeleteItem}
              onViewImage={openFullScreenImage}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Item Dialog */}
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
              <Label htmlFor="title">Title</Label>
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
                    onChange={() => setItemType("note")}
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
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1"
                    >
                      <Image className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCameraCapture}
                      className="flex-1"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      ref={cameraInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
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
              </div>
            )}

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
              onClick={() => setAddDialogOpen(false)}
              className={cn(isMobile && "w-full")}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveItem}
              className={cn("bg-todo-purple hover:bg-todo-purple/90", isMobile && "w-full")}
            >
              {editingItem ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Screen Image Viewer */}
      {fullScreenImage && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="p-4 flex justify-between items-center bg-black/80">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white" 
              onClick={closeFullScreenImage}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex-1 flex items-center justify-center overflow-auto">
            <img 
              src={fullScreenImage} 
              alt="Full screen preview" 
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </div>
      )}

      {/* AI Image Analysis Modal */}
      <ImageAnalysisModal
        imageData={imageToAnalyze}
        isOpen={isAnalyzingImage}
        onAnalysisComplete={handleAnalysisComplete}
        onClose={() => setIsAnalyzingImage(false)}
      />
    </div>
  );
};

// Extracted DocumentItemsList component
interface DocumentItemsListProps {
  items: DocumentItem[];
  getTypeIcon: (type: 'image' | 'note') => React.ReactNode;
  onEdit: (item: DocumentItem) => void;
  onDelete: (id: string) => void;
  onViewImage: (imageUrl: string) => void;
}

const DocumentItemsList: React.FC<DocumentItemsListProps> = ({ 
  items, 
  getTypeIcon, 
  onEdit,
  onDelete,
  onViewImage
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
                      onViewImage(item.content);
                    }}
                  >
                    <Maximize2 className="h-4 w-4 text-white" />
                  </Button>
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
                          d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H3.5C3.22386 4 3 3.77614 3 3.5ZM3.5 5C3.22386 5 3 5.22386 3 5.5C3 5.77614 3.22386 6 3.5 6H4V12C4 12.5523 4.44772 13 5 13H10C10.5523 13 11 12.5523 11 12V6H11.5C11.7761 6 12 5.77614 12 5.5C12 5.22386 11.7761 5 11.5 5H3.5ZM5 6H10V12H5V6Z"
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {item.date.toLocaleDateString()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DocumentsSubtabPage;
