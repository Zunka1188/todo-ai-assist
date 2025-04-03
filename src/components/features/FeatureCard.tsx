
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  to,
  className,
}) => {
  const isMobile = useIsMobile();
  
  return (
    <Link
      to={to}
      className={cn(
        "metallic-card p-4 sm:p-6 rounded-xl transition-all duration-300",
        "hover:shadow-xl hover:-translate-y-1",
        className
      )}
    >
      <div className="flex items-start space-x-3 sm:space-x-4">
        <div className="bg-todo-purple bg-opacity-10 dark:bg-opacity-20 p-2 sm:p-3 rounded-lg flex-shrink-0">
          <Icon className="text-todo-purple dark:text-todo-purple-light" size={isMobile ? 20 : 24} />
        </div>
        <div className="space-y-1 min-w-0">
          <h3 className="font-medium dark:text-white text-sm sm:text-base truncate">{title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default FeatureCard;
