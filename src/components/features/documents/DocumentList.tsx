
import React, { useState } from 'react';
import { File, Image, FileText, Folder, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Document {
  id: string;
  name: string;
  type: 'document' | 'image' | 'note';
  category: string;
  date: Date;
}

interface FolderType {
  id: string;
  name: string;
}

// Sample documents
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
  },
  {
    id: '7',
    name: 'Vacation Photos',
    type: 'image',
    category: 'Travel',
    date: new Date(2025, 3, 10)
  },
  {
    id: '8',
    name: 'Cooking Recipe',
    type: 'note',
    category: 'Cooking',
    date: new Date(2025, 3, 15)
  }
];

// Initial folders plus the default categories
const initialFolders: FolderType[] = [
  { id: 'all', name: 'All' },
  { id: 'personal', name: 'Personal' },
  { id: 'work', name: 'Work' },
  { id: 'travel', name: 'Travel' },
  { id: 'images', name: 'Images' },
  { id: 'notes', name: 'Notes' },
  { id: 'cooking', name: 'Cooking' }
];

const DocumentList: React.FC = () => {
  const [documents] = useState<Document[]>(initialDocuments);
  const [folders, setFolders] = useState<FolderType[]>(initialFolders);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [newFolderName, setNewFolderName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const createFolder = () => {
    if (newFolderName.trim() === '') return;
    
    const newFolder: FolderType = {
      id: newFolderName.toLowerCase().replace(/\s+/g, '-'),
      name: newFolderName.trim()
    };
    
    setFolders([...folders, newFolder]);
    setNewFolderName('');
    setIsDialogOpen(false);
  };

  const filteredDocuments = selectedFolder === 'all'
    ? documents
    : selectedFolder === 'images'
      ? documents.filter(doc => doc.type === 'image')
      : selectedFolder === 'notes'
        ? documents.filter(doc => doc.type === 'note')
        : documents.filter(doc => doc.category.toLowerCase() === selectedFolder.toLowerCase());

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
        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => setSelectedFolder(folder.id)}
            className={cn(
              "py-1.5 px-3 rounded-full text-sm whitespace-nowrap",
              selectedFolder === folder.id
                ? "bg-todo-purple text-white"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {folder.name}
          </button>
        ))}
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="py-1.5 px-3 rounded-full text-sm whitespace-nowrap bg-secondary/50 text-secondary-foreground hover:bg-secondary/80 flex items-center gap-1">
              <Plus size={14} />
              New Folder
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create a new folder</DialogTitle>
              <DialogDescription>
                Enter a name for your new folder to organize your documents.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="folder-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="folder-name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Recipes, Projects, etc."
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={createFolder} type="submit">Create Folder</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
