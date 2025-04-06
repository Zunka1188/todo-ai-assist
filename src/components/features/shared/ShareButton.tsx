
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface ShareButtonProps extends ButtonProps {
  title?: string;
  text?: string;
  url?: string;
  file?: File | null;
  fileUrl?: string;
  children?: React.ReactNode;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  title = 'Check this out!',
  text,
  url,
  file,
  fileUrl,
  children,
  onSuccess,
  onError,
  className,
  ...buttonProps
}) => {
  const { isMobile } = useIsMobile();
  
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Try to detect if the ToDo app is installed
    const isToDoAppInstalled = window.navigator.userAgent.includes('ToDoApp');

    try {
      if (navigator.share) {
        // Web Share API is supported
        const shareData: ShareData = {
          title,
          text: text || title,
        };

        if (url) {
          shareData.url = url;
        }

        // If there's a file to share
        if (file) {
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              ...shareData,
            });
          } else {
            // Fallback to sharing without file
            await navigator.share(shareData);
          }
        } else if (fileUrl) {
          // Try to fetch and share the file from URL
          try {
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const fileName = fileUrl.split('/').pop() || 'shared-file';
            const fileToShare = new File([blob], fileName, { type: blob.type });
            
            if (navigator.canShare && navigator.canShare({ files: [fileToShare] })) {
              await navigator.share({
                files: [fileToShare],
                ...shareData,
              });
            } else {
              // Fallback to sharing without file
              await navigator.share(shareData);
            }
          } catch (error) {
            console.error('Error fetching file to share:', error);
            await navigator.share(shareData);
          }
        } else {
          // Regular share without files
          await navigator.share(shareData);
        }
        
        toast.success('Shared successfully');
        onSuccess?.();
      } else if (isToDoAppInstalled) {
        // Custom handling for ToDo app
        window.postMessage({ 
          type: 'TODO_APP_SHARE', 
          payload: { title, text, url, fileUrl } 
        }, '*');
        toast.success('Shared to ToDo App');
        onSuccess?.();
      } else {
        // Fallback for browsers without Web Share API
        if (!isMobile) {
          navigator.clipboard.writeText(url || window.location.href);
          toast.success('Link copied to clipboard');
        } else {
          throw new Error('Sharing not supported on this device');
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share');
      onError?.(error as Error);
    }
  };

  return (
    <Button 
      onClick={handleShare} 
      size="icon" 
      variant="outline"
      className={className}
      {...buttonProps}
    >
      {children || <Share2 className="h-4 w-4" />}
    </Button>
  );
};

export default ShareButton;
