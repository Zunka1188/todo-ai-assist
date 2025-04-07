
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, Calendar, Camera, FileText } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { isMobile } = useIsMobile();
  const { theme } = useTheme();

  const isActive = (path: string) => {
    // Special case for documents with subtabs
    if (path === '/documents' && currentPath.startsWith('/documents/')) {
      return true;
    }
    return currentPath === path;
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Home', action: () => navigate('/') },
    { path: '/shopping', icon: ShoppingBag, label: 'Shopping', action: () => navigate('/shopping') },
    { path: '/scan', icon: Camera, label: 'Smart Scanner', action: () => navigate('/scan') },
    { path: '/calendar', icon: Calendar, label: 'Calendar', action: () => navigate('/calendar') },
    { path: '/documents', icon: FileText, label: 'Documents', action: () => navigate('/documents') },
  ];

  // If not mobile, don't render the bottom navigation
  if (!isMobile) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 shadow-md safe-bottom">
      <div className="container mx-auto px-1 py-2 flex justify-between items-center">
        {navItems.map(({ path, icon: Icon, label, action }) => (
          <Link 
            key={path}
            to={path}
            className={cn(
              "flex flex-col items-center justify-center min-w-[60px] p-2 rounded-md transition-colors",
              "active:bg-secondary/70 touch-manipulation",
              isActive(path) 
                ? "text-primary font-medium" 
                : theme === 'light'
                  ? "text-foreground hover:text-primary"
                  : "text-white hover:text-foreground"
            )}
          >
            <Icon className={cn(
              "h-5 w-5", 
              isActive(path) 
                ? "text-primary" 
                : theme === 'light'
                  ? "text-foreground/90" 
                  : "text-white"
            )} />
            <span className={cn(
              "text-[12px] mt-1 leading-tight text-center", // Updated to 12px for captions
              isActive(path) 
                ? "font-medium" 
                : "font-normal",
              theme === 'dark' && !isActive(path) ? "text-white/90" : ""
            )}>
              {label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
