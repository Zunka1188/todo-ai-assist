
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../../test-utils';
import { CalendarProvider } from '../NewCalendarContext';
import CalendarContent from './CalendarContent';

// Mock the views
vi.mock('../views/DayView', () => ({
  default: () => <div data-testid="day-view">Day View</div>
}));

vi.mock('../views/MonthView', () => ({
  default: () => <div data-testid="month-view">Month View</div>
}));

vi.mock('../views/AgendaView', () => ({
  default: () => <div data-testid="agenda-view">Agenda View</div>
}));

describe('CalendarContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders the day view by default', () => {
    render(
      <CalendarProvider initialView="day">
        <CalendarContent />
      </CalendarProvider>
    );
    
    expect(screen.getByTestId('day-view')).toBeInTheDocument();
  });
  
  it('renders the month view when set to month mode', () => {
    render(
      <CalendarProvider initialView="month">
        <CalendarContent />
      </CalendarProvider>
    );
    
    expect(screen.getByTestId('month-view')).toBeInTheDocument();
  });
  
  it('renders the agenda view when set to agenda mode', () => {
    render(
      <CalendarProvider initialView="agenda">
        <CalendarContent />
      </CalendarProvider>
    );
    
    expect(screen.getByTestId('agenda-view')).toBeInTheDocument();
  });
  
  it('shows loading state when isLoading is true', () => {
    // We need to mock the context value directly to simulate loading
    vi.mock('../NewCalendarContext', () => ({
      CalendarProvider: ({ children }: { children: React.ReactNode }) => children,
      useCalendar: () => ({
        viewMode: 'day',
        isLoading: true
      })
    }));
    
    render(<CalendarContent />);
    
    // Check if loading state is shown
    expect(screen.queryByTestId('day-view')).not.toBeInTheDocument();
  });
  
  it('shows error state when pageError is present', () => {
    // We need to mock the context value directly to simulate error
    vi.mock('../NewCalendarContext', () => ({
      CalendarProvider: ({ children }: { children: React.ReactNode }) => children,
      useCalendar: () => ({
        viewMode: 'day',
        isLoading: false,
        pageError: 'Test error'
      })
    }));
    
    render(<CalendarContent />);
    
    // Check if error state is shown
    expect(screen.queryByTestId('day-view')).not.toBeInTheDocument();
  });
});
