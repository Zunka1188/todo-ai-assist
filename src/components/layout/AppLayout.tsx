
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/hooks/use-theme';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Settings, FileText, Menu, Home, Calendar, ShoppingBag, HelpCircle, Cloud, MessageSquare, Leaf } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AIFoodAssistant from '@/components/features/ai/AIFoodAssistant';

interface AppLayoutProps {
  className?: string;
  children?: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ className, children }) => {
  const { toast } = useToast();
  const { isMobile, isIOS, isAndroid, windowWidth } = useIsMobile();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [chatOpen, setChatOpen] = useState(false);
  
  useEffect(() => {
    // Check theme once on initial render
    if (localStorage.getItem('theme') === null) {
      setTheme('dark');
    }
  }, [setTheme]);
  
  useEffect(() => {
    // Apply mobile device optimizations
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
    
    // Handle splash screen fading
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

  // Ensure consistent text styling across themes
  const textColorClass = theme === 'light' ? "text-foreground" : "text-white";
  
  // Updated mobile text classes based on LinkedIn benchmarks
  const mobileHeadingClass = isMobile ? "text-[20px]" : ""; // Headings: 20px
  const mobileSubheadingClass = isMobile ? "text-[16px]" : ""; // Subheadings: 16px
  const mobileBodyTextClass = isMobile ? "text-[14px]" : ""; // Body text: 14px
  const mobileCaptionTextClass = isMobile ? "text-[12px]" : ""; // Caption text: 12px

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className={cn(
        "container mx-auto px-2 sm:px-4 pt-2 sm:pt-4 flex justify-between items-center gap-2",
        isMobile ? "h-10" : "h-12 sm:h-14",
        isIOS && "pt-safe-top"
      )}>
        <div className="flex items-center">
          <button
            onClick={() => setChatOpen(true)}
            className="p-2 rounded-md hover:bg-secondary min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
            aria-label="Open chat assistant"
          >
            <MessageSquare className={cn("h-5 w-5", textColorClass)} />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="p-2 rounded-md hover:bg-secondary min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation" aria-label="Menu">
              <Menu className={cn("h-5 w-5", textColorClass)} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background border border-border w-56 z-50">
              <DropdownMenuItem asChild>
                <Link to="/" className={cn("cursor-pointer flex items-center gap-2 h-10", isMobile ? mobileBodyTextClass : "")}>
                  <Home className="h-4 w-4" />
                  <span className={textColorClass}>Home</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/shopping" className={cn("cursor-pointer flex items-center gap-2", isMobile ? mobileBodyTextClass : "")}>
                  <ShoppingBag className="h-4 w-4" />
                  <span className={textColorClass}>Shopping</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/calendar" className={cn("cursor-pointer flex items-center gap-2", isMobile ? mobileBodyTextClass : "")}>
                  <Calendar className="h-4 w-4" />
                  <span className={textColorClass}>Calendar</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/documents" className={cn("cursor-pointer flex items-center gap-2", isMobile ? mobileBodyTextClass : "")}>
                  <FileText className="h-4 w-4" />
                  <span className={textColorClass}>Documents</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/weather" className={cn("cursor-pointer flex items-center gap-2", isMobile ? mobileBodyTextClass : "")}>
                  <Cloud className="h-4 w-4" />
                  <span className={textColorClass}>Weather</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/troubleshoot" className={cn("cursor-pointer flex items-center gap-2", isMobile ? mobileBodyTextClass : "")}>
                  <HelpCircle className="h-4 w-4" />
                  <span className={textColorClass}>Troubleshoot</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/produce-recognition" className={cn("cursor-pointer flex items-center gap-2", isMobile ? mobileBodyTextClass : "")}>
                  <Leaf className="h-4 w-4" />
                  <span className={textColorClass}>Produce Recognition</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/settings" 
            className="p-2 rounded-md hover:bg-secondary min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
            aria-label="Settings"
          >
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
      )}
      role="main"
      >
        {children}
      </main>
      <BottomNavigation />
      
      <AIFoodAssistant isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default AppLayout;
