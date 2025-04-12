import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
interface AppHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  backTo?: string; // Added the backTo prop
}
const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  icon,
  className,
  actions,
  backTo
}) => {
  const {
    theme
  } = useTheme();
  const {
    isMobile
  } = useIsMobile();
  return <header className="my-0 mx-[21px]">
      <div className="flex items-center justify-between mx-[9px]">
        <div className="flex items-center gap-2">
          {backTo && <Link to={backTo} className="mr-2 text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>}
          {icon && <div className="flex items-center justify-center">{icon}</div>}
          <h1 className={cn(isMobile ? "text-[20px] font-bold" : "text-2xl font-bold sm:text-3xl",
        // 20px for mobile headings
        theme === 'light' ? "text-foreground" : "text-white")}>
            {title}
          </h1>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {subtitle && <p className={cn("text-muted-foreground", isMobile ? "text-[14px]" : "text-sm sm:text-base" // 14px for mobile body text
    )}>
          {subtitle}
        </p>}
    </header>;
};
export default AppHeader;