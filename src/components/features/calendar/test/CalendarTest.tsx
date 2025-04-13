import React from 'react';
import { CalendarProvider, useCalendar } from '../NewCalendarContext';
import { format } from 'date-fns';
import { ViewMode } from '../types';

const CalendarContent = () => {
  const {
    currentDate,
    viewMode,
    dimensions,
    nextDate,
    prevDate,
    todayButtonClick,
    handleViewModeChange,
  } = useCalendar();

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2>Calendar Test Component</h2>
        <p>Current View: {viewMode}</p>
        <p>Current Date: {format(currentDate, 'MMMM d, yyyy')}</p>
        <p>Dimensions: {JSON.stringify(dimensions, null, 2)}</p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={prevDate}>Previous</button>
        <button onClick={todayButtonClick}>Today</button>
        <button onClick={nextDate}>Next</button>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        {(['day', 'month', 'agenda'] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => handleViewModeChange(mode)}
            style={{
              fontWeight: viewMode === mode ? 'bold' : 'normal',
              backgroundColor: viewMode === mode ? '#e0e0e0' : 'white'
            }}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)} View
          </button>
        ))}
      </div>
    </div>
  );
};

const CalendarTest = () => {
  return (
    <CalendarProvider>
      <CalendarContent />
    </CalendarProvider>
  );
};

export default CalendarTest;
