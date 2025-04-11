
import React from 'react';
import { Tabs } from '@/components/ui/tabs';
import DocumentsPageContent from '@/components/features/documents/DocumentsPageContent';
import ErrorBoundary from '@/components/ui/error-boundary';

const DocumentsPage: React.FC = () => {
  return (
    <ErrorBoundary>
      <Tabs defaultValue="style">
        <DocumentsPageContent />
      </Tabs>
    </ErrorBoundary>
  );
};

export default DocumentsPage;
