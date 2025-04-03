
import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface AppLayoutProps {
  className?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ className }) => {
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-background">
      <main className={cn("container mx-auto px-4 pb-20", className)}>
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
};

export default AppLayout;
