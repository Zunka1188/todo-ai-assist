
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CalendarTest from './CalendarTest';
import { format } from 'date-fns';

describe('CalendarTest', () => {
  it('renders the calendar test component', () => {
    render(<CalendarTest />);
    
    // Check if the component renders
    expect(screen.getByText('Calendar Test Component')).toBeInTheDocument();
    
    // Check if it has the current date displayed
    const today = format(new Date(), 'MMMM d, yyyy');
    expect(screen.getByText(`Current Date: ${today}`)).toBeInTheDocument();
    
    // Check if view modes are present
    expect(screen.getByText('Day View')).toBeInTheDocument();
    expect(screen.getByText('Month View')).toBeInTheDocument();
    expect(screen.getByText('Agenda View')).toBeInTheDocument();
  });
  
  it('changes view mode when buttons are clicked', () => {
    render(<CalendarTest />);
    
    // Initially the view should be 'day' (default in NewCalendarContext)
    expect(screen.getByText('Current View: day')).toBeInTheDocument();
    
    // Click on Month View
    fireEvent.click(screen.getByText('Month View'));
    
    // Now the view should be 'month'
    expect(screen.getByText('Current View: month')).toBeInTheDocument();
    
    // Click on Agenda View
    fireEvent.click(screen.getByText('Agenda View'));
    
    // Now the view should be 'agenda'
    expect(screen.getByText('Current View: agenda')).toBeInTheDocument();
  });
  
  it('navigates dates when navigation buttons are clicked', () => {
    render(<CalendarTest />);
    
    // Get the initial date text
    const initialDateText = screen.getByText(/Current Date:/).textContent;
    
    // Click on Next button
    fireEvent.click(screen.getByText('Next'));
    
    // Date should have changed
    const nextDateText = screen.getByText(/Current Date:/).textContent;
    expect(nextDateText).not.toBe(initialDateText);
    
    // Click on Previous button
    fireEvent.click(screen.getByText('Previous'));
    
    // Date should be back to initial
    const prevDateText = screen.getByText(/Current Date:/).textContent;
    expect(prevDateText).toBe(initialDateText);
    
    // Store current date text
    const currentDateText = screen.getByText(/Current Date:/).textContent;
    
    // Click on Today button
    fireEvent.click(screen.getByText('Today'));
    
    // Date should be today
    const todayDateText = screen.getByText(/Current Date:/).textContent;
    // This might be the same if we're already on today's date
    // But the function should have been called
    expect(todayDateText).toBe(currentDateText);
  });
});
