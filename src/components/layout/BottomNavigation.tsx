
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Camera, List, Calendar, File, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const navigationItems = [
  { icon: List, label: 'Shopping', path: '/shopping' },
  { icon: Calendar, label: 'Calendar', path: '/calendar' },
  { icon: Camera, label: 'Scan', path: '/scan' },
  { icon: File, label: 'Documents', path: '/documents' },
  { icon: Upload, label: 'Upload', path: '/upload' },
];

const BottomNavigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center h-14 sm:h-16">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full transition-colors",
                isActive ? "text-todo-purple-light" : "text-gray-500 hover:text-todo-purple"
              )}
            >
              <div className={cn(
                "flex items-center justify-center",
                isActive && "animate-scale-in"
              )}>
                <Icon size={isActive ? 22 : 18} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-xs mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
