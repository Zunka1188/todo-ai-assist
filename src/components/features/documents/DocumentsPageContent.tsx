
import React, { useState, useEffect } from 'react';
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Grid, List, Filter, X } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useDocumentActions } from '@/hooks/useDocumentActions';
import { DocumentCategory, DocumentFile, DocumentItem } from './types';
import DocumentList from './DocumentList';
import AddDocumentDialog from './AddDocumentDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

const DocumentsPageContent: React.FC = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const [activeTab, setActiveTab] = useState<DocumentCategory>('style');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const { 
    categoryItems, 
    files, 
    filterDocuments, 
    filterFiles,
    formatDateRelative,
    CATEGORIES 
  } = useDocuments();
  
  const {
    handleAddOrUpdateItem,
    handleDeleteItem,
    handleAddOrUpdateFile,
    handleDeleteFile,
    handleDownloadFile
  } = useDocumentActions({ setIsLoading });

  const filteredItems = filterDocuments(categoryItems, activeTab, searchTerm);
  const filteredFiles = filterFiles(files, searchTerm, [activeTab]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value as DocumentCategory);
  };
  
  const handleAddDocument = (item: any) => {
    handleAddOrUpdateItem(item);
    setIsAddDialogOpen(false);
  };
  
  const handleDeleteDocument = (id: string) => {
    handleDeleteItem(id);
  };
  
  const handleViewModeToggle = () => {
    setViewMode(prev => prev === 'grid' ? 'table' : 'grid');
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
  };
  
  const handleNavigateToSubtab = (subtab: string) => {
    navigate(`/documents/${subtab}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && "border-primary")}
            >
              <Filter className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleViewModeToggle}
            >
              {viewMode === 'grid' ? (
                <List className="h-4 w-4" />
              ) : (
                <Grid className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-todo-purple hover:bg-todo-purple/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Document
            </Button>
          </div>
        </div>
        
        {showFilters && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="cursor-pointer" onClick={() => handleNavigateToSubtab('all')}>
              All Documents
            </Badge>
            <Badge variant="outline" className="cursor-pointer" onClick={() => handleNavigateToSubtab('receipts')}>
              Receipts
            </Badge>
            <Badge variant="outline" className="cursor-pointer" onClick={() => handleNavigateToSubtab('images')}>
              Images
            </Badge>
            <Badge variant="outline" className="cursor-pointer" onClick={() => handleNavigateToSubtab('forms')}>
              Forms
            </Badge>
          </div>
        )}
      </div>
      
      <TabsList className="grid grid-cols-5 h-auto">
        {CATEGORIES.map((category) => (
          <TabsTrigger
            key={category}
            value={category}
            onClick={() => setActiveTab(category as DocumentCategory)}
            className="capitalize py-2"
          >
            {category}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {CATEGORIES.map((category) => (
        <TabsContent key={category} value={category} className="space-y-4">
          <DocumentList
            documents={filteredFiles.filter(file => file.category === category || (category === 'all' && filteredFiles.length > 0))}
            onAddDocument={handleAddDocument}
            onEditDocument={handleAddOrUpdateFile}
            onDeleteDocument={handleDeleteFile}
            onDownload={handleDownloadFile}
            searchTerm={searchTerm}
            categories={CATEGORIES}
            viewMode={viewMode === 'grid' ? 'grid' : 'table'}
          />
        </TabsContent>
      ))}
      
      <AddDocumentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddDocument}
        categories={CATEGORIES}
        currentCategory={activeTab}
      />
    </div>
  );
};

export default DocumentsPageContent;
