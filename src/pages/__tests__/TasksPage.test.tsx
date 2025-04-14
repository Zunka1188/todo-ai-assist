
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import TasksPage from '../TasksPage';
import { render as customRender } from '@/test-utils';

// Mock tasks service
vi.mock('@/services/tasks.service', () => ({
  getTasks: vi.fn().mockResolvedValue([
    { id: '1', title: 'Task 1', completed: false, priority: 'high', dueDate: '2025-04-20' },
    { id: '2', title: 'Task 2', completed: true, priority: 'medium', dueDate: '2025-04-15' },
    { id: '3', title: 'Task 3', completed: false, priority: 'low', dueDate: '2025-04-30' }
  ]),
  createTask: vi.fn().mockImplementation((task) => 
    Promise.resolve({ id: '4', ...task })
  ),
  updateTask: vi.fn().mockImplementation((id, updates) => 
    Promise.resolve({ id, ...updates })
  ),
  deleteTask: vi.fn().mockResolvedValue(true)
}));

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

describe('TasksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders loading state initially', () => {
    render(<TasksPage />);
    
    expect(screen.getByText(/loading tasks/i)).toBeInTheDocument();
  });
  
  it('loads and displays tasks', async () => {
    render(<TasksPage />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading tasks/i)).not.toBeInTheDocument();
    });
    
    // Check if tasks are displayed
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
    
    // Check task statuses
    const taskCheckboxes = screen.getAllByRole('checkbox');
    expect(taskCheckboxes[0]).not.toBeChecked(); // Task 1 is not completed
    expect(taskCheckboxes[1]).toBeChecked(); // Task 2 is completed
  });
  
  it('allows adding a new task', async () => {
    render(<TasksPage />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading tasks/i)).not.toBeInTheDocument();
    });
    
    // Find and click the add task button
    const addButton = screen.getByText(/add task/i);
    fireEvent.click(addButton);
    
    // Fill out the new task form
    const titleInput = screen.getByLabelText(/task title/i);
    fireEvent.change(titleInput, { target: { value: 'New Task' } });
    
    const prioritySelect = screen.getByLabelText(/priority/i);
    fireEvent.change(prioritySelect, { target: { value: 'high' } });
    
    const dueDateInput = screen.getByLabelText(/due date/i);
    fireEvent.change(dueDateInput, { target: { value: '2025-05-01' } });
    
    // Submit the form
    const submitButton = screen.getByText(/save task/i);
    fireEvent.click(submitButton);
    
    // Check if createTask was called with the right data
    await waitFor(() => {
      expect(require('@/services/tasks.service').createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Task',
          priority: 'high',
          dueDate: '2025-05-01',
          completed: false
        })
      );
    });
    
    // Check toast notification
    expect(require('@/hooks/use-toast').useToast().toast).toHaveBeenCalled();
  });
  
  it('allows completing a task', async () => {
    render(<TasksPage />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading tasks/i)).not.toBeInTheDocument();
    });
    
    // Find Task 1 checkbox (uncompleted) and click it
    const taskCheckboxes = screen.getAllByRole('checkbox');
    fireEvent.click(taskCheckboxes[0]);
    
    // Check if updateTask was called with completed=true
    await waitFor(() => {
      expect(require('@/services/tasks.service').updateTask).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          completed: true
        })
      );
    });
  });
  
  it('allows deleting a task', async () => {
    render(<TasksPage />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading tasks/i)).not.toBeInTheDocument();
    });
    
    // Find Task 1 delete button and click it
    const deleteButtons = screen.getAllByLabelText(/delete task/i);
    fireEvent.click(deleteButtons[0]);
    
    // Confirm deletion in the dialog
    const confirmButton = screen.getByText(/confirm/i);
    fireEvent.click(confirmButton);
    
    // Check if deleteTask was called with the right ID
    await waitFor(() => {
      expect(require('@/services/tasks.service').deleteTask).toHaveBeenCalledWith('1');
    });
    
    // Check toast notification
    expect(require('@/hooks/use-toast').useToast().toast).toHaveBeenCalled();
  });
  
  it('allows filtering tasks', async () => {
    render(<TasksPage />);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading tasks/i)).not.toBeInTheDocument();
    });
    
    // Click filter button for completed tasks
    const completedFilterButton = screen.getByText(/completed/i);
    fireEvent.click(completedFilterButton);
    
    // Only completed task should be visible
    expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.queryByText('Task 3')).not.toBeInTheDocument();
    
    // Click filter button for active tasks
    const activeFilterButton = screen.getByText(/active/i);
    fireEvent.click(activeFilterButton);
    
    // Only active tasks should be visible
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
  });
  
  it('handles error during tasks fetch', async () => {
    // Override the mock to simulate an error
    vi.mocked(require('@/services/tasks.service').getTasks).mockRejectedValueOnce(
      new Error('Failed to fetch tasks')
    );
    
    render(<TasksPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading tasks/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/failed to fetch tasks/i)).toBeInTheDocument();
    expect(require('@/hooks/use-toast').useToast().toast).toHaveBeenCalled();
  });
});
