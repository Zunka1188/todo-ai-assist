
import React, { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/hooks/use-theme';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Settings, FileText, CheckSquare, Menu, Home, Calendar, ShoppingBag, Camera, CreditCard, ScanLine } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ScanButton from '../features/scanning/ScanButton';

interface AppLayoutProps {
  className?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ className }) => {
  const { toast } = useToast();
  const { isMobile, isIOS, isAndroid, windowWidth } = useIsMobile();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  
  // Set the theme to dark by default as specified in the requirements
  useEffect(() => {
    // Only set it once when the app first loads
    if (localStorage.getItem('theme') === null) {
      setTheme('dark');
    }
  }, []);
  
  // Handle iOS safe areas and viewport issues
  useEffect(() => {
    if (isIOS) {
      // Set viewport meta to prevent unwanted zooming
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        viewportMeta.setAttribute('content', 
          'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
      }
      
      // Add iOS safe area classes
      document.body.classList.add('ios-device');
    }
    
    if (isAndroid) {
      document.body.classList.add('android-device');
    }
    
    // Remove the splash screen on mobile devices if it exists
    const splashScreen = document.getElementById('app-splash-screen');
    if (splashScreen) {
      setTimeout(() => {
        splashScreen.classList.add('fade-out');
        setTimeout(() => {
          splashScreen.remove();
        }, 400);
      }, 500);
    }
  }, [isIOS, isAndroid]);

  const textColorClass = theme === 'light' ? "text-foreground" : "text-white";

  // Don't show scan button on scan page
  const showScanButton = location.pathname !== '/scan';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className={cn(
        "container mx-auto px-2 sm:px-4 pt-2 sm:pt-4 flex justify-end items-center gap-2 h-12 sm:h-14",
        isIOS && "pt-safe-top"
      )}>
        <DropdownMenu>
          <DropdownMenuTrigger className="p-2 rounded-md hover:bg-secondary min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation">
            <Menu className={cn("h-5 w-5", textColorClass)} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background border border-border w-56">
            <DropdownMenuItem asChild>
              <Link to="/" className="cursor-pointer flex items-center gap-2 h-10">
                <Home className="h-4 w-4" />
                <span className={textColorClass}>Home</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/shopping" className="cursor-pointer flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span className={textColorClass}>Shopping</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/calendar" className="cursor-pointer flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className={textColorClass}>Calendar</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/scan" className="cursor-pointer flex items-center gap-2">
                <Camera className="h-4 w-4" />
                <span className={textColorClass}>Scan</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/documents" className="cursor-pointer flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className={textColorClass}>Documents</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/tasks" className="cursor-pointer flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                <span className={textColorClass}>Tasks</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/spending" className="cursor-pointer flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className={textColorClass}>Spending</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Link to="/settings" className="p-2 rounded-md hover:bg-secondary min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation">
          <Settings className={cn("h-5 w-5", textColorClass)} />
        </Link>
        <ThemeToggle />
      </div>
      <main className={cn(
        "container mx-auto px-2 sm:px-4 flex-1 relative", 
        isMobile ? "pb-24 pt-1" : "py-4",
        isIOS && "pb-safe-bottom",
        className
      )}>
        <Outlet />
        
        {/* Floating Scan Button */}
        {showScanButton && (
          <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-30">
            <ScanButton
              size={isMobile ? "default" : "lg"}
              className="shadow-xl"
            />
          </div>
        )}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default AppLayout;
