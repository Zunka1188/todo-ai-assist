
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ImagePreviewDialog from '../ImagePreviewDialog';

// Mock the hooks
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => ({ isMobile: false }),
}));

vi.mock('@/hooks/useErrorHandler', () => ({
  default: () => ({
    handleError: vi.fn(),
  }),
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('ImagePreviewDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when open with an image', () => {
    render(
      <ImagePreviewDialog
        open={true}
        onOpenChange={() => {}}
        imageUrl="https://example.com/test-image.jpg"
        itemName="Test Item"
      />
    );

    // Dialog title should show the item name
    expect(screen.getByText('Test Item Image')).toBeInTheDocument();
    
    // Image should be present
    const image = screen.getByAltText('Test Item');
    expect(image).toBeInTheDocument();
    expect(image.getAttribute('src')).toBe('https://example.com/test-image.jpg');
    
    // Zoom buttons should be present
    expect(screen.getByText('Zoom In')).toBeInTheDocument();
    expect(screen.getByText('Zoom Out')).toBeInTheDocument();
    
    // Other action buttons should be present
    expect(screen.getByText('Rotate')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Download')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('shows empty state when no image is provided', () => {
    render(
      <ImagePreviewDialog
        open={true}
        onOpenChange={() => {}}
        imageUrl={null}
        itemName="No Image Item"
      />
    );
    
    expect(screen.getByText('No Image Item Image')).toBeInTheDocument();
    expect(screen.getByText('No image available')).toBeInTheDocument();
    
    // Action buttons should not be visible when no image
    expect(screen.queryByText('Zoom In')).not.toBeInTheDocument();
  });

  it('calls onOpenChange when close button is clicked', () => {
    const handleOpenChange = vi.fn();
    render(
      <ImagePreviewDialog
        open={true}
        onOpenChange={handleOpenChange}
        imageUrl="https://example.com/test-image.jpg"
        itemName="Test Item"
      />
    );
    
    // Click the close button
    fireEvent.click(screen.getByText('Close'));
    
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
  
  // This test would need to be expanded with more mocking to fully test
  // the image manipulation functions like zoom, rotate, etc.
});
