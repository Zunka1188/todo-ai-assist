
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Calendar, Upload, FileText, Camera, CheckSquare, Settings } from 'lucide-react';

const BottomNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/shopping', icon: ShoppingCart, label: 'Shopping' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/scan', icon: Camera, label: 'Scan' },
    { path: '/documents', icon: FileText, label: 'Documents' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="container mx-auto px-2 py-2 flex justify-between items-center">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link 
            key={path}
            to={path} 
            className={`flex flex-col items-center justify-center p-2 rounded-md transition-colors ${
              isActive(path) 
                ? 'text-primary font-medium' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive(path) ? 'text-primary' : ''}`} />
            <span className="text-xs mt-1">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
