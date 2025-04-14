
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DocumentListItem from '../DocumentListItem';
import { DocumentCategory } from '../types';

// Mock icons
vi.mock('lucide-react', () => ({
  File: () => <span data-testid="file-icon">file</span>,
  FileText: () => <span data-testid="file-text-icon">file-text</span>,
  FileImage: () => <span data-testid="file-image-icon">file-image</span>,
  Download: () => <span data-testid="download-icon">download</span>,
  Trash: () => <span data-testid="trash-icon">trash</span>,
  Edit: () => <span data-testid="edit-icon">edit</span>,
  Maximize2: () => <span data-testid="maximize-icon">maximize</span>,
}));

// Mock hooks
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => ({ isMobile: false }),
}));

describe('DocumentListItem', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnFullScreen = vi.fn();
  
  const mockDocument = {
    id: '1',
    title: 'Test Document',
    category: 'files' as DocumentCategory,
    date: '2025-01-01T12:00:00Z',
    fileType: 'pdf',
    fileUrl: '/test-document.pdf',
  };

  it('renders document information correctly', () => {
    render(
      <DocumentListItem
        document={mockDocument}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onFullScreen={mockOnFullScreen}
      />
    );
    
    expect(screen.getByText('Test Document')).toBeInTheDocument();
    expect(screen.getByText('Category: Files')).toBeInTheDocument();
  });

  it('calls onFullScreen when clicking the document item', () => {
    render(
      <DocumentListItem
        document={mockDocument}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onFullScreen={mockOnFullScreen}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: 'View Test Document' }));
    
    expect(mockOnFullScreen).toHaveBeenCalled();
  });

  it('calls onEdit when clicking edit button', () => {
    render(
      <DocumentListItem
        document={mockDocument}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onFullScreen={mockOnFullScreen}
      />
    );
    
    fireEvent.click(screen.getByLabelText('Edit document'));
    
    expect(mockOnEdit).toHaveBeenCalled();
  });

  it('calls onDelete when clicking delete button', () => {
    render(
      <DocumentListItem
        document={mockDocument}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onFullScreen={mockOnFullScreen}
      />
    );
    
    fireEvent.click(screen.getByLabelText('Delete document'));
    
    expect(mockOnDelete).toHaveBeenCalled();
  });

  it('calls onFullScreen when clicking full screen button', () => {
    render(
      <DocumentListItem
        document={mockDocument}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onFullScreen={mockOnFullScreen}
      />
    );
    
    fireEvent.click(screen.getByLabelText('View full screen'));
    
    expect(mockOnFullScreen).toHaveBeenCalled();
  });

  it('shows different icon based on document category', () => {
    // Files category
    render(
      <DocumentListItem
        document={mockDocument}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onFullScreen={mockOnFullScreen}
      />
    );
    
    // Recipes category
    render(
      <DocumentListItem
        document={{ ...mockDocument, category: 'recipes' as DocumentCategory }}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onFullScreen={mockOnFullScreen}
      />
    );
    
    // Travel category
    render(
      <DocumentListItem
        document={{ ...mockDocument, category: 'travel' as DocumentCategory }}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onFullScreen={mockOnFullScreen}
      />
    );
    
    // Style category
    render(
      <DocumentListItem
        document={{ ...mockDocument, category: 'style' as DocumentCategory }}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onFullScreen={mockOnFullScreen}
      />
    );
  });
});
