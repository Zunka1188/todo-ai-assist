import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/hooks/use-theme';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Settings, FileText, Menu, Home, Calendar, ShoppingBag, HelpCircle, MessageCircle, Cloud } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AIFoodAssistant from '@/components/features/ai/AIFoodAssistant';

interface AppLayoutProps {
  className?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ className }) => {
  const { toast } = useToast();
  const { isMobile, isIOS, isAndroid, windowWidth } = useIsMobile();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [chatOpen, setChatOpen] = useState(false);
  
  useEffect(() => {
    if (localStorage.getItem('theme') === null) {
      setTheme('dark');
    }
  }, []);
  
  useEffect(() => {
    if (isIOS) {
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        viewportMeta.setAttribute('content', 
          'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
      }
      
      document.body.classList.add('ios-device');
    }
    
    if (isAndroid) {
      document.body.classList.add('android-device');
    }
    
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

  const handleToggleChat = () => {
    setChatOpen(!chatOpen);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className={cn(
        "container mx-auto px-2 sm:px-4 pt-2 sm:pt-4 flex justify-between items-center gap-2",
        isMobile ? "h-10" : "h-12 sm:h-14",
        isIOS && "pt-safe-top"
      )}>
        <div className="flex items-center">
          <button 
            onClick={handleToggleChat}
            className="p-2 rounded-md hover:bg-secondary min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
            aria-label="Open AI Food Assistant"
          >
            <MessageCircle className={cn("h-5 w-5", textColorClass)} />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
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
                <Link to="/documents" className="cursor-pointer flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className={textColorClass}>Documents</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/weather" className="cursor-pointer flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  <span className={textColorClass}>Weather</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/troubleshoot" className="cursor-pointer flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  <span className={textColorClass}>Troubleshoot</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/settings" className="p-2 rounded-md hover:bg-secondary min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation">
            <Settings className={cn("h-5 w-5", textColorClass)} />
          </Link>
          <ThemeToggle />
        </div>
      </div>
      <main className={cn(
        "container mx-auto px-2 sm:px-4 flex-1 relative", 
        isMobile ? "pb-24 pt-1" : "py-4",
        isIOS && "pb-safe-bottom",
        className
      )}>
        <Outlet />
      </main>
      <BottomNavigation />
      
      <AIFoodAssistant isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default AppLayout;
