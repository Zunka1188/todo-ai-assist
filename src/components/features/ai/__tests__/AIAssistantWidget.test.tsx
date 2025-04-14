
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AIAssistantWidget from '../../../widgets/AIAssistantWidget';

// Mock the components and hooks used by AIAssistantWidget
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }) => (
    <div data-testid="dialog" style={{ display: open ? 'block' : 'none' }}>
      {children}
      <button onClick={() => onOpenChange(false)}>Close Dialog</button>
    </div>
  ),
  DialogContent: ({ children }) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }) => <div data-testid="dialog-title">{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
}));

vi.mock('@/components/features/ai/AIFoodAssistant', () => ({
  default: ({ isOpen, onClose }) => (
    <div data-testid="ai-food-assistant">
      AI Food Assistant
      <button onClick={onClose}>Close Assistant</button>
    </div>
  ),
}));

vi.mock('@/components/widgets/shared/WidgetWrapper', () => ({
  default: ({ children, title }) => (
    <div data-testid="widget-wrapper">
      <h3>{title}</h3>
      {children}
    </div>
  ),
}));

describe('AIAssistantWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with the correct title', () => {
    render(<AIAssistantWidget />);
    
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    expect(screen.getByText('Ask me about recipes and meal planning')).toBeInTheDocument();
  });

  it('opens dialog when Ask AI button is clicked', () => {
    render(<AIAssistantWidget />);
    
    // Initially dialog should be hidden
    expect(screen.getByTestId('dialog')).not.toBeVisible();
    
    // Click the Ask AI button
    fireEvent.click(screen.getByText('Ask AI'));
    
    // Dialog should be visible now
    expect(screen.getByTestId('dialog')).toBeVisible();
  });

  it('closes dialog when Close Dialog button is clicked', () => {
    render(<AIAssistantWidget />);
    
    // Open the dialog
    fireEvent.click(screen.getByText('Ask AI'));
    expect(screen.getByTestId('dialog')).toBeVisible();
    
    // Close the dialog
    fireEvent.click(screen.getByText('Close Dialog'));
    
    // Dialog should be hidden
    expect(screen.getByTestId('dialog')).not.toBeVisible();
  });

  it('closes AIFoodAssistant when Close Assistant button is clicked', () => {
    render(<AIAssistantWidget />);
    
    // Open the dialog
    fireEvent.click(screen.getByText('Ask AI'));
    expect(screen.getByTestId('dialog')).toBeVisible();
    
    // Close the assistant
    fireEvent.click(screen.getByText('Close Assistant'));
    
    // Dialog should be hidden
    expect(screen.getByTestId('dialog')).not.toBeVisible();
  });
});
