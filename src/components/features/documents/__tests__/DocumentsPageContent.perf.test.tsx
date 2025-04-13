
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DocumentsPageContent from '../DocumentsPageContent';
import { useDocuments } from '@/hooks/useDocuments';
import { measureRenderTime } from '@/utils/performance-testing';

// Mock the hooks
vi.mock('@/hooks/useDocuments', () => ({
  useDocuments: vi.fn()
}));

// Mock DocumentList component to make testing simpler
vi.mock('../DocumentList', () => ({
  default: vi.fn(({ documents }) => (
    <div data-testid="document-list">
      <ul>
        {documents.map(doc => (
          <li key={doc.id}>{doc.title}</li>
        ))}
      </ul>
    </div>
  ))
}));

describe('DocumentsPageContent Performance', () => {
  // Generate larger dataset for perf testing
  const generateMockFiles = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: `doc-${i}`,
      title: `Document ${i}`,
      category: i % 3 === 0 ? 'work' : i % 3 === 1 ? 'personal' : 'shared'
    }));
  };
  
  const configureMockData = (fileCount: number) => {
    const mockFiles = generateMockFiles(fileCount);
    
    const mockFilterDocuments = vi.fn(term => {
      if (!term) return mockFiles;
      return mockFiles.filter(f => 
        f.title.toLowerCase().includes(term.toLowerCase())
      );
    });
    
    const mockUseDocuments = {
      categoryItems: [],
      files: mockFiles,
      filterDocuments: mockFilterDocuments,
      filterFiles: mockFilterDocuments,
      handleAddOrUpdateItem: vi.fn(),
      handleDeleteItem: vi.fn(),
      handleAddOrUpdateFile: vi.fn(),
      handleDeleteFile: vi.fn(),
      formatDateRelative: vi.fn(date => date),
      CATEGORIES: ['work', 'personal', 'shared']
    };
    
    (useDocuments as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockUseDocuments);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render efficiently with a small dataset', () => {
    configureMockData(10);
    
    const metrics = measureRenderTime(() => {
      render(<DocumentsPageContent activeTab="all" />);
    });
    
    console.log('Small dataset render metrics (ms):', metrics);
    expect(metrics.average).toBeLessThan(100); // Adjust threshold as needed
  });
  
  it('should render efficiently with a medium dataset', () => {
    configureMockData(100);
    
    const metrics = measureRenderTime(() => {
      render(<DocumentsPageContent activeTab="all" />);
    }, 3);
    
    console.log('Medium dataset render metrics (ms):', metrics);
    expect(metrics.average).toBeLessThan(200); // Adjust threshold as needed
  });
  
  it('should filter efficiently', () => {
    // Setup with substantial data
    configureMockData(500);
    
    // Initial render
    render(<DocumentsPageContent activeTab="all" initialSearch="Document 100" />);
    
    // Verify only filtered items appear
    expect(screen.getByText('Document 100')).toBeInTheDocument();
    expect(screen.queryByText('Document 200')).not.toBeInTheDocument();
  });
});
