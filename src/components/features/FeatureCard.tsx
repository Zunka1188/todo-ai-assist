
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

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
  return (
    <Link
      to={to}
      className={cn(
        "metallic-card p-6 rounded-xl transition-all duration-300",
        "hover:shadow-xl hover:-translate-y-1",
        className
      )}
    >
      <div className="flex items-start space-x-4">
        <div className="bg-todo-purple bg-opacity-10 dark:bg-opacity-20 p-3 rounded-lg">
          <Icon className="text-todo-purple dark:text-todo-purple-light" size={24} />
        </div>
        <div className="space-y-1">
          <h3 className="font-medium dark:text-white">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default FeatureCard;
