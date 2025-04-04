
import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';

interface ShoppingItemImageProps {
  imageUrl: string | null | undefined;
  name?: string;
  onClick?: () => void;
  isMobile?: boolean;
  className?: string;
}

const ShoppingItemImage: React.FC<ShoppingItemImageProps> = ({
  imageUrl,
  name,
  onClick,
  isMobile = false,
  className
}) => {
  const { theme } = useTheme();
  
  const handleClick = (e: React.MouseEvent) => {
    if (imageUrl && onClick) {
      e.stopPropagation();
      onClick();
    }
  };
  
  return (
    <div 
      className={cn(
        "flex-shrink-0",
        isMobile ? "w-[45px] h-[45px]" : "w-[80px] h-[80px]",
        imageUrl ? "cursor-pointer" : "cursor-default",
        className
      )}
      onClick={handleClick}
      role={imageUrl ? "button" : undefined}
      aria-label={imageUrl ? `View ${name || 'item'} image` : "No image available"}
    >
      {imageUrl ? (
        <div 
          className={cn(
            "w-full h-full bg-cover bg-center",
            theme === 'dark' ? "border-zinc-700" : "border-gray-200"
          )}
          style={{ backgroundImage: `url(${imageUrl})` }}
          aria-hidden="true"
        />
      ) : (
        <div className={cn(
          "w-full h-full flex items-center justify-center",
          theme === 'dark' ? "bg-zinc-800" : "bg-gray-200"
        )} aria-hidden="true">
          <span className={cn(
            isMobile ? "text-xs" : "text-sm",
            theme === 'dark' ? "text-zinc-500" : "text-gray-500"
          )}>No image</span>
        </div>
      )}
    </div>
  );
};

export default ShoppingItemImage;
