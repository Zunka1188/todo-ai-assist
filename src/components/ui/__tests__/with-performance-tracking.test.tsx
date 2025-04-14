
import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { withPerformanceTracking } from '../with-performance-tracking';
import { customRender } from '@/test-utils';

// Mock the performance monitor
vi.mock('@/utils/performance-monitor', () => ({
  performanceMonitor: {
    isEnabled: vi.fn().mockReturnValue(true),
    mark: vi.fn(),
    measure: vi.fn()
  }
}));

describe('withPerformanceTracking HOC', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders the wrapped component correctly', () => {
    // Create a simple test component
    const TestComponent = () => <div data-testid="test-component">Test Content</div>;
    
    // Wrap it with performance tracking
    const TrackedComponent = withPerformanceTracking(TestComponent, {
      componentName: 'TestComponent'
    });
    
    // Render the tracked component
    render(<TrackedComponent />);
    
    // Check that the original component renders correctly
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
  
  it('tracks component mounting', () => {
    // Create a simple test component
    const TestComponent = () => <div>Test Content</div>;
    
    // Wrap it with performance tracking
    const TrackedComponent = withPerformanceTracking(TestComponent, {
      componentName: 'TestComponent'
    });
    
    // Render the tracked component
    render(<TrackedComponent />);
    
    // Check that performance marks were created
    const { performanceMonitor } = require('@/utils/performance-monitor');
    expect(performanceMonitor.mark).toHaveBeenCalled();
  });
  
  it('skips tracking when performance monitoring is disabled', () => {
    // Mock performanceMonitor.isEnabled to return false
    vi.mocked(require('@/utils/performance-monitor').performanceMonitor.isEnabled).mockReturnValueOnce(false);
    
    // Create a simple test component
    const TestComponent = () => <div>Test Content</div>;
    
    // Wrap it with performance tracking
    const TrackedComponent = withPerformanceTracking(TestComponent, {
      componentName: 'TestComponent'
    });
    
    // Render the tracked component
    render(<TrackedComponent />);
    
    // Check that performance marks were not created
    const { performanceMonitor } = require('@/utils/performance-monitor');
    expect(performanceMonitor.mark).not.toHaveBeenCalled();
  });
  
  it('uses the provided component name in performance marks', () => {
    // Create a simple test component
    const TestComponent = () => <div>Test Content</div>;
    
    // Wrap it with a custom name
    const TrackedComponent = withPerformanceTracking(TestComponent, {
      componentName: 'CustomNamedComponent'
    });
    
    // Render the tracked component
    render(<TrackedComponent />);
    
    // Check that the custom name was used
    const { performanceMonitor } = require('@/utils/performance-monitor');
    expect(performanceMonitor.mark).toHaveBeenCalledWith(
      expect.stringContaining('CustomNamedComponent')
    );
  });
  
  it('tracks prop changes when enabled', () => {
    // Mock requestIdleCallback
    window.requestIdleCallback = vi.fn().mockImplementation(cb => {
      cb({ timeRemaining: () => 50, didTimeout: false });
      return 1;
    });
    
    // Create a component that takes props
    const TestComponent = ({ value }: { value: string }) => <div>{value}</div>;
    
    // Wrap it with performance tracking with prop tracking enabled
    const TrackedComponent = withPerformanceTracking(TestComponent, {
      componentName: 'TestComponent',
      trackProps: true
    });
    
    // Render with initial props
    const { rerender } = render(<TrackedComponent value="initial" />);
    
    // Re-render with new props
    rerender(<TrackedComponent value="updated" />);
    
    // Check that props update was tracked
    const { performanceMonitor } = require('@/utils/performance-monitor');
    
    // Wait for requestIdleCallback to be executed
    expect(window.requestIdleCallback).toHaveBeenCalled();
    
    // At least one mark for component mount and one for props update
    expect(performanceMonitor.mark).toHaveBeenCalledTimes(expect.any(Number));
  });
});
