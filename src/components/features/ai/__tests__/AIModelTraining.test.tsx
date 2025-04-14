
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AIModelTraining from '../AIModelTraining';
import { useModelUpdates } from '@/utils/detectionEngine/hooks/useModelUpdates';

// Mock the hooks and components
vi.mock('@/utils/detectionEngine/hooks/useModelUpdates', () => ({
  useModelUpdates: vi.fn()
}));

vi.mock('../components/ModelPerformanceMetrics', () => ({
  default: () => <div data-testid="model-performance-metrics">ModelPerformanceMetrics</div>
}));

vi.mock('../components/UserFeedbackPanel', () => ({
  default: ({ feedbackItems, handleFeedbackToggle }) => (
    <div data-testid="user-feedback-panel">
      UserFeedbackPanel
      {feedbackItems.map(item => (
        <button 
          key={item.id} 
          data-testid={`feedback-toggle-${item.id}`} 
          onClick={() => handleFeedbackToggle(item.id, !item.correct)}
        >
          Toggle {item.id}
        </button>
      ))}
    </div>
  )
}));

vi.mock('../AIModelTrainingErrorBoundary', () => ({
  default: ({ children }) => <div data-testid="error-boundary">{children}</div>
}));

describe('AIModelTraining Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementation
    (useModelUpdates as any).mockReturnValue({
      status: { loading: false, error: null },
      addFeedback: vi.fn()
    });
  });
  
  it('renders the component with tabs', () => {
    render(<AIModelTraining />);
    
    expect(screen.getByText('AI Model Training & Performance')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'User Feedback' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Model Metrics' })).toBeInTheDocument();
  });
  
  it('shows the user feedback panel by default', () => {
    render(<AIModelTraining />);
    
    expect(screen.getByTestId('user-feedback-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('model-performance-metrics')).not.toBeInTheDocument();
  });
  
  it('switches to model metrics tab when clicked', async () => {
    render(<AIModelTraining />);
    
    const metricsTab = screen.getByRole('tab', { name: 'Model Metrics' });
    fireEvent.click(metricsTab);
    
    await waitFor(() => {
      expect(screen.getByTestId('model-performance-metrics')).toBeInTheDocument();
      expect(screen.queryByTestId('user-feedback-panel')).not.toBeInTheDocument();
    });
  });
  
  it('shows loading state when refreshing data', async () => {
    render(<AIModelTraining />);
    
    const refreshButton = screen.getByRole('button', { name: 'Refresh Data' });
    fireEvent.click(refreshButton);
    
    expect(screen.getByText('Updating...')).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Updating...')).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });
  
  it('toggles feedback item state correctly', async () => {
    render(<AIModelTraining />);
    
    const toggleButton = screen.getByTestId('feedback-toggle-1');
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      const feedbackItems = screen.getAllByTestId(/feedback-toggle/);
      expect(feedbackItems.length).toBe(4); // Ensure all feedback items are still there
    });
  });
  
  it('renders error boundary for error handling', () => {
    render(<AIModelTraining />);
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });
  
  it('displays AI safety and data usage notice', () => {
    render(<AIModelTraining />);
    expect(screen.getByText(/Data used only to improve detection accuracy/i)).toBeInTheDocument();
  });
});
