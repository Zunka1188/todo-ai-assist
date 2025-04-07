
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DocumentsPage from './DocumentsPage';
import { DocumentCategory } from '@/components/features/documents/types';

const DocumentsSubtabPage: React.FC = () => {
  const { subtab } = useParams<{ subtab: string }>();
  const navigate = useNavigate();
  
  // Validate and redirect if the subtab is not valid
  useEffect(() => {
    const validSubtabs = ['style', 'recipes', 'travel', 'fitness', 'events', 'other', 'files'];
    
    if (!subtab || !validSubtabs.includes(subtab)) {
      console.log("[DEBUG] Invalid document subtab. Redirecting to /documents");
      navigate('/documents');
    }
  }, [subtab, navigate]);

  // Render the main DocumentsPage component
  // The DocumentsPage component will handle showing the correct tab
  return <DocumentsPage />;
};

export default DocumentsSubtabPage;
