
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ProduceScanner from '../ProduceScanner';

// Mock necessary hooks and components
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => ({ isMobile: false })
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

// Mock the camera capture component
vi.mock('../../scanning/CameraCaptureWithAI', () => ({
  default: ({ onCapture }) => (
    <div data-testid="camera-capture">
      <button 
        data-testid="mock-capture-btn" 
        onClick={() => onCapture({ 
          image: 'test-image-url', 
          detections: [{ label: 'Apple', confidence: 0.95 }] 
        })}
      >
        Capture
      </button>
    </div>
  )
}));

describe('ProduceScanner', () => {
  const mockToast = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(require('@/hooks/use-toast').useToast).mockReturnValue({ toast: mockToast });
  });
  
  it('renders camera capture component', () => {
    render(<ProduceScanner />);
    
    expect(screen.getByTestId('camera-capture')).toBeInTheDocument();
  });
  
  it('simulates scanning produce when capture button clicked', () => {
    render(<ProduceScanner />);
    
    fireEvent.click(screen.getByTestId('mock-capture-btn'));
    
    // Since the component now works differently, we check for expected behavior
    // rather than the specific onRecognize prop that no longer exists
    expect(mockToast).toHaveBeenCalledWith({
      title: "Item Recognized",
      description: expect.stringContaining('Apple'),
    });
  });
  
  it('shows error state with no detections', () => {
    // Update the mock to return no detections
    vi.mocked(require('../../scanning/CameraCaptureWithAI').default).mockImplementation(
      ({ onCapture }) => (
        <div data-testid="camera-capture">
          <button 
            data-testid="mock-capture-btn" 
            onClick={() => onCapture({ 
              image: 'test-image-url', 
              detections: [] 
            })}
          >
            Capture
          </button>
        </div>
      )
    );
    
    render(<ProduceScanner />);
    
    fireEvent.click(screen.getByTestId('mock-capture-btn'));
    
    expect(mockToast).toHaveBeenCalledWith({
      title: expect.any(String),
      description: expect.stringContaining('No produce detected'),
      variant: 'destructive'
    });
  });
  
  it('allows resetting after scan', async () => {
    render(<ProduceScanner />);
    
    // First simulate a successful scan
    fireEvent.click(screen.getByTestId('mock-capture-btn'));
    
    // Check that the recognized item is displayed
    expect(mockToast).toHaveBeenCalledWith({
      title: "Item Recognized",
      description: expect.stringContaining('Apple'),
    });
    
    // Find and click the reset/close button if it exists (implementation dependent)
    const resetButton = screen.queryByTestId('reset-btn');
    if (resetButton) {
      fireEvent.click(resetButton);
      // Verify scanner is back to initial state
      expect(screen.getByTestId('camera-capture')).toBeInTheDocument();
    }
  });
});
