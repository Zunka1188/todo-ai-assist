
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Plus, Tag, Shirt, ChefHat, Plane, Dumbbell, FileText } from 'lucide-react';
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
        image: null
      },
      {
        id: '2',
        title: 'Italian Pasta Recipe',
        description: 'Homemade pasta recipe with simple ingredients',
        category: 'Recipes',
        tags: ['pasta', 'italian', 'dinner'],
        date: '2025-03-10',
        image: null
      },
      {
        id: '3',
        title: 'Japan Trip Plan',
        description: 'Itinerary for upcoming Japan vacation',
        category: 'Travel',
        tags: ['japan', 'vacation', 'itinerary'],
        date: '2025-04-20',
        image: null
      },
      {
        id: '4',
        title: 'Weekly Workout Plan',
        description: 'Core strength workout routine',
        category: 'Fitness',
        tags: ['workout', 'core', 'strength'],
        date: '2025-03-05',
        image: null
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
    setDocuments(prev => [...prev, item]);
  };

  const handleDeleteItem = (id: string) => {
    setDocuments(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Item deleted",
      description: "The item has been removed",
    });
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
          onClick={() => setIsAddDialogOpen(true)}
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
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  Add your first item
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map(doc => (
                  <div key={doc.id} className="border rounded-lg overflow-hidden bg-card">
                    {doc.image && (
                      <div className="h-40 overflow-hidden">
                        <img 
                          src={doc.image} 
                          alt={doc.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-medium">{doc.title}</h3>
                      
                      {doc.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {doc.description}
                        </p>
                      )}
                      
                      {doc.date && (
                        <div className="text-xs text-muted-foreground mt-2">
                          {new Date(doc.date).toLocaleDateString()}
                        </div>
                      )}
                      
                      {doc.tags && doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
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
                      
                      <div className="flex justify-end mt-4">
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteItem(doc.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      
      <AddDocumentDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddItem}
        currentCategory={activeCategory}
        categories={CATEGORIES}
      />
    </div>
  );
};

export default DocumentsPage;
