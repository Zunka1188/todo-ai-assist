import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, ShoppingBag, FileText, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/hooks/use-theme';

const BottomNavigation: React.FC = () => {
  const { isMobile, isIOS } = useIsMobile();
  const { theme } = useTheme();
  const location = useLocation();

  const textColorClass = theme === 'light' ? "text-foreground" : "text-white";

  const navItems = [
    { to: '/', icon: <Home className="h-5 w-5" />, label: 'Home' },
    { to: '/calendar', icon: <Calendar className="h-5 w-5" />, label: 'Calendar' },
    { to: '/shopping', icon: <ShoppingBag className="h-5 w-5" />, label: 'Shopping' },
    { to: '/documents', icon: <FileText className="h-5 w-5" />, label: 'Documents' },
    { to: '/produce-recognition', icon: <Cpu className="h-5 w-5" />, label: 'Produce' },
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
    >
      <div className="container mx-auto flex items-center justify-between p-2">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground",
              location.pathname === item.to
                ? "text-accent-foreground"
                : textColorClass
            )}
          >
            {item.icon}
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
