
import React from 'react';
import AppHeader from '@/components/layout/AppHeader';
import DocumentList from '@/components/features/documents/DocumentList';

const DocumentsPage = () => {
  return (
    <div className="space-y-6 py-4">
      <AppHeader 
        title="Documents" 
        subtitle="Manage your scanned documents and receipts"
      />
      <DocumentList />
    </div>
  );
};

export default DocumentsPage;
