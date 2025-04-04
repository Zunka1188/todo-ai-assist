
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Plus, Tag, Shirt, ChefHat, Plane, Dumbbell, FileText, X, Maximize2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import AppHeader from '@/components/layout/AppHeader';
import AddDocumentDialog from '@/components/features/documents/AddDocumentDialog';

// Mock document item type
interface DocumentItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  date: string;
  image?: string | null;
}

const CATEGORIES = ['Style', 'Recipes', 'Travel', 'Fitness', 'Other'];

const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editItem, setEditItem] = useState<DocumentItem | null>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    // Load from localStorage if available
    const savedDocs = localStorage.getItem('documents');
    return savedDocs ? JSON.parse(savedDocs) : [
      {
        id: '1',
        title: 'Summer Fashion Ideas',
        description: 'Collection of outfit ideas for summer season',
        category: 'Style',
        tags: ['summer', 'fashion', 'outfits'],
        date: '2025-03-15',
        image: 'https://picsum.photos/id/64/800/400'
      },
      {
        id: '2',
        title: 'Italian Pasta Recipe',
        description: 'Homemade pasta recipe with simple ingredients',
        category: 'Recipes',
        tags: ['pasta', 'italian', 'dinner'],
        date: '2025-03-10',
        image: 'https://picsum.photos/id/292/800/400'
      },
      {
        id: '3',
        title: 'Japan Trip Plan',
        description: 'Itinerary for upcoming Japan vacation',
        category: 'Travel',
        tags: ['japan', 'vacation', 'itinerary'],
        date: '2025-04-20',
        image: 'https://picsum.photos/id/164/800/400'
      },
      {
        id: '4',
        title: 'Weekly Workout Plan',
        description: 'Core strength workout routine',
        category: 'Fitness',
        tags: ['workout', 'core', 'strength'],
        date: '2025-03-05',
        image: 'https://picsum.photos/id/176/800/400'
      },
      {
        id: '5',
        title: 'Miscellaneous Notes',
        description: 'General notes and information',
        category: 'Other',
        tags: ['notes', 'general', 'misc'],
        date: '2025-03-20',
        image: null
      }
    ];
  });

  // Save documents to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('documents', JSON.stringify(documents));
  }, [documents]);

  const goBack = () => {
    navigate('/');
  };

  const handleAddItem = (item: DocumentItem) => {
    if (isEditMode && editItem) {
      // Update existing item
      setDocuments(prev => prev.map(doc => doc.id === editItem.id ? item : doc));
      setIsEditMode(false);
      setEditItem(null);
      toast({
        title: "Item updated",
        description: "The item has been updated successfully",
      });
    } else {
      // Add new item
      setDocuments(prev => [...prev, item]);
      toast({
        title: "Item added",
        description: "The item has been added successfully",
      });
    }
  };

  const handleDeleteItem = (id: string) => {
    setDocuments(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Item deleted",
      description: "The item has been removed",
    });
  };

  const handleEditItem = (item: DocumentItem) => {
    setEditItem(item);
    setIsEditMode(true);
    setIsAddDialogOpen(true);
  };

  const openFullScreen = (imageUrl: string | null) => {
    if (imageUrl) {
      setFullScreenImage(imageUrl);
    }
  };

  const closeFullScreen = () => {
    setFullScreenImage(null);
  };

  // Get category icon component
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Style':
        return <Shirt className="h-4 w-4 mr-2" />;
      case 'Recipes':
        return <ChefHat className="h-4 w-4 mr-2" />;
      case 'Travel':
        return <Plane className="h-4 w-4 mr-2" />;
      case 'Fitness':
        return <Dumbbell className="h-4 w-4 mr-2" />;
      case 'Other':
        return <FileText className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };

  // Filter documents by category and search term
  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = doc.category === activeCategory;
    const matchesSearch = searchTerm === '' || 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4 py-4 h-full flex flex-col">
      <div className="flex items-center mb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={goBack} 
          className="mr-2"
          aria-label="Go back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <AppHeader title="Documents" subtitle="Manage your files, notes, and documents" className="py-0" />
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 my-3">
        <Button 
          className="bg-todo-purple hover:bg-todo-purple/90 text-white gap-2 h-10 sm:w-auto w-full flex justify-center items-center" 
          onClick={() => {
            setIsEditMode(false);
            setEditItem(null);
            setIsAddDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Add New Item</span>
        </Button>
        
        <div className="relative w-full sm:w-auto sm:max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input 
            type="search" 
            placeholder="Search documents..." 
            className="pl-8 h-10 w-full" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue={activeCategory} value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid grid-cols-5 w-full">
          {CATEGORIES.map(category => (
            <TabsTrigger key={category} value={category} className="flex items-center justify-center gap-1">
              {getCategoryIcon(category)}
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {CATEGORIES.map(category => (
          <TabsContent key={category} value={category} className="mt-4">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No items in this category yet</p>
                <Button 
                  variant="link" 
                  className="text-todo-purple mt-2"
                  onClick={() => {
                    setIsEditMode(false);
                    setEditItem(null);
                    setIsAddDialogOpen(true);
                  }}
                >
                  Add your first item
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredDocuments.map(doc => (
                  <div key={doc.id} className="border rounded-lg overflow-hidden bg-card">
                    {doc.image ? (
                      <div className="relative h-64 overflow-hidden">
                        <img 
                          src={doc.image} 
                          alt={doc.title} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                          <h3 className="text-xl font-medium text-white">{doc.title}</h3>
                          {doc.description && (
                            <p className="text-sm text-white/90 mt-1">
                              {doc.description}
                            </p>
                          )}
                          
                          <div className="flex justify-between items-end mt-2">
                            <div className="flex flex-wrap gap-1">
                              {doc.tags && doc.tags.length > 0 && doc.tags.map((tag, index) => (
                                <span 
                                  key={index}
                                  className="bg-black/30 text-white text-xs px-2 py-1 rounded-full flex items-center"
                                >
                                  <Tag className="h-3 w-3 mr-1 opacity-70" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <div className="text-xs text-white/80">
                              {new Date(doc.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="absolute top-3 right-3 flex gap-1">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            className="h-8 w-8 p-0 bg-black/20 hover:bg-black/40"
                            onClick={(e) => {
                              e.stopPropagation();
                              openFullScreen(doc.image);
                            }}
                          >
                            <Maximize2 className="h-4 w-4 text-white" />
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="sm"
                            className="h-8 w-8 p-0 bg-black/20 hover:bg-black/40"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditItem(doc);
                            }}
                          >
                            <Edit className="h-4 w-4 text-white" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            className="h-8 w-8 p-0 bg-red-500/60 hover:bg-red-500/80"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteItem(doc.id);
                            }}
                          >
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
                      <div className="p-6 border-l-4 border-gray-300">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-medium">{doc.title}</h3>
                            
                            {doc.description && (
                              <p className="text-muted-foreground mt-2">
                                {doc.description}
                              </p>
                            )}
                            
                            {doc.date && (
                              <div className="text-xs text-muted-foreground mt-2">
                                {new Date(doc.date).toLocaleDateString()}
                              </div>
                            )}
                            
                            {doc.tags && doc.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {doc.tags.map((tag, index) => (
                                  <span 
                                    key={index}
                                    className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full flex items-center"
                                  >
                                    <Tag className="h-3 w-3 mr-1 opacity-70" />
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-1 ml-2 mt-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditItem(doc)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleDeleteItem(doc.id)}
                            >
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
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      
      <AddDocumentDialog
        open={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          setIsEditMode(false);
          setEditItem(null);
        }}
        onAdd={handleAddItem}
        currentCategory={activeCategory}
        categories={CATEGORIES}
        isEditing={isEditMode}
        editItem={editItem}
      />

      {/* Full screen image viewer */}
      {fullScreenImage && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="p-4 flex justify-between items-center bg-black/80">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white" 
              onClick={closeFullScreen}
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
    </div>
  );
};

export default DocumentsPage;
