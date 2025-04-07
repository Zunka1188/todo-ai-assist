import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DocumentItem, DocumentFile, DocumentCategory } from '@/components/features/documents/types';
import { getFileTypeFromName } from '@/components/features/documents/FilePreview';
import { toast } from 'sonner';

// Get today's date to ensure no future dates
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

const fourDaysAgo = new Date(today);
fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

// Sample initial items for categories
const initialCategoryItems: DocumentItem[] = [
  {
    id: '1',
    title: 'Summer Outfit Idea',
    category: 'style',
    type: 'image',
    content: 'https://picsum.photos/id/64/400/300',
    tags: ['summer', 'casual'],
    date: twoDaysAgo, // 2 days ago
    addedDate: twoDaysAgo
  },
  {
    id: '2',
    title: 'Healthy Smoothie Recipe',
    category: 'recipes',
    type: 'note',
    content: 'Blend 1 banana, 1 cup spinach, 1/2 cup blueberries, 1 tbsp chia seeds, and almond milk.',
    tags: ['healthy', 'breakfast'],
    date: yesterday,
    addedDate: yesterday
  },
  {
    id: '3',
    title: 'Paris Trip Ideas',
    category: 'travel',
    type: 'note',
    content: 'Visit Eiffel Tower, Louvre Museum, Notre-Dame Cathedral, and try local pastries.',
    tags: ['europe', 'vacation'],
    date: today,
    addedDate: today
  },
  {
    id: '4',
    title: 'Weekly Workout Plan',
    category: 'fitness',
    type: 'note',
    content: 'Monday: Upper body, Tuesday: Lower body, Wednesday: Rest, Thursday: HIIT, Friday: Full body, Weekend: Active recovery',
    tags: ['workout', 'routine'],
    date: fourDaysAgo,
    addedDate: fourDaysAgo
  },
  {
    id: '5',
    title: 'Winter Fashion Collection',
    category: 'style',
    type: 'image',
    content: 'https://picsum.photos/id/96/400/300',
    tags: ['winter', 'fashion'],
    date: yesterday,
    addedDate: yesterday
  }
];

// Sample files with various document types for interactive preview
const initialFiles: DocumentFile[] = [
  { 
    id: '1', 
    title: 'Nature Photography Guide', 
    category: 'other', 
    date: twoDaysAgo.toISOString(), 
    fileType: 'pdf', 
    fileUrl: 'https://www.africau.edu/images/default/sample.pdf' // More reliable PDF sample
  },
  { 
    id: '2', 
    title: 'Mountain Landscape', 
    category: 'travel', 
    date: yesterday.toISOString(), 
    fileType: 'image', 
    fileUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e'
  },
  { 
    id: '3', 
    title: 'Smoothie Recipes', 
    category: 'recipes', 
    date: fourDaysAgo.toISOString(), 
    fileType: 'text', 
    fileUrl: 'data:text/plain;charset=utf-8,' + encodeURIComponent(`HEALTHY SMOOTHIE RECIPES

BERRY BLAST SMOOTHIE
- 1 cup mixed berries (strawberries, blueberries, raspberries)
- 1 banana
- 1/2 cup Greek yogurt
- 1/4 cup almond milk
- 1 tablespoon honey
- Ice cubes

GREEN MACHINE SMOOTHIE
- 1 cup spinach
- 1/2 avocado
- 1 green apple
- 1/2 cucumber
- 1 tablespoon lemon juice
- 1/2 cup coconut water
- Ice cubes

TROPICAL PARADISE SMOOTHIE
- 1 cup pineapple chunks
- 1/2 mango
- 1/2 banana
- 1/4 cup coconut milk
- 1/2 cup orange juice
- Ice cubes

PROTEIN POWER SMOOTHIE
- 1 scoop protein powder
- 1 tablespoon peanut butter
- 1 banana
- 1/2 cup oats
- 1 cup almond milk
- 1 tablespoon chia seeds
- Ice cubes`)
  },
  { 
    id: '4', 
    title: 'Fitness Tracker', 
    category: 'fitness', 
    date: yesterday.toISOString(), 
    fileType: 'excel', 
    fileUrl: 'https://file-examples.com/storage/fe52cb0b376493c23d94809/2017/02/file_example_XLS_10.xls'
  },
  { 
    id: '5', 
    title: 'Winter Style Guide', 
    category: 'style', 
    date: twoDaysAgo.toISOString(), 
    fileType: 'pdf', 
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' // Alternative PDF sample
  },
  { 
    id: '6', 
    title: 'Architecture Photography', 
    category: 'other', 
    date: yesterday.toISOString(), 
    fileType: 'image', 
    fileUrl: 'https://images.unsplash.com/photo-1486718448742-163732cd1544'
  },
  { 
    id: '7', 
    title: 'Wildlife Images', 
    category: 'other', 
    date: fourDaysAgo.toISOString(), 
    fileType: 'image', 
    fileUrl: 'https://images.unsplash.com/photo-1466721591366-2d5fba72006d'
  },
  { 
    id: '8', 
    title: 'Monthly Budget Template', 
    category: 'events', 
    date: yesterday.toISOString(), 
    fileType: 'excel', 
    fileUrl: 'https://file-examples.com/storage/fe52cb0b376493c23d94809/2017/02/file_example_XLS_5000.xls'
  },
  { 
    id: '9', 
    title: 'Project Proposal', 
    category: 'events', 
    date: twoDaysAgo.toISOString(), 
    fileType: 'word', 
    fileUrl: 'https://file-examples.com/storage/fe52cb0b376493c23d94809/2017/02/file-sample_100kB.doc'
  },
  { 
    id: '10', 
    title: 'Recipe Collection', 
    category: 'recipes', 
    date: fourDaysAgo.toISOString(), 
    fileType: 'text', 
    fileUrl: 'data:text/plain;charset=utf-8,' + encodeURIComponent(`HEALTHY SMOOTHIE RECIPES

BERRY BLAST SMOOTHIE
- 1 cup mixed berries (strawberries, blueberries, raspberries)
- 1 banana
- 1/2 cup Greek yogurt
- 1/4 cup almond milk
- 1 tablespoon honey
- Ice cubes

GREEN MACHINE SMOOTHIE
- 1 cup spinach
- 1/2 avocado
- 1 green apple
- 1/2 cucumber
- 1 tablespoon lemon juice
- 1/2 cup coconut water
- Ice cubes

TROPICAL PARADISE SMOOTHIE
- 1 cup pineapple chunks
- 1/2 mango
- 1/2 banana
- 1/4 cup coconut milk
- 1/2 cup orange juice
- Ice cubes

PROTEIN POWER SMOOTHIE
- 1 scoop protein powder
- 1 tablespoon peanut butter
- 1 banana
- 1/2 cup oats
- 1 cup almond milk
- 1 tablespoon chia seeds
- Ice cubes`)
  },
];

// Helper function to save data to localStorage
const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`[DEBUG] useDocuments - Saved ${key} to localStorage`);
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    toast.error(`Failed to save ${key}`, { 
      description: "Could not save your data. Please try again."
    });
  }
};

// Helper function to load data from localStorage
const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const storedValue = localStorage.getItem(key);
    if (!storedValue) return defaultValue;
    
    const parsedValue = JSON.parse(storedValue);
    
    if (key === 'documentCategoryItems') {
      // Convert date strings back to Date objects
      return parsedValue.map((item: any) => ({
        ...item,
        date: new Date(item.date),
        addedDate: new Date(item.addedDate)
      })) as T;
    }
    
    return parsedValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    toast.error(`Failed to load ${key}`, {
      description: "Could not retrieve your saved data."
    });
    return defaultValue;
  }
};

export function useDocuments() {
  console.log("useDocuments re-rendered"); // VERIFICATION LOG
  
  // Use state initialization with proper error handling
  const [categoryItems, setCategoryItems] = useState<DocumentItem[]>(() => {
    try {
      return loadFromLocalStorage<DocumentItem[]>('documentCategoryItems', initialCategoryItems);
    } catch (error) {
      console.error("Failed to load document items:", error);
      toast.error("Failed to load documents", {
        description: "An error occurred while loading your documents. Using default data instead."
      });
      return initialCategoryItems;
    }
  });
  
  const [files, setFiles] = useState<DocumentFile[]>(() => {
    try {
      return loadFromLocalStorage<DocumentFile[]>('documentFiles', initialFiles);
    } catch (error) {
      console.error("Failed to load document files:", error);
      toast.error("Failed to load files", {
        description: "An error occurred while loading your files. Using default data instead."
      });
      return initialFiles;
    }
  });
  
  // Save to localStorage whenever data changes - using separate effects to avoid cross-dependencies
  useEffect(() => {
    try {
      // Don't save during the initial render to avoid unnecessary writes
      // Using a ref to track initial render would be better, but keeping it simple
      saveToLocalStorage('documentCategoryItems', categoryItems);
      console.log('[DEBUG] useDocuments - Saved categoryItems to localStorage', categoryItems.length);
    } catch (error) {
      console.error("Error saving category items:", error);
    }
  }, [categoryItems]);
  
  useEffect(() => {
    try {
      saveToLocalStorage('documentFiles', files);
      console.log('[DEBUG] useDocuments - Saved files to localStorage', files.length);
    } catch (error) {
      console.error("Error saving files:", error);
    }
  }, [files]);

  // Format date to be more readable - MEMOIZED
  const formatDateRelative = useCallback((date: Date) => {
    const now = new Date();
    
    // Ensure we're comparing only the date part (without time)
    const stripTime = (d: Date) => {
      const newDate = new Date(d);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    };
    
    const dateWithoutTime = stripTime(date);
    const nowWithoutTime = stripTime(now);
    
    // Calculate difference in days
    const diffMs = nowWithoutTime.getTime() - dateWithoutTime.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
    
    const years = Math.floor(diffDays / 365);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }, []);

  // Filter documents based on category and search term - PROPERLY MEMOIZED
  const filterDocuments = useCallback((
    items: DocumentItem[], 
    category: DocumentCategory, 
    searchTerm: string
  ): DocumentItem[] => {
    try {
      if (!items || !Array.isArray(items)) return [];
      
      return items.filter(item => 
        item.category === category && 
        (searchTerm === '' || 
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.tags && Array.isArray(item.tags) && item.tags.some(tag => 
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          ))
        )
      );
    } catch (error) {
      console.error("Error filtering documents:", error);
      return [];
    }
  }, []);

  // Filter files based on search term - PROPERLY MEMOIZED
  const filterFiles = useCallback((
    files: DocumentFile[], 
    searchTerm: string,
    categories?: DocumentCategory[]
  ): DocumentFile[] => {
    try {
      if (!files || !Array.isArray(files)) return [];
      
      return searchTerm 
        ? files.filter(doc => 
            doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.category.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : files;
    } catch (error) {
      console.error("Error filtering files:", error);
      return [];
    }
  }, []);

  // Memoize CATEGORIES array to ensure it's stable
  const CATEGORIES = useMemo(() => 
    ['style', 'recipes', 'travel', 'fitness', 'events', 'other', 'files'] as DocumentCategory[],
  []);

  // Add or update document item - FIX: Removed inline localStorage saving
  const handleAddOrUpdateItem = useCallback((item: any, editingItem: DocumentItem | null = null) => {
    try {
      const now = new Date();
      
      if (editingItem) {
        // Update existing item with immutable update
        setCategoryItems(prevItems => {
          try {
            const updated = prevItems.map(existingItem => 
              existingItem.id === editingItem.id 
                ? {
                    ...existingItem,
                    title: item.title,
                    category: item.category as DocumentCategory,
                    content: item.description || item.content || '',
                    tags: item.tags || [],
                    file: item.file || null,
                    fileName: item.fileName || undefined,
                    fileType: item.fileType || undefined,
                    // For documents, ensure we never use future dates
                    date: new Date(Math.min(new Date(item.date || now).getTime(), now.getTime()))
                  } 
                : existingItem
            );
            return updated;
          } catch (error) {
            console.error("Error updating item:", error);
            toast.error("Failed to update document", {
              description: "An error occurred while updating the document."
            });
            return prevItems;
          }
        });
      } else {
        // Add new item with immutable update
        try {
          const newItem: DocumentItem = {
            id: Date.now().toString(),
            title: item.title,
            category: item.category as DocumentCategory,
            type: item.file && getFileTypeFromName(item.fileName || '') === 'image' ? 'image' : 'note',
            content: item.description || '',
            tags: item.tags || [],
            // For documents, use current date (never future)
            date: now,
            addedDate: now,
            file: item.file || null,
            fileName: item.fileName || undefined,
            fileType: item.fileType || undefined
          };
          
          setCategoryItems(prevItems => [...prevItems, newItem]);
        } catch (error) {
          console.error("Error adding new item:", error);
          toast.error("Failed to add document", {
            description: "An error occurred while adding the new document."
          });
        }
      }
    } catch (error) {
      console.error("Error in handleAddOrUpdateItem:", error);
      throw error; // Let the calling component handle this error
    }
  }, []);

  // Delete document item - FIX: Removed inline localStorage saving
  const handleDeleteItem = useCallback((id: string) => {
    try {
      setCategoryItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
      throw error; // Let the calling component handle this error
    }
  }, []);

  // Add or update file - FIX: Removed inline localStorage saving
  const handleAddOrUpdateFile = useCallback((file: DocumentFile, isEditing: boolean = false) => {
    try {
      if (isEditing) {
        setFiles(prevFiles => prevFiles.map(f => f.id === file.id ? file : f));
      } else {
        setFiles(prevFiles => [...prevFiles, { ...file, id: Date.now().toString() }]);
      }
    } catch (error) {
      console.error("Error in handleAddOrUpdateFile:", error);
      throw error; // Let the calling component handle this error
    }
  }, []);

  // Delete file - FIX: Removed inline localStorage saving
  const handleDeleteFile = useCallback((id: string) => {
    try {
      setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error; // Let the calling component handle this error
    }
  }, []);

  // CRITICAL: Return all values wrapped in useMemo with ALL dependencies
  return useMemo(() => ({
    categoryItems,
    files,
    filterDocuments,
    filterFiles,
    handleAddOrUpdateItem,
    handleDeleteItem,
    handleAddOrUpdateFile,
    handleDeleteFile,
    formatDateRelative,
    CATEGORIES
  }), [
    categoryItems, 
    files, 
    filterDocuments, 
    filterFiles, 
    handleAddOrUpdateItem, 
    handleDeleteItem, 
    handleAddOrUpdateFile, 
    handleDeleteFile, 
    formatDateRelative, 
    CATEGORIES
  ]);
}
