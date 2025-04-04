
import React, { useState } from 'react';
import { ArrowLeft, File, Search, Plus } from 'lucide-react';
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

const DocumentsPage = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const goBack = () => {
    navigate('/');
  };

  const handleAddDocument = (document: any) => {
    console.log('Adding document:', document);
    // Logic to add document would go here
    setIsAddDialogOpen(false);
  };

  const subtabs = [
    { name: 'Files', icon: <File className="h-4 w-4 mr-2" />, path: '/documents' },
    { name: 'Categories', badge: 'New', path: '/documents/categories' },
  ];

  const currentPath = '/documents';

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
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Add Document</span>
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

      <div className="flex space-x-1 overflow-auto pb-2 hide-scrollbar">
        {subtabs.map((tab) => (
          <Button
            key={tab.name}
            variant={currentPath === tab.path ? "default" : "outline"}
            className={cn(
              "flex items-center px-3 py-1 h-9 text-sm whitespace-nowrap",
              currentPath === tab.path ? "bg-todo-purple hover:bg-todo-purple/90 text-white" : "hover:bg-accent"
            )}
            onClick={() => navigate(tab.path)}
          >
            {tab.icon}
            {tab.name}
            {tab.badge && (
              <Badge
                variant="outline"
                className="ml-2 bg-background/20 text-white border-transparent text-[10px] px-1.5"
              >
                {tab.badge}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      <div className="flex-1 overflow-auto mt-4">
        <DocumentList searchTerm={searchTerm} />
      </div>

      <AddDocumentDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddDocument}
      />
    </div>
  );
};

export default DocumentsPage;
