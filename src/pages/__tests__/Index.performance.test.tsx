
import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import Index from '@/pages/Index';
import { performanceMonitor } from '@/utils/performance-monitor';

// Mock hooks
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => ({ isMobile: false })
}));

vi.mock('@/hooks/use-theme', () => ({
  useTheme: () => ({ theme: 'light' })
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

vi.mock('@/hooks/use-security', () => ({
  useSecurity: () => ({ csrfToken: 'test-token' })
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

// Mock performance monitor
vi.mock('@/utils/performance-monitor', () => ({
  performanceMonitor: {
    mark: vi.fn(),
    measure: vi.fn(),
    getReport: vi.fn().mockResolvedValue({
      marks: new Set(),
      measures: []
    }),
    clear: vi.fn(),
    enable: vi.fn()
  }
}));

// Mock components
vi.mock('@/components/features/home/HomeHeader', () => ({
  default: vi.fn(() => <div data-testid="home-header">Home Header</div>)
}));

vi.mock('@/components/features/home/WidgetGrid', () => ({
  default: vi.fn(() => <div data-testid="widget-grid">Widget Grid</div>)
}));

vi.mock('@/components/features/home/FeatureCardGrid', () => ({
  default: vi.fn(() => <div data-testid="feature-card-grid">Feature Card Grid</div>)
}));

vi.mock('@/components/features/home/QuickInfo', () => ({
  default: vi.fn(() => <div data-testid="quick-info">Quick Info</div>)
}));

vi.mock('@/components/features/ScanButton', () => ({
  default: vi.fn(({ onScan }) => (
    <button data-testid="scan-button" onClick={onScan}>
      Scan
    </button>
  ))
}));

describe('Index Page Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates performance marks on mount', () => {
    render(<Index />);
    
    expect(performanceMonitor.mark).toHaveBeenCalledWith('index_page_mounted');
  });

  it('starts route prefetch in idle callback', () => {
    // Mock requestIdleCallback
    global.requestIdleCallback = vi.fn((callback) => {
      callback({ didTimeout: false, timeRemaining: () => 50 });
      return 1;
    });
    
    render(<Index />);
    
    // Check if requestIdleCallback was used
    expect(global.requestIdleCallback).toHaveBeenCalled();
    
    // Check if routes_prefetched was marked
    expect(performanceMonitor.mark).toHaveBeenCalledWith('routes_prefetched');
  });

  it('creates performance marks when scan button is clicked', () => {
    const { getByTestId } = render(<Index />);
    
    // Click scan button
    getByTestId('scan-button').click();
    
    expect(performanceMonitor.mark).toHaveBeenCalledWith('scan_button_clicked');
  });

  it('measures page lifetime on unmount', () => {
    const { unmount } = render(<Index />);
    
    // Clear earlier calls
    vi.mocked(performanceMonitor.mark).mockClear();
    vi.mocked(performanceMonitor.measure).mockClear();
    
    // Unmount component
    unmount();
    
    // Check if unmount was marked
    expect(performanceMonitor.mark).toHaveBeenCalledWith('index_page_unmounted');
    
    // Check if page lifetime was measured
    expect(performanceMonitor.measure).toHaveBeenCalledWith(
      'index_page_lifetime',
      'index_page_mounted',
      'index_page_unmounted'
    );
  });

  it('cleans up session storage on mount', () => {
    // Mock sessionStorage
    const sessionStorageMock = {
      removeItem: vi.fn()
    };
    Object.defineProperty(window, 'sessionStorage', {
      value: sessionStorageMock
    });
    
    render(<Index />);
    
    // Check if session storage was cleaned
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('returnToAfterScan');
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('scanAction');
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('preferredScanMode');
  });
});
