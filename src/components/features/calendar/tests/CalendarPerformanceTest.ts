
import { trackPerformance as trackRenderPerformance, default as performanceUtils } from '../utils/performanceTracking';
import { measureExecutionTime, createPerformanceLogger, createRenderMonitor } from '@/utils/performance-testing';

/**
 * Performance test suite for calendar components
 */
export const CalendarPerformanceTest = {
  /**
   * Test the performance of month view navigation
   * @param navigate Function to navigate between months
   * @param numberOfMonths Number of months to navigate through
   * @returns Performance metrics
   */
  testMonthNavigation: async (
    navigate: (direction: 'next' | 'prev') => void,
    numberOfMonths: number = 6
  ) => {
    // Clear existing performance data
    performanceUtils.clearPerformanceData('MonthView');
    
    const logger = createPerformanceLogger('MonthNavigation');
    logger.mark('start');
    
    // Navigate forward through months
    for (let i = 0; i < numberOfMonths; i++) {
      logger.mark(`forward_${i}_start`);
      await measureExecutionTime(navigate, 'next');
      logger.mark(`forward_${i}_end`);
      
      // Wait for render to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Navigate backward through months
    for (let i = 0; i < numberOfMonths; i++) {
      logger.mark(`backward_${i}_start`);
      await measureExecutionTime(navigate, 'prev');
      logger.mark(`backward_${i}_end`);
      
      // Wait for render to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    logger.mark('end');
    
    // Collect performance data
    const monthViewData = performanceUtils.getPerformanceData()['MonthView'] || [];
    const navigationReport = logger.getReport();
    
    return {
      renderTimes: monthViewData.map(data => data.renderTime),
      averageRenderTime: monthViewData.length > 0 
        ? monthViewData.reduce((sum, data) => sum + data.renderTime, 0) / monthViewData.length 
        : 0,
      navigationTimings: navigationReport.durations,
      totalNavigationTime: navigationReport.markers.end - navigationReport.markers.start
    };
  },
  
  /**
   * Test the performance of event rendering
   * @param renderEvents Function to trigger rendering events
   * @param eventCounts Array of event counts to test with
   * @returns Performance metrics for different event counts
   */
  testEventRendering: async (
    renderEvents: (count: number) => Promise<void>,
    eventCounts: number[] = [10, 50, 100, 500]
  ) => {
    performanceUtils.clearPerformanceData();
    const results: Record<string, { renderTime: number, operations: number }> = {};
    
    for (const count of eventCounts) {
      performanceUtils.clearPerformanceData('EventRendering');
      
      const { executionTime } = await measureExecutionTime(renderEvents, count);
      
      const marker = `events_${count}`;
      results[marker] = {
        renderTime: executionTime,
        operations: count
      };
      
      // Wait between tests
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    return results;
  },
  
  /**
   * Run a comprehensive performance test suite
   */
  runFullTestSuite: async (options: {
    navigate: (direction: 'next' | 'prev') => void,
    renderEvents: (count: number) => Promise<void>,
    changeView: (view: 'day' | 'week' | 'month' | 'agenda') => Promise<void>,
  }) => {
    const monitor = createRenderMonitor();
    const logger = createPerformanceLogger('CalendarTestSuite');
    
    logger.mark('suite_start');
    
    // Test navigation
    logger.mark('navigation_test_start');
    const navigationResults = await this.testMonthNavigation(options.navigate);
    logger.mark('navigation_test_end');
    logger.measure('navigation_test_start', 'navigation_test_end', 'navigation_test');
    
    // Test event rendering
    logger.mark('event_rendering_test_start');
    const renderingResults = await this.testEventRendering(options.renderEvents);
    logger.mark('event_rendering_test_end');
    logger.measure('event_rendering_test_start', 'event_rendering_test_end', 'event_rendering_test');
    
    // Test view switching
    logger.mark('view_switching_test_start');
    const viewSwitchingTimes: Record<string, number> = {};
    
    for (const view of ['day', 'week', 'month', 'agenda'] as const) {
      logger.mark(`switch_to_${view}_start`);
      await options.changeView(view);
      logger.mark(`switch_to_${view}_end`);
      viewSwitchingTimes[view] = logger.measure(`switch_to_${view}_start`, `switch_to_${view}_end`) || 0;
      
      // Wait between switches
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    logger.mark('view_switching_test_end');
    logger.measure('view_switching_test_start', 'view_switching_test_end', 'view_switching_test');
    
    logger.mark('suite_end');
    const totalTestTime = logger.measure('suite_start', 'suite_end', 'total_test_time') || 0;
    
    return {
      navigation: navigationResults,
      eventRendering: renderingResults,
      viewSwitching: viewSwitchingTimes,
      renderCounts: monitor.getRenderCounts(),
      testDuration: totalTestTime,
      fullReport: logger.getReport()
    };
  }
};

export default CalendarPerformanceTest;
