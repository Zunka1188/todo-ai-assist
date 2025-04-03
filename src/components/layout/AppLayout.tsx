
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/hooks/use-theme';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Settings, FileText, CheckSquare, Menu, Home, Calendar, ShoppingBag, Camera, CreditCard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppLayoutProps {
  className?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ className }) => {
  const { toast } = useToast();
  const { isMobile } = useIsMobile();
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="container mx-auto px-2 sm:px-4 pt-2 sm:pt-4 flex justify-end items-center gap-2 h-12 sm:h-14">
        <DropdownMenu>
          <DropdownMenuTrigger className="p-2 rounded-md hover:bg-secondary min-h-[44px] min-w-[44px] flex items-center justify-center">
            <Menu className={theme === 'light' ? "h-5 w-5 text-foreground" : "h-5 w-5 text-foreground/90"} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background border border-border w-56">
            <DropdownMenuItem asChild>
              <Link to="/" className="cursor-pointer flex items-center gap-2 h-10">
                <Home className="h-4 w-4" />
                <span className="text-high-contrast">Home</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/shopping" className="cursor-pointer flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span className="text-high-contrast">Shopping</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/calendar" className="cursor-pointer flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-high-contrast">Calendar</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/scan" className="cursor-pointer flex items-center gap-2">
                <Camera className="h-4 w-4" />
                <span className="text-high-contrast">Scan</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/documents" className="cursor-pointer flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-high-contrast">Documents</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/tasks" className="cursor-pointer flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                <span className="text-high-contrast">Tasks</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/upload" className="cursor-pointer flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-high-contrast">Upload</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/spending" className="cursor-pointer flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="text-high-contrast">Spending</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Link to="/settings" className="p-2 rounded-md hover:bg-secondary min-h-[44px] min-w-[44px] flex items-center justify-center">
          <Settings className={theme === 'light' ? "h-5 w-5 text-foreground" : "h-5 w-5 text-foreground/90"} />
        </Link>
        <ThemeToggle />
      </div>
      <main className={cn(
        "container mx-auto px-2 sm:px-4 flex-1", 
        isMobile ? "pb-20 pt-1" : "py-4",
        className
      )}>
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
};

export default AppLayout;
