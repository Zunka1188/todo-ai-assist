
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import DocumentsPageContent from '../DocumentsPageContent';
import { useDocuments } from '@/hooks/useDocuments';

// Mock the useDocuments hook
vi.mock('@/hooks/useDocuments', () => ({
  useDocuments: vi.fn()
}));

describe('DocumentsPageContent', () => {
  const mockUseDocuments = {
    categoryItems: [],
    files: [],
    handleAddOrUpdateItem: vi.fn(),
    handleDeleteItem: vi.fn(),
    filterDocuments: vi.fn(),
  };

  beforeEach(() => {
    (useDocuments as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockUseDocuments);
  });

  it('should render search input and add document button', () => {
    render(<DocumentsPageContent activeTab="all" />);
    
    expect(screen.getByPlaceholderText('Search documents...')).toBeInTheDocument();
    expect(screen.getByText('Add Document')).toBeInTheDocument();
  });

  it('should filter documents based on search term', async () => {
    const mockFiles = [
      { id: '1', title: 'Document 1', category: 'work' },
      { id: '2', title: 'Another Document', category: 'personal' },
    ];

    (useDocuments as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      ...mockUseDocuments,
      files: mockFiles,
    });

    render(<DocumentsPageContent activeTab="all" />);
    
    const searchInput = screen.getByPlaceholderText('Search documents...');
    fireEvent.change(searchInput, { target: { value: 'Document 1' } });

    await waitFor(() => {
      expect(screen.getByText('Document 1')).toBeInTheDocument();
      expect(screen.queryByText('Another Document')).not.toBeInTheDocument();
    });
  });
});
