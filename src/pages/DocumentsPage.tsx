
import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import AppPage from '@/components/ui/app-page';
import AppTabs from '@/components/ui/app-tabs';
import DocumentsPageContent from '@/components/features/documents/DocumentsPageContent';
import ErrorBoundary from '@/components/ui/error-boundary';
import { useSearchParams } from 'react-router-dom';

const DocumentsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [activeTab, setActiveTab] = useState('style');
  
  const documentTabs = [
    { id: 'style', label: 'Style', shortLabel: 'Style' },
    { id: 'shared', label: 'Shared', shortLabel: 'Shared' },
    { id: 'templates', label: 'Templates', shortLabel: 'Templates' },
  ];
  
  return (
    <ErrorBoundary>
      <AppPage
        title="Documents"
        icon={<FileText className="h-5 w-5" />}
        subtitle="Manage your documents and files"
        fullHeight
      >
        <AppTabs 
          tabs={documentTabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          renderContent={false}
        />
        <DocumentsPageContent activeTab={activeTab} initialSearch={initialSearch} />
      </AppPage>
    </ErrorBoundary>
  );
};

export default DocumentsPage;
