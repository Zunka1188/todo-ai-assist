
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { isMobile } = useIsMobile();

  // Base button component with consistent styling for both mobile and desktop
  const ToggleButton = () => (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme} 
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      className="hover:bg-secondary transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-foreground" />
      ) : (
        <Sun className="h-5 w-5 text-todo-purple-light" />
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
        <p>Toggle {theme === 'light' ? 'dark' : 'light'} mode</p>
      </TooltipContent>
    </Tooltip>
  );
}
