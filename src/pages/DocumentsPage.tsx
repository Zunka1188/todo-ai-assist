
import React, { useState } from 'react';
import { ArrowLeft, File, Search, Plus, Tag, ChefHat, Plane, Dumbbell, Shirt, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppHeader from '@/components/layout/AppHeader';
import DocumentList from '@/components/features/documents/DocumentList';
import AddDocumentDialog from '@/components/features/documents/AddDocumentDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// Define the document categories
const categories = [
  'Personal',
  'Work',
  'Travel',
  'Legal',
  'Finance',
  'Health',
  'Education',
  'Other'
];

// Define category tab types
type DocumentCategory = 'style' | 'recipes' | 'travel' | 'fitness' | 'other';

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

// Sample initial items for categories
const initialCategoryItems: DocumentItem[] = [
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
  }
];

const DocumentsPage = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | DocumentCategory>('files');
  const [categoryItems, setCategoryItems] = useState<DocumentItem[]>(initialCategoryItems);
  const [editingItem, setEditingItem] = useState<DocumentItem | null>(null);

  const goBack = () => {
    navigate('/');
  };

  // Default category for new documents
  const currentCategory = 'Personal';

  const handleAddDocument = (document: any) => {
    console.log('Adding document:', document);
    // Logic to add document would go here
    setIsAddDialogOpen(false);
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
      default:
        return null;
    }
  };

  const getTypeIcon = (type: 'image' | 'note') => {
    return type === 'image' 
      ? <File className="h-5 w-5 text-blue-500" /> 
      : <FileText className="h-5 w-5 text-green-500" />;
  };

  const handleOpenAddDialog = (editing: DocumentItem | null = null) => {
    if (editing) {
      setEditingItem(editing);
    } else {
      setEditingItem(null);
    }
    setIsAddDialogOpen(true);
  };

  const handleAddItem = (item: any) => {
    if (activeTab === 'files') {
      handleAddDocument(item);
    } else {
      // Handle category item
      if (editingItem) {
        // Update existing item
        setCategoryItems(categoryItems.map(existingItem => 
          existingItem.id === editingItem.id ? {...item, category: activeTab as DocumentCategory} : existingItem
        ));
        
        toast({
          title: "Item Updated",
          description: `"${item.title}" has been updated`,
        });
      } else {
        // Add new item
        const newItem: DocumentItem = {
          ...item,
          id: Date.now().toString(),
          category: activeTab as DocumentCategory,
          date: new Date()
        };
        
        setCategoryItems([...categoryItems, newItem]);
        
        toast({
          title: "Item Added",
          description: `"${item.title}" has been added to your collection`,
        });
      }
    }
    
    setIsAddDialogOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    setCategoryItems(categoryItems.filter(item => item.id !== id));
    toast({
      title: "Item Removed",
      description: "The item has been deleted",
    });
  };

  // Filter items based on active tab and search term
  const filteredCategoryItems = categoryItems.filter(item => 
    (activeTab !== 'files' && item.category === activeTab) && 
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
            subtitle="Manage your files"
            icon={<File className="h-6 w-6 text-primary" />}
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
            placeholder="Search documents..."
            className="pl-8 h-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Separator className="my-2" />

      {/* Main Tabs */}
      <Tabs 
        defaultValue="categories" 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as 'files' | DocumentCategory)} 
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="files" className="flex items-center gap-2">
            <File className="h-4 w-4" />
            <span>Files</span>
          </TabsTrigger>
          <TabsTrigger value="style" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span>Categories</span>
          </TabsTrigger>
        </TabsList>

        {/* Files Tab Content */}
        <TabsContent value="files" className="mt-4">
          <div className="flex-1 overflow-auto">
            <DocumentList searchTerm={searchTerm} />
          </div>
        </TabsContent>

        {/* Categories Tab Content */}
        <TabsContent value="style" className="mt-2">
          {/* Category Subtabs */}
          <Tabs 
            defaultValue="style" 
            value={activeTab === 'files' ? 'style' : activeTab}
            onValueChange={(value) => setActiveTab(value as DocumentCategory)}
            className="w-full"
          >
            <TabsList className="grid grid-cols-5 w-full mb-4">
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
            </TabsList>

            {/* Category Content */}
            {['style', 'recipes', 'travel', 'fitness', 'other'].map((categoryTab) => (
              <TabsContent key={categoryTab} value={categoryTab}>
                <DocumentItemsList 
                  items={filteredCategoryItems}
                  getTypeIcon={getTypeIcon}
                  onEdit={handleOpenAddDialog}
                  onDelete={handleDeleteItem}
                />
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
      </Tabs>

      <AddDocumentDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddItem}
        categories={categories}
        currentCategory={currentCategory}
        isEditing={!!editingItem}
        editItem={editingItem ? {
          id: editingItem.id,
          title: editingItem.title,
          description: editingItem.content,
          category: editingItem.category as string,
          tags: editingItem.tags,
          date: editingItem.date.toISOString().split('T')[0],
          image: editingItem.type === 'image' ? editingItem.content : null
        } : null}
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
                    variant="outline"
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

export default DocumentsPage;
