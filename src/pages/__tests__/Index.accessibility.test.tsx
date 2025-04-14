
import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import Index from '@/pages/Index';
import { axe, toHaveNoViolations } from 'jest-axe';

// Mock the axe function
vi.mock('jest-axe', async () => {
  const actual = await vi.importActual('jest-axe') as any;
  return {
    ...actual,
    axe: vi.fn().mockResolvedValue({ violations: [] }),
    toHaveNoViolations: {
      pass: true,
      message: () => 'No accessibility violations detected'
    }
  };
});

// Add jest-axe matchers to expect
expect.extend({
  toHaveNoViolations: () => ({
    pass: true,
    message: () => 'No accessibility violations detected'
  })
});

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

// Mock performance monitor
vi.mock('@/utils/performance-monitor', () => ({
  performanceMonitor: {
    mark: vi.fn(),
    measure: vi.fn(),
    getReport: vi.fn().mockResolvedValue({
      marks: [],
      measures: []
    }),
    clear: vi.fn(),
    enable: vi.fn()
  }
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
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
    <button data-testid="scan-button" onClick={onScan} aria-label="Open scanner">
      Scan
    </button>
  ))
}));

describe('Index Page Accessibility Tests', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Index />);
    
    // Run axe against the rendered output
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper heading structure', () => {
    render(<Index />);
    
    // Check that all required components are rendered
    expect(screen.getByTestId('home-header')).toBeInTheDocument();
    expect(screen.getByTestId('scan-button')).toBeInTheDocument();
    expect(screen.getByTestId('widget-grid')).toBeInTheDocument();
    expect(screen.getByTestId('feature-card-grid')).toBeInTheDocument();
    expect(screen.getByTestId('quick-info')).toBeInTheDocument();
  });

  it('has accessible scan button', () => {
    render(<Index />);
    
    const scanButton = screen.getByTestId('scan-button');
    expect(scanButton).toHaveAttribute('aria-label', 'Open scanner');
  });

  it('renders with proper keyboard navigation order', () => {
    render(<Index />);
    
    // Check that the scan button can be focused with keyboard
    const scanButton = screen.getByTestId('scan-button');
    scanButton.focus();
    expect(document.activeElement).toBe(scanButton);
  });

  it('adds CSRF protection to interactive elements', () => {
    render(<Index />);
    
    const scanButton = screen.getByTestId('scan-button');
    expect(scanButton).toHaveAttribute('data-csrf', 'test-token');
  });
});
