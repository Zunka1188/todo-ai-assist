
import React from 'react';
import { ArrowLeft, Upload, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AppHeader from '@/components/layout/AppHeader';
import DocumentList from '@/components/features/documents/DocumentList';

const DocumentsPage = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="space-y-6 py-4">
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
        <AppHeader 
          title="Documents" 
          subtitle="Manage your files, photos, and notes"
          className="py-0"
        />
      </div>
      
      <div className="flex gap-2">
        <Button className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload File
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Note
        </Button>
      </div>
      
      <DocumentList />
    </div>
  );
};

export default DocumentsPage;
