
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ScanButton from '../ScanButton';

// Mock the necessary hooks
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => ({ isMobile: false })
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

describe('ScanButton', () => {
  const mockNavigate = vi.fn();
  const mockToast = vi.fn();
  const mockOnScan = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Override the mocks for each test
    vi.mocked(require('react-router-dom').useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(require('@/hooks/use-toast').useToast).mockReturnValue({ toast: mockToast });
  });
  
  it('renders correctly with default props', () => {
    render(<ScanButton />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Scan with camera');
  });
  
  it('renders correctly with custom props', () => {
    render(
      <ScanButton 
        scanMode="product" 
        label="Test Label" 
        size="lg" 
        variant="primary"
        aria-label="Custom Label"
      />
    );
    
    const button = screen.getByRole('button', { name: 'Custom Label' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Test Label');
  });
  
  it('calls onScan when provided and button is clicked', () => {
    render(<ScanButton onScan={mockOnScan} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(mockOnScan).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled(); // Should not navigate if onScan is provided
  });
  
  it('navigates to scan page when no onScan is provided', () => {
    render(<ScanButton />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/scan');
  });
  
  it('sets sessionStorage with scan mode when provided', () => {
    const sessionStorageMock = {
      setItem: vi.fn()
    };
    
    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: sessionStorageMock,
      writable: true
    });
    
    render(<ScanButton scanMode="document" />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith('preferredScanMode', 'document');
  });
  
  it('shows toast notification when button is clicked', () => {
    render(<ScanButton />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(mockToast).toHaveBeenCalledTimes(1);
  });
  
  it('is disabled when isProcessing is true', () => {
    render(<ScanButton isProcessing={true} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockToast).not.toHaveBeenCalled();
  });
});
