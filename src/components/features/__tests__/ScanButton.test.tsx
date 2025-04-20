
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
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
    vi.mocked(require('react-router-dom').useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(require('@/hooks/use-toast').useToast).mockReturnValue({ toast: mockToast });
  });

  it('renders correctly with default props', () => {
    render(
      <ThemeProvider attribute="class">
        <ScanButton />
      </ThemeProvider>
    );
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Scan with camera');
  });

  it('renders correctly with custom props', () => {
    render(
      <ThemeProvider attribute="class">
        <ScanButton
          scanMode="product"
          label="Test Label"
          size="lg"
          variant="primary"
          aria-label="Custom Label"
        />
      </ThemeProvider>
    );
    const button = screen.getByRole('button', { name: 'Custom Label' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Test Label');
  });

  it('calls onScan when provided and button is clicked', () => {
    render(
      <ThemeProvider attribute="class">
        <ScanButton onScan={mockOnScan} />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnScan).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates to scan page when no onScan is provided', () => {
    render(
      <ThemeProvider attribute="class">
        <ScanButton />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(mockNavigate).toHaveBeenCalledWith('/scan');
  });

  it('sets sessionStorage with scan mode when provided', () => {
    const sessionStorageMock = {
      setItem: vi.fn()
    };
    Object.defineProperty(window, 'sessionStorage', {
      value: sessionStorageMock,
      writable: true
    });
    render(
      <ThemeProvider attribute="class">
        <ScanButton scanMode="document" />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(sessionStorageMock.setItem).toHaveBeenCalledWith('preferredScanMode', 'document');
  });

  it('shows toast notification when button is clicked', () => {
    render(
      <ThemeProvider attribute="class">
        <ScanButton />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(mockToast).toHaveBeenCalledTimes(1);
  });

  it('is disabled when isProcessing is true', () => {
    render(
      <ThemeProvider attribute="class">
        <ScanButton isProcessing={true} />
      </ThemeProvider>
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockToast).not.toHaveBeenCalled();
  });
});
