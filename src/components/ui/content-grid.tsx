
import React from 'react';
import { cn } from '@/lib/utils';
import { Upload } from 'lucide-react';
import EmptyState from './empty-state';

interface ContentGridProps {
  children: React.ReactNode;
  itemCount: number;
  columns?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  gap?: 'none' | 'sm' | 'md' | 'lg';
  emptyState?: {
    icon?: React.ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
  };
  className?: string;
}

const ContentGrid: React.FC<ContentGridProps> = ({
  children,
  itemCount,
  columns = {
    default: 1,
    sm: 2,
    md: 3,
    lg: 4
  },
  gap = 'md',
  emptyState = {
    icon: <Upload />,
    title: "No items found",
    description: "Add your first item to get started."
  },
  className
}) => {
  const getColumnClasses = () => {
    return [
      `grid-cols-${columns.default}`,
      columns.sm && `sm:grid-cols-${columns.sm}`,
      columns.md && `md:grid-cols-${columns.md}`,
      columns.lg && `lg:grid-cols-${columns.lg}`
    ].filter(Boolean).join(' ');
  };
  
  const getGapClass = () => {
    switch (gap) {
      case 'sm': return 'gap-2';
      case 'md': return 'gap-4';
      case 'lg': return 'gap-6';
      default: return '';
    }
  };
  
  if (itemCount === 0) {
    return (
      <EmptyState
        icon={emptyState.icon || <Upload />}
        title={emptyState.title}
        description={emptyState.description}
        actionLabel={emptyState.actionLabel}
        onAction={emptyState.onAction}
        className={className}
      />
    );
  }
  
  return (
    <div className={cn(
      'grid',
      getColumnClasses(),
      getGapClass(),
      className
    )}>
      {children}
    </div>
  );
};

export default ContentGrid;
