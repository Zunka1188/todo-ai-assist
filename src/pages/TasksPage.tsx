
import React from 'react';
import { ArrowLeft, CheckSquare, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import AppHeader from '@/components/layout/AppHeader';

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

  const toggleTaskStatus = (taskId: number) => {
    setTasks(
      tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
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

      <div className="space-y-2">
        {sortedTasks.map(task => (
          <div 
            key={task.id} 
            className={cn(
              "flex items-center justify-between p-3 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700",
              task.completed && "opacity-60"
            )}
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
                onClick={() => toggleTaskStatus(task.id)}
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
            <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      
      <Button 
        className="w-full bg-todo-purple text-white hover:bg-todo-purple-dark"
      >
        <Plus className="h-4 w-4 mr-2" /> Add New Task
      </Button>
    </div>
  );
};

export default TasksPage;
