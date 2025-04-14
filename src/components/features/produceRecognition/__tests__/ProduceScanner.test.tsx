
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
  const mockOnRecognize = vi.fn();
  const mockToast = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(require('@/hooks/use-toast').useToast).mockReturnValue({ toast: mockToast });
  });
  
  it('renders camera capture component', () => {
    render(<ProduceScanner onRecognize={mockOnRecognize} />);
    
    expect(screen.getByTestId('camera-capture')).toBeInTheDocument();
  });
  
  it('calls onRecognize when produce is detected', () => {
    render(<ProduceScanner onRecognize={mockOnRecognize} />);
    
    fireEvent.click(screen.getByTestId('mock-capture-btn'));
    
    expect(mockOnRecognize).toHaveBeenCalledWith({
      image: 'test-image-url',
      items: [{ label: 'Apple', confidence: 0.95 }]
    });
  });
  
  it('shows error state with no detections', () => {
    const { rerender } = render(<ProduceScanner onRecognize={mockOnRecognize} />);
    
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
    
    rerender(<ProduceScanner onRecognize={mockOnRecognize} />);
    
    fireEvent.click(screen.getByTestId('mock-capture-btn'));
    
    expect(mockToast).toHaveBeenCalledWith({
      title: expect.any(String),
      description: expect.stringContaining('No produce detected'),
      variant: 'destructive'
    });
  });
});
