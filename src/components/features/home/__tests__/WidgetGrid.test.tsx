
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { vi } from 'vitest';
import WidgetGrid from '../WidgetGrid';
import { render as customRender } from '@/test-utils';

// Mock the widgets
vi.mock('@/components/widgets/WidgetsIndex', () => ({
  CalendarWidget: () => <div data-testid="calendar-widget">Calendar Widget</div>,
  TaskWidget: () => <div data-testid="task-widget">Task Widget</div>,
  ScannerWidget: () => <div data-testid="scanner-widget">Scanner Widget</div>,
  WeatherWidget: () => <div data-testid="weather-widget">Weather Widget</div>,
  AIAssistantWidget: () => <div data-testid="ai-assistant-widget">AI Assistant Widget</div>,
}));
) => <div data-testid="ai-widget">AI Widget</div>,
}</ThemeProvider>
)</ThemeProvider>
);

describe('WidgetGrid', (</ThemeProvider>
) => {
  it('renders all widgets correctly', (</ThemeProvider>
) => {
    render(
  <ThemeProvider attribute="class"><WidgetGrid /></ThemeProvider>
);
    
    expect(screen.getByTestId('calendar-widget'</ThemeProvider>
)</ThemeProvider>
).toBeInTheDocument(</ThemeProvider>
);
    expect(screen.getByTestId('task-widget'</ThemeProvider>
)</ThemeProvider>
).toBeInTheDocument(</ThemeProvider>
);
    expect(screen.getByTestId('scanner-widget'</ThemeProvider>
)</ThemeProvider>
).toBeInTheDocument(</ThemeProvider>
);
    expect(screen.getByTestId('weather-widget'</ThemeProvider>
)</ThemeProvider>
).toBeInTheDocument(</ThemeProvider>
);
    expect(screen.getByTestId('ai-widget'</ThemeProvider>
)</ThemeProvider>
).toBeInTheDocument(</ThemeProvider>
);
  }</ThemeProvider>
);

  it('renders with responsive grid layout', (</ThemeProvider>
) => {
    const { container } = render(
  <ThemeProvider attribute="class"><WidgetGrid /></ThemeProvider>
);
    const gridElement = container.firstChild;
    
    expect(gridElement</ThemeProvider>
).toHaveClass('grid'</ThemeProvider>
);
  }</ThemeProvider>
);
  
  it('renders correctly in mobile view', (</ThemeProvider>
) => {
    // Mock mobile viewport
    vi.mock('@/hooks/use-mobile', (</ThemeProvider>
) => ({
      useIsMobile: (</ThemeProvider>
) => ({ isMobile: true }</ThemeProvider>
)
    }</ThemeProvider>
)</ThemeProvider>
);
    
    render(
  <ThemeProvider attribute="class"><WidgetGrid /></ThemeProvider>
);
    
    // Re-render with updated mock
    const { container } = render(
  <ThemeProvider attribute="class"><WidgetGrid /></ThemeProvider>
);
    
    // Check for single column layout classes in mobile view
    expect(container.firstChild</ThemeProvider>
).toHaveClass('grid'</ThemeProvider>
);
  }</ThemeProvider>
);
}</ThemeProvider>
);
