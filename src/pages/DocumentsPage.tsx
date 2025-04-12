import React, { useState, useEffect } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentErrorBoundary from '@/components/features/documents/components/DocumentErrorBoundary';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface DocumentsPageProps {
  children?: React.ReactNode;
}

const DocumentsPage: React.FC<DocumentsPageProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'all';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastSearch, setLastSearch] = useLocalStorage<string>('lastDocumentSearch', '');

  useEffect(() => {
    if (lastSearch) {
      setSearchTerm(lastSearch);
    }
  }, [lastSearch]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set('tab', activeTab);
    navigate({ search: params.toString() }, { replace: true });
  }, [activeTab, navigate, location.search]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setLastSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setLastSearch('');
  };

  return (
    <DocumentErrorBoundary context="Documents Page">
      <div className="container mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Documents</h1>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Document
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search documents..."
            className="pl-9 pr-9"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {children}
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            Recent documents content
          </TabsContent>

          <TabsContent value="shared" className="space-y-4">
            Shared documents content
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            Favorite documents content
          </TabsContent>
        </Tabs>
      </div>
    </DocumentErrorBoundary>
  );
};

export default DocumentsPage;
