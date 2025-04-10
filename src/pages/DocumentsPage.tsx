
import React from 'react';
import { Tabs } from '@/components/ui/tabs';
import DocumentsPageContent from '@/components/features/documents/DocumentsPageContent';
import ErrorBoundary from '@/components/ui/error-boundary';
import { getFileTypeFromName } from '@/components/features/documents/FilePreview';

// Wrap DocumentsPageContent with ErrorBoundary for robust error handling
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
