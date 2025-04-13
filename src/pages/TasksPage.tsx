
import React, { useState } from 'react';
import { ArrowLeft, CheckSquare, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import AppHeader from '@/components/layout/AppHeader';
import { Input } from '@/components/ui/input';
import SocialShareMenu from '@/components/features/shared/SocialShareMenu';

type Task = {
  id: number;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
};

const TasksPage = () => {
  const navigate = useNavigate();
  
  // Sample tasks data
  const [tasks, setTasks] = React.useState<Task[]>([
    { id: 1, title: 'Buy groceries', completed: false, priority: 'high', dueDate: '2025-04-05' },
    { id: 2, title: 'Call dentist', completed: false, priority: 'medium', dueDate: '2025-04-10' },
    { id: 3, title: 'Finish presentation', completed: true, priority: 'low', dueDate: '2025-04-03' },
    { id: 4, title: 'Schedule meeting', completed: false, priority: 'medium', dueDate: '2025-04-07' },
    { id: 5, title: 'Pay electricity bill', completed: false, priority: 'high', dueDate: '2025-04-15' },
    { id: 6, title: 'Order birthday gift', completed: false, priority: 'medium', dueDate: '2025-04-20' },
    { id: 7, title: 'Clean garage', completed: true, priority: 'low', dueDate: '2025-04-02' },
  ]);

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const toggleTaskStatus = (taskId: number) => {
    setTasks(
      tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleAddTask = () => {
    if (!isAddingTask) {
      setIsAddingTask(true);
      return;
    }
    
    if (newTaskTitle.trim()) {
      const newId = Math.max(0, ...tasks.map(t => t.id)) + 1;
      const today = new Date();
      const formattedToday = today.toISOString().split('T')[0];
      
      const newTask: Task = {
        id: newId,
        title: newTaskTitle.trim(),
        completed: false,
        priority: 'medium', // Default priority
        dueDate: formattedToday,
      };
      
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };

  const cancelAddTask = () => {
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(selectedTask?.id === task.id ? null : task);
  };

  // Generate share text for tasks
  const getTaskShareText = () => {
    const pendingTasks = tasks.filter(task => !task.completed).map(task => task.title);
    const completedTasks = tasks.filter(task => task.completed).map(task => task.title);
    
    const text = [
      "My Task List:",
      pendingTasks.length ? `To do: ${pendingTasks.join(", ")}` : "",
      completedTasks.length ? `Completed: ${completedTasks.join(", ")}` : ""
    ].filter(Boolean).join("\n");
    
    return text;
  };

  // Filter to show incomplete tasks first, then by priority
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <AppHeader 
            title="Tasks" 
            subtitle="Manage your to-do list and stay organized"
          />
        </div>
        <div>
          <SocialShareMenu 
            title="My Task List" 
            text={getTaskShareText()}
            showLabel={true}
            buttonSize="sm" 
          />
        </div>
      </div>

      <div className="space-y-2">
        {sortedTasks.map(task => (
          <div 
            key={task.id} 
            className={cn(
              "flex items-center justify-between p-3 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700",
              task.completed && "opacity-60",
              selectedTask?.id === task.id && "ring-2 ring-primary"
            )}
            onClick={() => handleTaskSelect(task)}
          >
            <div className="flex items-center">
              <button 
                className={cn(
                  "w-5 h-5 rounded-md border mr-3 flex-shrink-0",
                  task.completed ? "bg-todo-purple border-todo-purple" : "border-gray-300 dark:border-gray-500",
                  {
                    "border-red-400": !task.completed && task.priority === 'high',
                    "border-yellow-400": !task.completed && task.priority === 'medium',
                    "border-green-400": !task.completed && task.priority === 'low',
                  }
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTaskStatus(task.id);
                }}
              >
                {task.completed && (
                  <CheckSquare className="w-4 h-4 text-white" />
                )}
              </button>
              <div>
                <span className={cn(
                  "text-sm font-medium text-foreground dark:text-white",
                  task.completed && "line-through text-muted-foreground"
                )}>
                  {task.title}
                </span>
                {task.dueDate && (
                  <p className="text-xs text-muted-foreground dark:text-gray-400">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedTask?.id === task.id && (
                <SocialShareMenu 
                  title={`Task: ${task.title}`} 
                  text={`${task.title} - Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}`}
                  buttonSize="icon"
                  buttonVariant="ghost"
                  className="h-8 w-8"
                />
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTask(task.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      {isAddingTask ? (
        <div className="space-y-2 p-3 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
          <Input
            type="text"
            placeholder="New task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddTask();
              if (e.key === 'Escape') cancelAddTask();
            }}
          />
          <div className="flex gap-2">
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1 bg-todo-purple hover:bg-todo-purple/90"
              onClick={handleAddTask}
            >
              Add
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1"
              onClick={cancelAddTask}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button 
          className="w-full bg-todo-purple text-white hover:bg-todo-purple-dark"
          onClick={handleAddTask}
        >
          <Plus className="h-4 w-4 mr-2" /> Add New Task
        </Button>
      )}
    </div>
  );
};

export default TasksPage;
