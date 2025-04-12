
import React, { useState } from 'react';
import { Tabs } from '@/components/ui/tabs';
import DocumentsPageContent from '@/components/features/documents/DocumentsPageContent';
import ErrorBoundary from '@/components/ui/error-boundary';

const DocumentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('style');
  
  return (
    <ErrorBoundary>
      <Tabs defaultValue="style">
        <DocumentsPageContent activeTab={activeTab} />
      </Tabs>
    </ErrorBoundary>
  );
};

export default DocumentsPage;
