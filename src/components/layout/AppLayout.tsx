
import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';

interface AppLayoutProps {
  className?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ className }) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 sm:px-4 pt-4 flex justify-end items-center gap-2">
        <Link to="/settings" className="p-2 rounded-md hover:bg-secondary">
          <Settings className="h-5 w-5" />
        </Link>
        <ThemeToggle />
      </div>
      <main className={cn(
        "container mx-auto px-2 sm:px-4 pb-16 sm:pb-20", 
        className
      )}>
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
};

export default AppLayout;
