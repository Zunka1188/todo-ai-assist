import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Index from '../Index';
import { render as customRender } from '@/test-utils';

// Mock necessary hooks and components
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
  useSecurity: () => ({ csrfToken: 'mock-csrf-token' })
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to} data-testid="mock-link">
      {children}
    </a>
  )
}));

vi.mock('@/utils/performance-monitor', () => ({
  performanceMonitor: {
    mark: vi.fn(),
    measure: vi.fn()
  }
}));

// Mock the components
vi.mock('@/components/features/home/HomeHeader', () => ({
  default: () => <div data-testid="home-header">Home Header</div>
}));

vi.mock('@/components/features/home/WidgetGrid', () => ({
  default: () => <div data-testid="widget-grid">Widget Grid</div>
}));

vi.mock('@/components/features/home/FeatureCardGrid', () => ({
  default: () => <div data-testid="feature-card-grid">Feature Card Grid</div>
}));

vi.mock('@/components/features/home/QuickInfo', () => ({
  default: () => <div data-testid="quick-info">Quick Info</div>
}));

vi.mock('@/components/features/ScanButton', () => ({
  default: ({ onScan }: { onScan?: () => void }) => (
    <button data-testid="scan-button" onClick={onScan}>
      Scan Button
    </button>
  )
}));

describe('Index Page', () => {
  const mockNavigate = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Override the useNavigate mock for each test
    vi.mocked(require('react-router-dom').useNavigate).mockReturnValue(mockNavigate);
  });
  
  it('renders all main components correctly', () => {
    render(<Index />);
    
    expect(screen.getByTestId('home-header')).toBeInTheDocument();
    expect(screen.getByTestId('scan-button')).toBeInTheDocument();
    expect(screen.getByTestId('widget-grid')).toBeInTheDocument();
    expect(screen.getByTestId('feature-card-grid')).toBeInTheDocument();
    expect(screen.getByTestId('quick-info')).toBeInTheDocument();
  });
  
  it('navigates to scan page when scan button is clicked', async () => {
    render(<Index />);
    
    fireEvent.click(screen.getByTestId('scan-button'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/scan');
  });
  
  it('marks performance metrics when mounted', async () => {
    const { performanceMonitor } = require('@/utils/performance-monitor');
    
    render(<Index />);
    
    expect(performanceMonitor.mark).toHaveBeenCalledWith('index_page_mounted');
    
    // Wait for the idle callback to be executed
    await waitFor(() => {
      expect(performanceMonitor.mark).toHaveBeenCalledWith('routes_prefetched');
    });
  });
  
  it('cleans up session storage on mount', () => {
    const sessionStorageMock = {
      removeItem: vi.fn()
    };
    
    // Mock sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: sessionStorageMock,
      writable: true
    });
    
    render(<Index />);
    
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('returnToAfterScan');
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('scanAction');
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('preferredScanMode');
  });

  it('handles responsive layout', () => {
    // Test with mobile view
    vi.mocked(require('@/hooks/use-mobile').useIsMobile).mockReturnValue({ isMobile: true });
    
    render(<Index />);
    
    // Test with desktop view
    vi.mocked(require('@/hooks/use-mobile').useIsMobile).mockReturnValue({ isMobile: false });
    
    render(<Index />);
  });
});
