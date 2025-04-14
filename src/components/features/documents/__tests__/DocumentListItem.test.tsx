
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DocumentListItem from '../DocumentListItem';

// Mock icons
vi.mock('lucide-react', () => ({
  File: () => <span data-testid="file-icon">file</span>,
  FileText: () => <span data-testid="file-text-icon">file-text</span>,
  FileImage: () => <span data-testid="file-image-icon">file-image</span>,
  Download: () => <span data-testid="download-icon">download</span>,
  Trash: () => <span data-testid="trash-icon">trash</span>,
  Edit: () => <span data-testid="edit-icon">edit</span>,
}));

describe('DocumentListItem', () => {
  const mockOnClick = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnDownload = vi.fn();
  
  const mockDocument = {
    id: '1',
    title: 'Test Document',
    url: '/test-document.pdf',
    type: 'pdf',
    size: '1.2 MB',
    lastModified: '2025-01-01T12:00:00Z',
  };

  it('renders document information correctly', () => {
    render(
      <DocumentListItem
        document={mockDocument}
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onDownload={mockOnDownload}
      />
    );
    
    expect(screen.getByText('Test Document')).toBeInTheDocument();
    expect(screen.getByText('1.2 MB')).toBeInTheDocument();
  });

  it('calls onClick when clicking the document item', () => {
    render(
      <DocumentListItem
        document={mockDocument}
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onDownload={mockOnDownload}
      />
    );
    
    fireEvent.click(screen.getByText('Test Document'));
    
    expect(mockOnClick).toHaveBeenCalledWith(mockDocument);
  });

  it('calls onEdit when clicking edit button', () => {
    render(
      <DocumentListItem
        document={mockDocument}
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onDownload={mockOnDownload}
      />
    );
    
    fireEvent.click(screen.getByTestId('edit-icon'));
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockDocument);
  });

  it('calls onDelete when clicking delete button', () => {
    render(
      <DocumentListItem
        document={mockDocument}
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onDownload={mockOnDownload}
      />
    );
    
    fireEvent.click(screen.getByTestId('trash-icon'));
    
    expect(mockOnDelete).toHaveBeenCalledWith(mockDocument.id);
  });

  it('calls onDownload when clicking download button', () => {
    render(
      <DocumentListItem
        document={mockDocument}
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onDownload={mockOnDownload}
      />
    );
    
    fireEvent.click(screen.getByTestId('download-icon'));
    
    expect(mockOnDownload).toHaveBeenCalledWith(mockDocument.url, mockDocument.title);
  });

  it('shows different icon based on document type', () => {
    // PDF document
    render(
      <DocumentListItem
        document={mockDocument}
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onDownload={mockOnDownload}
      />
    );
    
    // Image document
    render(
      <DocumentListItem
        document={{ ...mockDocument, type: 'image' }}
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onDownload={mockOnDownload}
      />
    );
    
    // Text document
    render(
      <DocumentListItem
        document={{ ...mockDocument, type: 'txt' }}
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onDownload={mockOnDownload}
      />
    );
    
    // Generic document
    render(
      <DocumentListItem
        document={{ ...mockDocument, type: 'unknown' }}
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onDownload={mockOnDownload}
      />
    );
    
    // Verify different icons are rendered
    expect(screen.getAllByTestId('file-text-icon')).toHaveLength(1);
    expect(screen.getAllByTestId('file-image-icon')).toHaveLength(1);
    expect(screen.getAllByTestId('file-icon')).toHaveLength(2);
  });
});
