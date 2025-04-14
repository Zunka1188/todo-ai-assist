
import React, { useState, useEffect } from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { measureRenderTime, createPerformanceLogger } from '@/utils/performance-testing';

// Create a simple test component with props
interface TestComponentProps {
  items: number[];
  title: string;
}

const TestComponent: React.FC<TestComponentProps> = ({ items, title }) => {
  const [processed, setProcessed] = useState<string[]>([]);
  
  useEffect(() => {
    setProcessed(items.map(i => `Item ${i}`));
  }, [items]);
  
  return (
    <div>
      <h1>{title}</h1>
      <ul>
        {processed.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

// Create a more complex component that would be slower
const ComplexComponent: React.FC<{ size: number }> = ({ size }) => {
  const [data, setData] = useState<Array<{ id: number; value: string }>>([]);
  
  useEffect(() => {
    const newData = [];
    for (let i = 0; i < size; i++) {
      newData.push({
        id: i,
        value: `Value ${i}`
      });
    }
    setData(newData);
  }, [size]);
  
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {data.map(item => (
        <div key={item.id} style={{ margin: '2px', padding: '8px', border: '1px solid #ccc' }}>
          {item.value}
        </div>
      ))}
    </div>
  );
};

describe('Performance Testing Utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    
    // Mock performance.now to return increasing values
    let time = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => {
      time += 5; // Increase by 5ms each call
      return time;
    });
  });
  
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });
  
  describe('measureRenderTime', () => {
    it('measures render time and returns metrics', () => {
      const renderFunction = () => {
        render(<TestComponent items={[1, 2, 3]} title="Test" />);
      };
      
      const metrics = measureRenderTime(renderFunction, 3);
      
      expect(metrics.average).toBeGreaterThan(0);
      expect(metrics.min).toBeGreaterThan(0);
      expect(metrics.max).toBeGreaterThan(0);
      expect(metrics.times.length).toBe(3);
    });
    
    it('shows performance difference between simple and complex components', () => {
      // Measure simple component
      const simpleRender = () => {
        render(<TestComponent items={[1, 2, 3]} title="Simple Component" />);
      };
      
      // Measure complex component
      const complexRender = () => {
        render(<ComplexComponent size={100} />);
      };
      
      const simpleMetrics = measureRenderTime(simpleRender, 3);
      const complexMetrics = measureRenderTime(complexRender, 3);
      
      // Complex component should take longer to render
      expect(complexMetrics.average).toBeGreaterThan(simpleMetrics.average);
    });
  });
  
  describe('createPerformanceLogger', () => {
    it('creates a performance logger with mark and measure functions', () => {
      const logger = createPerformanceLogger('test-component');
      
      // Mark some points
      logger.mark('start');
      logger.mark('middle');
      logger.mark('end');
      
      // Measure between points
      const duration = logger.measure('start', 'end', 'full-duration');
      
      // Check results
      expect(duration).toBeGreaterThan(0);
      
      const report = logger.getReport();
      expect(report.name).toBe('test-component');
      expect(report.markers.start).toBeDefined();
      expect(report.markers.middle).toBeDefined();
      expect(report.markers.end).toBeDefined();
      expect(report.durations['full-duration']).toBeDefined();
    });
    
    it('throws an error when measuring with non-existent markers', () => {
      const logger = createPerformanceLogger('error-test');
      
      logger.mark('start');
      
      // Try to measure with non-existent marker
      expect(() => {
        logger.measure('start', 'non-existent-marker');
      }).toThrow();
    });
  });
});
