
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DocumentsPageContent from '../DocumentsPageContent';
import { useDocuments } from '@/hooks/useDocuments';

// Mock the hooks
vi.mock('@/hooks/useDocuments', () => ({
  useDocuments: vi.fn()
}));

// Mock the document list component to simplify testing
vi.mock('../DocumentList', () => ({
  default: vi.fn(({ documents, onAddDocument }) => (
    <div data-testid="document-list">
      <div data-testid="document-count">{documents.length}</div>
      <button 
        data-testid="add-document-btn" 
        onClick={() => onAddDocument({ id: 'new-doc', title: 'New Document' })}
      >
        Add Document
      </button>
      <ul>
        {documents.map(doc => (
          <li key={doc.id} data-testid={`doc-${doc.id}`}>
            {doc.title}
          </li>
        ))}
      </ul>
    </div>
  ))
}));

describe('DocumentsPageContent Integration', () => {
  const mockFilterDocuments = vi.fn(term => {
    return term 
      ? mockFiles.filter(f => f.title.toLowerCase().includes(term.toLowerCase()))
      : mockFiles;
  });

  const mockFiles = [
    { id: '1', title: 'Document 1', category: 'work' },
    { id: '2', title: 'Another Document', category: 'personal' },
    { id: '3', title: 'Research Paper', category: 'work' },
  ];

  const mockUseDocuments = {
    categoryItems: [],
    files: mockFiles,
    handleAddOrUpdateItem: vi.fn(),
    handleDeleteItem: vi.fn(),
    handleAddOrUpdateFile: vi.fn(),
    handleDeleteFile: vi.fn(),
    filterDocuments: mockFilterDocuments,
    filterFiles: mockFilterDocuments,
    formatDateRelative: vi.fn(date => date),
    CATEGORIES: ['work', 'personal', 'shared']
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useDocuments as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockUseDocuments);
  });

  it('should display all documents initially', () => {
    render(<DocumentsPageContent activeTab="all" />);
    
    expect(screen.getByTestId('document-count').textContent).toBe('3');
    expect(screen.getByTestId('doc-1')).toBeInTheDocument();
    expect(screen.getByTestId('doc-2')).toBeInTheDocument();
    expect(screen.getByTestId('doc-3')).toBeInTheDocument();
  });

  it('should filter documents based on search', async () => {
    render(<DocumentsPageContent activeTab="all" />);
    
    const searchInput = screen.getByPlaceholderText('Search documents...');
    fireEvent.change(searchInput, { target: { value: 'Research' } });

    // Wait for filtering to apply
    await waitFor(() => {
      expect(screen.getByTestId('document-count').textContent).toBe('1');
      expect(screen.getByTestId('doc-3')).toBeInTheDocument();
      expect(screen.queryByTestId('doc-1')).not.toBeInTheDocument();
    });
  });

  it('should filter documents based on active tab', () => {
    render(<DocumentsPageContent activeTab="style" />);
    
    // No documents should be visible as none have category 'style'
    expect(screen.getByTestId('document-count').textContent).toBe('0');
  });

  it('should call the add document handler', async () => {
    render(<DocumentsPageContent activeTab="all" />);
    
    // Click the add document button
    fireEvent.click(screen.getByTestId('add-document-btn'));
    
    // Check if the handler was called
    expect(mockUseDocuments.handleAddOrUpdateItem).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'new-doc', title: 'New Document' })
    );
  });
});
