
import React, { useState } from 'react';
import { CheckSquare, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/hooks/use-theme';

type Task = {
  id: number;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
};

const TaskWidget = () => {
  const today = new Date();
  const formattedToday = format(today, 'yyyy-MM-dd');
  const { theme } = useTheme();
  
  const [tasks, setTasks] = React.useState<Task[]>([
    { id: 1, title: 'Buy groceries', completed: false, priority: 'high', dueDate: formattedToday },
    { id: 2, title: 'Call dentist', completed: false, priority: 'medium', dueDate: formattedToday },
    { id: 3, title: 'Finish presentation', completed: true, priority: 'low', dueDate: formattedToday },
    { id: 4, title: 'Schedule meeting', completed: false, priority: 'medium', dueDate: format(new Date(today.getTime() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd') },
    { id: 5, title: 'Pay bills', completed: false, priority: 'high', dueDate: format(new Date(today.getTime() - 24 * 60 * 60 * 1000), 'yyyy-MM-dd') },
  ]);
  
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const toggleTaskStatus = (taskId: number) => {
    setTasks(
      tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleAddTask = () => {
    if (!isAddingTask) {
      setIsAddingTask(true);
      return;
    }
    
    if (newTaskTitle.trim()) {
      const newId = Math.max(0, ...tasks.map(t => t.id)) + 1;
      const newTask: Task = {
        id: newId,
        title: newTaskTitle.trim(),
        completed: false,
        priority: 'medium',
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

  const todaysTasks = tasks
    .filter(task => task.dueDate === formattedToday)
    .sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  return (
    <Card className="h-full shadow-sm hover:shadow transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-2">
          <CheckSquare className="h-5 w-5 text-todo-purple" />
          <h3 className={cn(
            "font-medium",
            theme === 'light' ? "text-foreground" : "text-white"
          )}>Today's Quick Tasks</h3>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        {todaysTasks.length > 0 ? (
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {todaysTasks.map(task => (
              <div 
                key={task.id} 
                className={cn(
                  "flex items-center p-2 rounded-md bg-white dark:bg-gray-700 border dark:border-gray-600",
                  task.completed && "opacity-60"
                )}
              >
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
                <div className="flex flex-col">
                  <span className={cn(
                    "text-sm dark:text-gray-100",
                    task.completed && "line-through text-muted-foreground"
                  )}>
                    {task.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p>No tasks for today</p>
          </div>
        )}
        
        {isAddingTask ? (
          <div className="mt-3 space-y-2">
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
            variant="outline" 
            size="sm" 
            className="w-full mt-3 border-dashed border-todo-purple/30 text-todo-purple"
            onClick={handleAddTask}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Task
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskWidget;
