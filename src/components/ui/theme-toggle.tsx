
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { isMobile } = useIsMobile();
  
  const isDark = theme === 'dark';

  // Base button component with consistent styling for both mobile and desktop
  const ToggleButton = () => (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme} 
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      className="hover:bg-secondary transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-primary" />
      ) : (
        <Moon className="h-5 w-5 text-foreground" />
      )}
    </Button>
  );

  // On mobile, we don't need the tooltip
  if (isMobile) {
    return <ToggleButton />;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <ToggleButton />
      </TooltipTrigger>
      <TooltipContent className="bg-card text-card-foreground border-border">
        <p>Toggle {isDark ? 'light' : 'dark'} mode</p>
      </TooltipContent>
    </Tooltip>
  );
}
