
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import TasksPage from '@/pages/TasksPage';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

// Mock SocialShareMenu
vi.mock('@/components/features/shared/SocialShareMenu', () => ({
  default: ({ title, text, showLabel, buttonSize, buttonVariant, className }: any) => (
    <button 
      data-testid="social-share" 
      data-title={title}
      data-text={text}
      className={className || ''}
    >
      {showLabel ? 'Share' : 'Share Icon'}
    </button>
  )
}));

describe('TasksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the task list', () => {
    render(<TasksPage />);
    expect(screen.getByText(/tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/manage your to-do list/i)).toBeInTheDocument();
  });

  it('allows adding a new task', () => {
    render(<TasksPage />);
    
    // Click add new task button
    fireEvent.click(screen.getByText(/add new task/i));
    
    // Input field should appear
    const input = screen.getByPlaceholderText(/new task/i);
    fireEvent.change(input, { target: { value: 'Test new task' } });
    
    // Click add button
    fireEvent.click(screen.getByText(/^add$/i));
    
    // New task should appear in the list
    expect(screen.getByText('Test new task')).toBeInTheDocument();
  });

  it('can mark tasks as completed', () => {
    render(<TasksPage />);
    
    // Find a task that's not completed
    const taskTitle = 'Buy groceries';
    expect(screen.getByText(taskTitle)).toBeInTheDocument();
    
    // Find the checkbox for this task (it's a button with the task title in the same container)
    const taskContainer = screen.getByText(taskTitle).closest('div').parentElement;
    const checkbox = taskContainer.querySelector('button');
    
    // Click the checkbox to mark as completed
    fireEvent.click(checkbox);
    
    // Task should be marked as completed (have line-through class)
    expect(screen.getByText(taskTitle)).toHaveClass('line-through');
  });

  it('can delete tasks', () => {
    render(<TasksPage />);
    
    // Find a specific task
    const taskTitle = 'Buy groceries';
    const taskElement = screen.getByText(taskTitle);
    expect(taskElement).toBeInTheDocument();
    
    // Find the delete button in the same container
    const taskContainer = taskElement.closest('div').parentElement;
    const deleteButtons = taskContainer.querySelectorAll('button');
    const deleteButton = Array.from(deleteButtons).find(
      button => button.querySelector('svg')
    );
    
    // Click delete button
    fireEvent.click(deleteButton);
    
    // Task should be removed
    expect(screen.queryByText(taskTitle)).not.toBeInTheDocument();
  });

  it('can cancel adding a new task', () => {
    render(<TasksPage />);
    
    // Click add new task button
    fireEvent.click(screen.getByText(/add new task/i));
    
    // Input field should appear
    const input = screen.getByPlaceholderText(/new task/i);
    fireEvent.change(input, { target: { value: 'Task to be cancelled' } });
    
    // Click cancel button
    fireEvent.click(screen.getByText(/cancel/i));
    
    // Input should disappear
    expect(screen.queryByPlaceholderText(/new task/i)).not.toBeInTheDocument();
    
    // New task should not be added
    expect(screen.queryByText('Task to be cancelled')).not.toBeInTheDocument();
  });
  
  it('can select a task to see more options', () => {
    render(<TasksPage />);
    
    // Find a task
    const taskTitle = 'Buy groceries';
    const taskElement = screen.getByText(taskTitle);
    
    // Click on the task to select it
    fireEvent.click(taskElement.closest('div').parentElement);
    
    // Share button should appear for the selected task
    const shareButton = screen.getAllByTestId('social-share')[1]; // The second share button (task specific)
    expect(shareButton).toBeInTheDocument();
    expect(shareButton).toHaveAttribute('data-title', `Task: ${taskTitle}`);
  });
});
