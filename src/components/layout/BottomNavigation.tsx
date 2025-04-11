
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, ShoppingBag, FileText, Cpu, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/hooks/use-theme';

const BottomNavigation: React.FC = () => {
  const { isMobile, isIOS } = useIsMobile();
  const { theme } = useTheme();
  const location = useLocation();

  const textColorClass = theme === 'light' ? "text-foreground" : "text-white";

  const navItems = [
    { to: '/', icon: <Home className="h-5 w-5" />, label: 'Home', ariaLabel: 'Navigate to home page' },
    { to: '/calendar', icon: <Calendar className="h-5 w-5" />, label: 'Calendar', ariaLabel: 'Navigate to calendar' },
    { to: '/shopping', icon: <ShoppingBag className="h-5 w-5" />, label: 'Shopping', ariaLabel: 'Navigate to shopping list' },
    { to: '/documents', icon: <FileText className="h-5 w-5" />, label: 'Documents', ariaLabel: 'Navigate to documents' },
    { to: '/weather', icon: <Cloud className="h-5 w-5" />, label: 'Weather', ariaLabel: 'Navigate to weather' },
    { to: '/produce-recognition', icon: <Cpu className="h-5 w-5" />, label: 'Produce', ariaLabel: 'Navigate to produce recognition' },
  ];

  if (!isMobile) {
    return null;
  }

  return (
    <nav
      className={cn(
        "fixed z-50 w-full bottom-0 border-t border-border bg-secondary",
        isIOS ? "pb-safe-bottom" : "pb-2"
      )}
      aria-label="Bottom navigation"
      role="navigation"
    >
      <div className="container mx-auto flex items-center justify-between p-2">
        {navItems.map((item) => {
          // Check if this is the current route (exact match or starts with for nested routes)
          const isActive = location.pathname === item.to || 
                          (item.to !== '/' && location.pathname.startsWith(item.to));
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground min-h-[44px] min-w-[44px]",
                isActive
                  ? "text-primary bg-secondary/80"
                  : textColorClass
              )}
              aria-label={item.ariaLabel}
              aria-current={isActive ? "page" : undefined}
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
