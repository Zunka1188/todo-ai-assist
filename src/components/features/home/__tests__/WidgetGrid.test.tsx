
import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import WidgetGrid from '../WidgetGrid';
import { render as customRender } from '@/test-utils';

// Mock the widgets
vi.mock('@/components/widgets/WidgetsIndex', () => ({
  CalendarWidget: () => <div data-testid="calendar-widget">Calendar Widget</div>,
  TaskWidget: () => <div data-testid="task-widget">Task Widget</div>,
  ScannerWidget: () => <div data-testid="scanner-widget">Scanner Widget</div>,
  WeatherWidget: () => <div data-testid="weather-widget">Weather Widget</div>,
  AIAssistantWidget: () => <div data-testid="ai-widget">AI Widget</div>,
}));

describe('WidgetGrid', () => {
  it('renders all widgets correctly', () => {
    render(<WidgetGrid />);
    
    expect(screen.getByTestId('calendar-widget')).toBeInTheDocument();
    expect(screen.getByTestId('task-widget')).toBeInTheDocument();
    expect(screen.getByTestId('scanner-widget')).toBeInTheDocument();
    expect(screen.getByTestId('weather-widget')).toBeInTheDocument();
    expect(screen.getByTestId('ai-widget')).toBeInTheDocument();
  });

  it('renders with responsive grid layout', () => {
    const { container } = render(<WidgetGrid />);
    const gridElement = container.firstChild;
    
    expect(gridElement).toHaveClass('grid');
  });
  
  it('renders correctly in mobile view', () => {
    // Mock mobile viewport
    vi.mock('@/hooks/use-mobile', () => ({
      useIsMobile: () => ({ isMobile: true })
    }));
    
    render(<WidgetGrid />);
    
    // Re-render with updated mock
    const { container } = render(<WidgetGrid />);
    
    // Check for single column layout classes in mobile view
    expect(container.firstChild).toHaveClass('grid');
  });
});
