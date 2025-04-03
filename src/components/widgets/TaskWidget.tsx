
import React from 'react';
import { CheckSquare, ChevronRight, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Task = {
  id: number;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
};

const TaskWidget = () => {
  // Sample tasks data
  const [tasks, setTasks] = React.useState<Task[]>([
    { id: 1, title: 'Buy groceries', completed: false, priority: 'high' },
    { id: 2, title: 'Call dentist', completed: false, priority: 'medium' },
    { id: 3, title: 'Finish presentation', completed: true, priority: 'low' },
    { id: 4, title: 'Schedule meeting', completed: false, priority: 'medium' },
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

  // Only show first 4 tasks in the widget
  const displayedTasks = sortedTasks.slice(0, 4);

  return (
    <Card className="metallic-card shadow-sm hover:shadow transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-2">
          <CheckSquare className="h-5 w-5 text-todo-purple" />
          <h3 className="font-medium text-todo-black">Tasks</h3>
        </div>
        <Link to="/tasks" className="text-sm text-todo-purple flex items-center">
          View all <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-2">
          {displayedTasks.map(task => (
            <div 
              key={task.id} 
              className={cn(
                "flex items-center p-2 border rounded-md bg-white",
                task.completed && "opacity-60"
              )}
            >
              <button 
                className={cn(
                  "w-5 h-5 rounded-md border mr-3 flex-shrink-0",
                  task.completed ? "bg-todo-purple border-todo-purple" : "border-gray-300",
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
              <span className={cn(
                "text-sm",
                task.completed && "line-through text-muted-foreground"
              )}>
                {task.title}
              </span>
            </div>
          ))}
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-3 border-dashed border-todo-purple/30 text-todo-purple"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Task
        </Button>
      </CardContent>
    </Card>
  );
};

export default TaskWidget;
