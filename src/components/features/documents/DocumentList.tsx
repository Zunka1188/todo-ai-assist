
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
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const isMobile = useIsMobile();

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

  // Mobile view uses Tabs instead of horizontal scrolling categories
  if (isMobile) {
    return (
      <div className="space-y-4">
        <Tabs defaultValue="all" onValueChange={setSelectedFolder} className="w-full">
          <TabsList className="w-full flex justify-start overflow-x-auto pb-1 scrollbar-none">
            {folders.slice(0, 5).map((folder) => (
              <TabsTrigger 
                key={folder.id} 
                value={folder.id}
                className="px-3 py-1.5 text-sm whitespace-nowrap flex-shrink-0"
              >
                {folder.name}
              </TabsTrigger>
            ))}
            <TabsTrigger 
              value="more" 
              className="px-3 py-1.5 text-sm whitespace-nowrap flex-shrink-0"
            >
              More
            </TabsTrigger>
          </TabsList>
          
          {folders.slice(0, 5).map((folder) => (
            <TabsContent key={folder.id} value={folder.id} className="mt-2">
              <DocumentGrid 
                documents={
                  folder.id === 'all'
                    ? documents
                    : folder.id === 'images'
                      ? documents.filter(doc => doc.type === 'image')
                      : folder.id === 'notes'
                        ? documents.filter(doc => doc.type === 'note')
                        : documents.filter(doc => doc.category.toLowerCase() === folder.id.toLowerCase())
                }
                getDocumentIcon={getDocumentIcon}
              />
            </TabsContent>
          ))}
          
          <TabsContent value="more">
            <div className="grid grid-cols-2 gap-2 mt-2">
              {folders.slice(5).map((folder) => (
                <Button
                  key={folder.id}
                  variant="outline"
                  className="justify-start p-2 h-auto"
                  onClick={() => setSelectedFolder(folder.id)}
                >
                  <Folder className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{folder.name}</span>
                </Button>
              ))}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start p-2 h-auto"
                  >
                    <Plus className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">New Folder</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[calc(100%-32px)] p-4">
                  <DialogHeader>
                    <DialogTitle>Create a new folder</DialogTitle>
                    <DialogDescription>
                      Enter a name for your new folder.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 items-center gap-4">
                      <Label htmlFor="folder-name" className="mb-1">
                        Name
                      </Label>
                      <Input
                        id="folder-name"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        className="w-full"
                        placeholder="e.g., Recipes, Projects, etc."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={createFolder} type="submit" className="w-full">Create Folder</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {selectedFolder !== 'all' && 
              selectedFolder !== 'images' && 
              selectedFolder !== 'notes' && 
              !folders.slice(0, 5).some(f => f.id === selectedFolder) && (
              <DocumentGrid 
                documents={documents.filter(doc => doc.category.toLowerCase() === selectedFolder.toLowerCase())}
                getDocumentIcon={getDocumentIcon}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Desktop view with horizontal scrolling categories
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

      <DocumentGrid 
        documents={filteredDocuments}
        getDocumentIcon={getDocumentIcon}
      />
    </div>
  );
};

// Extracted DocumentGrid component for reuse
interface DocumentGridProps {
  documents: Document[];
  getDocumentIcon: (type: string) => React.ReactNode;
}

const DocumentGrid: React.FC<DocumentGridProps> = ({ documents, getDocumentIcon }) => {
  const isMobile = useIsMobile();
  
  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <Folder className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">No documents found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload or create documents to see them here
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid gap-3">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="bg-todo-purple bg-opacity-10 p-2 rounded-lg mr-3 flex-shrink-0">
            {getDocumentIcon(doc.type)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-todo-black truncate">
              {doc.name}
            </h4>
            <div className={cn(
              "flex items-center text-xs text-muted-foreground mt-1",
              isMobile && "flex-wrap gap-1"
            )}>
              <span className="truncate">
                {doc.date.toLocaleDateString()}
              </span>
              {!isMobile && <span className="mx-1.5">•</span>}
              <span className="bg-secondary/50 px-2 py-0.5 rounded-full truncate">
                {doc.category}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentList;
