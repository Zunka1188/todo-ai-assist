
import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';
import { ImageIcon } from 'lucide-react';

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
  const [isLoading, setIsLoading] = React.useState(!!imageUrl);
  const [hasError, setHasError] = React.useState(false);
  
  const handleClick = (e: React.MouseEvent) => {
    if (imageUrl && onClick && !hasError) {
      e.stopPropagation();
      onClick();
    }
  };
  
  const handleImageLoad = () => {
    setIsLoading(false);
  };
  
  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };
  
  return (
    <div 
      className={cn(
        "flex-shrink-0 rounded overflow-hidden",
        isMobile ? "w-[45px] h-[45px]" : "w-[80px] h-[80px]",
        imageUrl && !hasError ? "cursor-pointer" : "cursor-default",
        className
      )}
      onClick={handleClick}
      role={imageUrl && !hasError ? "button" : undefined}
      aria-label={imageUrl && !hasError ? `View ${name || 'item'} image` : "No image available"}
    >
      {imageUrl && !hasError ? (
        <div className="w-full h-full relative">
          {isLoading && (
            <div className={cn(
              "absolute inset-0 flex items-center justify-center",
              theme === 'dark' ? "bg-zinc-800" : "bg-gray-200"
            )}>
              <span className={cn(
                "animate-pulse",
                theme === 'dark' ? "text-zinc-500" : "text-gray-500"
              )}>Loading...</span>
            </div>
          )}
          <img 
            src={imageUrl} 
            alt={name || "Product image"} 
            className="w-full h-full object-cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ opacity: isLoading ? 0 : 1 }}
          />
        </div>
      ) : (
        <div className={cn(
          "w-full h-full flex items-center justify-center",
          theme === 'dark' ? "bg-zinc-800" : "bg-gray-200"
        )} aria-hidden="true">
          <ImageIcon className={cn(
            "h-5 w-5",
            theme === 'dark' ? "text-zinc-500" : "text-gray-500"
          )} />
        </div>
      )}
    </div>
  );
};

export default ShoppingItemImage;
