
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AIScanIntegration from '../AIScanIntegration';

// Mock the necessary hooks and components
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => ({ isMobile: false })
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

// Mock SmartScannerCapture component
vi.mock('../../scanning/SmartScannerCapture', () => ({
  default: ({ onSaveSuccess, onClose }) => (
    <div data-testid="smart-scanner-capture">
      <button data-testid="scan-success-btn" onClick={() => onSaveSuccess({ title: 'Test Item', itemType: 'product' })}>
        Simulate Scan Success
      </button>
      <button data-testid="scan-close-btn" onClick={onClose}>
        Close Scanner
      </button>
    </div>
  )
}));

describe('AIScanIntegration', () => {
  const mockNavigate = vi.fn();
  const mockToast = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Override the mocks for each test
    vi.mocked(require('react-router-dom').useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(require('@/hooks/use-toast').useToast).mockReturnValue({ toast: mockToast });
  });
  
  it('renders correctly with default props', () => {
    render(<AIScanIntegration />);
    
    expect(screen.getByText('Smart Scan')).toBeInTheDocument();
    expect(screen.queryByTestId('smart-scanner-capture')).not.toBeInTheDocument(); // Dialog should be closed initially
  });
  
  it('opens dialog when button is clicked', () => {
    render(<AIScanIntegration />);
    
    fireEvent.click(screen.getByText('Smart Scan'));
    
    expect(screen.getByText('AI Smart Scanner')).toBeInTheDocument();
    expect(screen.getByTestId('smart-scanner-capture')).toBeInTheDocument();
  });
  
  it('changes mode when tab is clicked', () => {
    render(<AIScanIntegration />);
    
    fireEvent.click(screen.getByText('Smart Scan'));
    fireEvent.click(screen.getByText('Shopping'));
    
    // We can't directly test the mode change without exposing it,
    // but we can verify that the tab was clicked
    expect(screen.getByRole('tab', { name: /shopping/i })).toHaveAttribute('data-state', 'active');
  });
  
  it('navigates to shopping page and shows toast when scan succeeds with product item', async () => {
    render(<AIScanIntegration />);
    
    fireEvent.click(screen.getByText('Smart Scan'));
    fireEvent.click(screen.getByTestId('scan-success-btn'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/shopping');
    expect(mockToast).toHaveBeenCalledWith({
      title: "Added to Shopping List",
      description: "Test Item has been added to your shopping list."
    });
    
    // Dialog should be closed after success
    await waitFor(() => {
      expect(screen.queryByTestId('smart-scanner-capture')).not.toBeInTheDocument();
    });
  });
  
  it('closes dialog when close button is clicked', () => {
    render(<AIScanIntegration />);
    
    fireEvent.click(screen.getByText('Smart Scan'));
    fireEvent.click(screen.getByTestId('scan-close-btn'));
    
    // Dialog should be closed
    expect(screen.queryByTestId('smart-scanner-capture')).not.toBeInTheDocument();
  });
  
  it('handles different item types correctly', () => {
    const { rerender } = render(<AIScanIntegration />);
    
    // Test document item type
    fireEvent.click(screen.getByText('Smart Scan'));
    
    // Create a custom event that passes different item data
    const scanSuccessBtn = screen.getByTestId('scan-success-btn');
    const originalOnClick = scanSuccessBtn.onclick;
    
    // Create a new function that will call the original with different data
    const customEvent = {
      currentTarget: scanSuccessBtn,
      preventDefault: () => {}
    };
    
    // Mock the SmartScannerCapture to simulate different item types
    vi.mocked(require('../../scanning/SmartScannerCapture').default).mockImplementation(
      ({ onSaveSuccess }) => (
        <div data-testid="smart-scanner-capture">
          <button 
            data-testid="scan-success-btn" 
            onClick={() => onSaveSuccess({ title: 'Test Document', itemType: 'document' })}
          >
            Simulate Document Scan
          </button>
        </div>
      )
    );
    
    // Re-render with the new mock
    rerender(<AIScanIntegration />);
    
    // Simulate document scan
    fireEvent.click(screen.getByText('Simulate Document Scan'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/documents');
    expect(mockToast).toHaveBeenCalledWith({
      title: "Added to Documents",
      description: "Document \"Test Document\" has been saved."
    });
  });
});
