
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import EditProduceDialog from '../EditProduceDialog';

// Mock necessary components
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, children }) => open ? <div data-testid="dialog-content">{children}</div> : null,
  DialogContent: ({ children }) => <div data-testid="dialog-content-inner">{children}</div>,
  DialogHeader: ({ children }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }) => <div data-testid="dialog-title">{children}</div>,
  DialogDescription: ({ children }) => <div data-testid="dialog-description">{children}</div>,
  DialogFooter: ({ children }) => <div data-testid="dialog-footer">{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }) => (
    <button onClick={onClick} data-testid="button">
      {children}
    </button>
  )
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props) => (
    <input
      data-testid="input"
      value={props.value}
      onChange={props.onChange}
      placeholder={props.placeholder}
    />
  )
}));

describe('EditProduceDialog', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();
  const mockItems = [
    { label: 'Apple', confidence: 0.95 },
    { label: 'Banana', confidence: 0.85 }
  ];
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders correctly when open', () => {
    render(
      <EditProduceDialog
        isOpen={true}
        items={mockItems}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });
  
  it('does not render when closed', () => {
    render(
      <EditProduceDialog
        isOpen={false}
        items={mockItems}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.queryByTestId('dialog-content')).not.toBeInTheDocument();
  });
  
  it('calls onSave with edited items when save button is clicked', () => {
    render(
      <EditProduceDialog
        isOpen={true}
        items={mockItems}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // Find all inputs (one for each item)
    const inputs = screen.getAllByTestId('input');
    expect(inputs).toHaveLength(mockItems.length);
    
    // Change the value of the first input
    fireEvent.change(inputs[0], { target: { value: 'Green Apple' } });
    
    // Click the save button
    const saveButtons = screen.getAllByTestId('button');
    const saveButton = saveButtons.find(button => button.textContent?.includes('Save'));
    fireEvent.click(saveButton!);
    
    // Expect onSave to be called with the updated items
    expect(mockOnSave).toHaveBeenCalledWith([
      { label: 'Green Apple', confidence: 0.95 },
      { label: 'Banana', confidence: 0.85 }
    ]);
  });
  
  it('calls onCancel when cancel button is clicked', () => {
    render(
      <EditProduceDialog
        isOpen={true}
        items={mockItems}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    // Click the cancel button
    const cancelButtons = screen.getAllByTestId('button');
    const cancelButton = cancelButtons.find(button => button.textContent?.includes('Cancel'));
    fireEvent.click(cancelButton!);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });
  
  it('handles empty items array gracefully', () => {
    render(
      <EditProduceDialog
        isOpen={true}
        items={[]}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText(/no items to edit/i)).toBeInTheDocument();
  });
});
