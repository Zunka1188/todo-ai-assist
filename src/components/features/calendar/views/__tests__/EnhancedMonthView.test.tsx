
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedMonthView from '../EnhancedMonthView';
import { Event } from '../../types/event';

// Mock the MonthView component
jest.mock('../MonthView', () => ({
  __esModule: true,
  default: () => <div data-testid="month-view-mock">Month View Content</div>
}));

// Mock the ErrorBoundary component
jest.mock('../../ErrorBoundary', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary-mock">{children}</div>
  )
}));

// Mock the performance tracking function
jest.mock('../../utils/performanceTracking', () => ({
  trackRenderPerformance: jest.fn()
}));

describe('EnhancedMonthView', () => {
  const mockProps = {
    date: new Date('2023-01-01'),
    setDate: jest.fn(),
    events: [] as Event[],
    handleViewEvent: jest.fn(),
    theme: 'light',
    weekStartsOn: 0 as 0 | 1 | 2 | 3 | 4 | 5 | 6,
    minCellHeight: 80
  };

  it('renders without crashing', () => {
    render(<EnhancedMonthView {...mockProps} />);
    expect(screen.getByTestId('error-boundary-mock')).toBeInTheDocument();
    expect(screen.getByTestId('month-view-mock')).toBeInTheDocument();
  });

  it('renders loading state when isLoading is true', () => {
    render(<EnhancedMonthView {...mockProps} isLoading={true} />);
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('matches snapshot', () => {
    const { container } = render(<EnhancedMonthView {...mockProps} />);
    expect(container).toMatchSnapshot();
  });
  
  it('matches snapshot in loading state', () => {
    const { container } = render(<EnhancedMonthView {...mockProps} isLoading={true} />);
    expect(container).toMatchSnapshot();
  });
});
