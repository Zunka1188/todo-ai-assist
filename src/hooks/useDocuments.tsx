
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DocumentItem, DocumentFile, DocumentCategory, CATEGORIES } from '@/components/features/documents/types';
import { getFileTypeFromName } from '@/components/features/documents/FilePreview';

// Sample initial items for categories
const initialCategoryItems: DocumentItem[] = [
  {
    id: '1',
    title: 'Summer Outfit Idea',
    category: 'style',
    type: 'image',
    content: 'https://picsum.photos/id/64/400/300',
    tags: ['summer', 'casual'],
    date: new Date(2025, 3, 1),
    addedDate: new Date(2025, 3, 4)
  },
  {
    id: '2',
    title: 'Healthy Smoothie Recipe',
    category: 'recipes',
    type: 'note',
    content: 'Blend 1 banana, 1 cup spinach, 1/2 cup blueberries, 1 tbsp chia seeds, and almond milk.',
    tags: ['healthy', 'breakfast'],
    date: new Date(2025, 3, 2),
    addedDate: new Date(2025, 3, 3)
  },
  {
    id: '3',
    title: 'Paris Trip Ideas',
    category: 'travel',
    type: 'note',
    content: 'Visit Eiffel Tower, Louvre Museum, Notre-Dame Cathedral, and try local pastries.',
    tags: ['europe', 'vacation'],
    date: new Date(2025, 3, 3),
    addedDate: new Date(2025, 3, 3)
  },
  {
    id: '4',
    title: 'Weekly Workout Plan',
    category: 'fitness',
    type: 'note',
    content: 'Monday: Upper body, Tuesday: Lower body, Wednesday: Rest, Thursday: HIIT, Friday: Full body, Weekend: Active recovery',
    tags: ['workout', 'routine'],
    date: new Date(2025, 3, 4),
    addedDate: new Date(2025, 3, 2)
  },
  {
    id: '5',
    title: 'Winter Fashion Collection',
    category: 'style',
    type: 'image',
    content: 'https://picsum.photos/id/96/400/300',
    tags: ['winter', 'fashion'],
    date: new Date(2025, 3, 5),
    addedDate: new Date(2025, 3, 1)
  }
];

// Mock data for files
const initialFiles: DocumentFile[] = [
  { id: '1', title: 'Resume', category: 'other', date: '2025-03-15', fileType: 'pdf', fileUrl: 'https://picsum.photos/id/24/400/300' },
  { id: '2', title: 'Project Plan', category: 'other', date: '2025-03-20', fileType: 'word', fileUrl: 'https://picsum.photos/id/25/400/300' },
  { id: '3', title: 'Vacation Itinerary', category: 'travel', date: '2025-03-25', fileType: 'text', fileUrl: 'https://picsum.photos/id/26/400/300' },
  { id: '4', title: 'Lease Agreement', category: 'files', date: '2025-03-10', fileType: 'pdf', fileUrl: 'https://picsum.photos/id/27/400/300' },
  { id: '5', title: 'Budget Spreadsheet', category: 'files', date: '2025-03-05', fileType: 'excel', fileUrl: 'https://picsum.photos/id/28/400/300' },
];

export function useDocuments() {
  const [categoryItems, setCategoryItems] = useState<DocumentItem[]>(initialCategoryItems);
  const [files, setFiles] = useState<DocumentFile[]>(initialFiles);
  const { toast } = useToast();

  // Format date to be more readable with improved relative date recognition
  const formatDateRelative = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
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
    if (editingItem) {
      // Update existing item
      setCategoryItems(categoryItems.map(existingItem => existingItem.id === editingItem.id ? {
        ...item,
        category: item.category as DocumentCategory,
        content: item.description || item.content || '',
        file: item.file || null,
        fileName: item.fileName || undefined,
        fileType: item.fileType || undefined,
        date: new Date(item.date || Date.now()),
        addedDate: editingItem.addedDate
      } : existingItem));
      toast({
        title: "Item Updated",
        description: `"${item.title}" has been updated`
      });
    } else {
      // Add new item
      const now = new Date();
      const newItem: DocumentItem = {
        id: Date.now().toString(),
        title: item.title,
        category: item.category as DocumentCategory,
        type: item.file && getFileTypeFromName(item.fileName || '') === 'image' ? 'image' : 'note',
        content: item.description || '',
        tags: item.tags || [],
        date: new Date(item.date || now),
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
