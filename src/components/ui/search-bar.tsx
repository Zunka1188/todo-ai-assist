
import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';

// Omit the 'size' property from InputHTMLAttributes to avoid the conflict
interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  className?: string;
  placeholder?: string;
  showIcon?: boolean;
  showClearButton?: boolean;
  variant?: 'default' | 'minimal';
  size?: 'sm' | 'md' | 'lg'; // Now this won't conflict with the InputHTMLAttributes size
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChange, 
  onClear,
  className,
  placeholder = 'Search...',
  showIcon = true,
  showClearButton = true,
  variant = 'default',
  size = 'md',
  ...props
}) => {
  const { isMobile } = useIsMobile();
  
  const handleClear = () => {
    if (onClear) {
      onClear();
    }
  };
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return isMobile ? 'h-8 text-sm' : 'h-9 text-sm';
      case 'lg': return isMobile ? 'h-10' : 'h-12';
      default: return isMobile ? 'h-9' : 'h-10';
    }
  };
  
  const getIconSize = () => {
    switch (size) {
      case 'sm': return isMobile ? 14 : 16;
      case 'lg': return isMobile ? 18 : 20;
      default: return isMobile ? 16 : 18;
    }
  };
  
  return (
    <div className={cn(
      "relative w-full",
      className
    )}>
      {showIcon && (
        <Search 
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
            variant === 'minimal' ? 'text-sm' : ''
          )}
          size={getIconSize()}
        />
      )}
      <Input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          getSizeClasses(),
          "bg-background w-full",
          showIcon ? "pl-9" : "pl-3",
          showClearButton && value ? "pr-9" : "pr-3",
          variant === 'minimal' ? 'border-0 shadow-none focus-visible:ring-0' : ''
        )}
        {...props}
      />
      {showClearButton && value && (
        <button 
          type="button"
          onClick={handleClear}
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground",
            "hover:text-foreground focus:outline-none"
          )}
          aria-label="Clear search"
        >
          <X size={getIconSize()} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
