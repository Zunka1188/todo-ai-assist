
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Calendar, Camera, Settings } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const BottomNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const isMobile = useIsMobile();

  const isActive = (path: string) => currentPath === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/shopping', icon: ShoppingCart, label: 'Shopping' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/scan', icon: Camera, label: 'Scan' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  // If not mobile, don't render the bottom navigation
  if (!isMobile) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="container mx-auto px-1 py-2 flex justify-between items-center">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link 
            key={path}
            to={path} 
            className={`flex flex-col items-center justify-center min-w-[60px] p-2 rounded-md transition-colors ${
              isActive(path) 
                ? 'text-primary font-medium' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive(path) ? 'text-primary' : ''}`} />
            <span className="text-[10px] mt-1 leading-tight text-center">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
