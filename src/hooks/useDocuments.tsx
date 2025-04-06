
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DocumentItem, DocumentFile, DocumentCategory, CATEGORIES } from '@/components/features/documents/types';
import { getFileTypeFromName } from '@/components/features/documents/FilePreview';

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
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
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
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.txt'
  },
  { 
    id: '4', 
    title: 'Fitness Tracker', 
    category: 'fitness', 
    date: yesterday.toISOString(), 
    fileType: 'excel', 
    fileUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQEekTKR81PXX3Tlb3GktI_CX3ZEZLpRvaXgxK0IEV-wrjrRrR0gUP7tnmWE2K74pZrOW7kvTQpCVQu/pub?output=xlsx'
  },
  { 
    id: '5', 
    title: 'Winter Style Guide', 
    category: 'style', 
    date: twoDaysAgo.toISOString(), 
    fileType: 'word', 
    fileUrl: 'https://www.africau.edu/images/default/sample.pdf' // Using PDF as fallback since Word docs aren't easily embedded
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
    category: 'work', 
    date: yesterday.toISOString(), 
    fileType: 'excel', 
    fileUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRmbGVdWTZ0lzHjX5NU94xNvlh-GWz9rTm-7g3zAuQS4MRuJHDCzOPDVqW9TJEmQw/pub?output=xlsx'
  },
  { 
    id: '9', 
    title: 'Project Proposal', 
    category: 'work', 
    date: twoDaysAgo.toISOString(), 
    fileType: 'word', 
    fileUrl: 'https://www.africau.edu/images/default/sample.pdf' // Using PDF as fallback since Word docs aren't easily embedded
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

export function useDocuments() {
  const [categoryItems, setCategoryItems] = useState<DocumentItem[]>(initialCategoryItems);
  const [files, setFiles] = useState<DocumentFile[]>(initialFiles);
  const { toast } = useToast();

  // Format date to be more readable with improved relative date recognition
  const formatDateRelative = (date: Date) => {
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
  };

  // Filter documents based on category and search term
  const filterDocuments = (
    items: DocumentItem[], 
    category: DocumentCategory, 
    searchTerm: string
  ): DocumentItem[] => {
    return items.filter(item => 
      item.category === category && 
      (searchTerm === '' || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  };

  // Filter files based on search term and optional categories
  const filterFiles = (
    files: DocumentFile[], 
    searchTerm: string,
    categories?: DocumentCategory[]
  ): DocumentFile[] => {
    return searchTerm 
      ? files.filter(doc => 
          doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : files;
  };

  // Add or update document item
  const handleAddOrUpdateItem = (item: any, editingItem: DocumentItem | null = null) => {
    const now = new Date();
    
    if (editingItem) {
      // Update existing item
      setCategoryItems(categoryItems.map(existingItem => existingItem.id === editingItem.id ? {
        ...item,
        category: item.category as DocumentCategory,
        content: item.description || item.content || '',
        file: item.file || null,
        fileName: item.fileName || undefined,
        fileType: item.fileType || undefined,
        // For documents, ensure we never use future dates
        date: new Date(Math.min(new Date(item.date || now).getTime(), now.getTime())),
        addedDate: editingItem.addedDate
      } : existingItem));
      toast({
        title: "Item Updated",
        description: `"${item.title}" has been updated`
      });
    } else {
      // Add new item
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
      setCategoryItems([...categoryItems, newItem]);
      toast({
        title: "Item Added",
        description: `"${item.title}" has been added to your collection`
      });
    }
  };

  // Delete document item
  const handleDeleteItem = (id: string) => {
    setCategoryItems(categoryItems.filter(item => item.id !== id));
    toast({
      title: "Item Removed",
      description: "The item has been deleted"
    });
  };

  // Add or update file
  const handleAddOrUpdateFile = (file: DocumentFile, isEditing: boolean = false) => {
    if (isEditing) {
      setFiles(files.map(f => f.id === file.id ? file : f));
      toast({
        title: "File Updated",
        description: `"${file.title}" has been updated`
      });
    } else {
      setFiles([...files, { ...file, id: Date.now().toString() }]);
      toast({
        title: "File Added",
        description: `"${file.title}" has been added to your files`
      });
    }
  };

  // Delete file
  const handleDeleteFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
    toast({
      title: "File Removed",
      description: "The file has been deleted"
    });
  };

  return {
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
  };
}
