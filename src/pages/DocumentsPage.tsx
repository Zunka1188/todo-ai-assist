
import React, { useState } from 'react';
import { Tabs } from '@/components/ui/tabs';
import DocumentsPageContent from '@/components/features/documents/DocumentsPageContent';
import ErrorBoundary from '@/components/ui/error-boundary';
import { useSearchParams } from 'react-router-dom';

const DocumentsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';

  return (
    <ErrorBoundary>
      <Tabs defaultValue="style">
        <DocumentsPageContent />
      </Tabs>
    </ErrorBoundary>
  );
};

export default DocumentsPage;
