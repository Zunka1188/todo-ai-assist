
import React, { useState } from 'react';
import { File, Image, FileText, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Document {
  id: string;
  name: string;
  type: 'document' | 'image' | 'note';
  category: string;
  date: Date;
}

// Sample documents without receipts
const initialDocuments: Document[] = [
  {
    id: '2',
    name: 'Flight Ticket',
    type: 'document',
    category: 'Travel',
    date: new Date(2025, 2, 28)
  },
  {
    id: '4',
    name: 'Product Manual',
    type: 'document',
    category: 'Work',
    date: new Date(2025, 3, 3)
  },
  {
    id: '5',
    name: 'Family Photo',
    type: 'image',
    category: 'Personal',
    date: new Date(2025, 3, 4)
  },
  {
    id: '6',
    name: 'Meeting Notes',
    type: 'note',
    category: 'Work',
    date: new Date(2025, 3, 5)
  }
];

const categories = [
  'All',
  'Personal',
  'Work',
  'Travel',
  'Images',
  'Notes'
];

const DocumentList: React.FC = () => {
  const [documents] = useState<Document[]>(initialDocuments);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredDocuments = selectedCategory === 'All'
    ? documents
    : selectedCategory === 'Images'
      ? documents.filter(doc => doc.type === 'image')
      : selectedCategory === 'Notes'
        ? documents.filter(doc => doc.type === 'note')
        : documents.filter(doc => doc.category === selectedCategory);

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="text-blue-500" size={20} />;
      case 'note':
        return <FileText className="text-green-500" size={20} />;
      default:
        return <File className="text-todo-purple" size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              "py-1.5 px-3 rounded-full text-sm whitespace-nowrap",
              selectedCategory === category
                ? "bg-todo-purple text-white"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredDocuments.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="bg-todo-purple bg-opacity-10 p-2 rounded-lg mr-3">
              {getDocumentIcon(doc.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-todo-black truncate">
                {doc.name}
              </h4>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <span className="truncate">
                  {doc.date.toLocaleDateString()}
                </span>
                <span className="mx-1.5">•</span>
                <span className="bg-secondary/50 px-2 py-0.5 rounded-full truncate">
                  {doc.category}
                </span>
              </div>
            </div>
          </div>
        ))}

        {filteredDocuments.length === 0 && (
          <div className="text-center py-8">
            <Folder className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No documents found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload or create documents to see them here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentList;
