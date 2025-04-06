
import React, { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Share2, Copy, Instagram, MessageSquare, Whatsapp, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShareButtonProps extends Omit<ButtonProps, 'onError'> {
  title?: string;
  text?: string;
  url?: string;
  file?: File | null;
  fileUrl?: string;
  children?: React.ReactNode;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  showOptions?: boolean;
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
  showOptions = false,
  ...buttonProps
}) => {
  const { isMobile } = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  
  // Determine which URL to share (passed URL or current page)
  const shareUrl = url || window.location.href;
  
  // Try to detect if the ToDo app is installed
  const isToDoAppInstalled = window.navigator.userAgent.includes('ToDoApp');

  const handleNativeShare = async () => {
    try {
      // Web Share API is supported
      const shareData: ShareData = {
        title,
        text: text || title,
      };

      if (shareUrl) {
        shareData.url = shareUrl;
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
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share');
      onError?.(error as Error);
    }
  };

  const handleToDoAppShare = () => {
    window.postMessage({ 
      type: 'TODO_APP_SHARE', 
      payload: { title, text, url: shareUrl, fileUrl } 
    }, '*');
    toast.success('Shared to ToDo App');
    onSuccess?.();
    setIsOpen(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard');
    setIsOpen(false);
  };

  const handleAppShare = (app: string) => {
    let shareAppUrl = '';
    const encodedTitle = encodeURIComponent(title);
    const encodedText = encodeURIComponent(text || title);
    const encodedUrl = encodeURIComponent(shareUrl);

    switch (app) {
      case 'whatsapp':
        shareAppUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case 'instagram':
        // Instagram doesn't have a direct share URL, but we can copy to clipboard
        // and prompt the user to share via Instagram
        navigator.clipboard.writeText(`${title} ${shareUrl}`);
        toast.success('Content copied! Now you can paste it in Instagram');
        setIsOpen(false);
        return;
      case 'messenger':
        shareAppUrl = `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=184683071273&redirect_uri=${encodedUrl}`;
        break;
      default:
        return;
    }

    window.open(shareAppUrl, '_blank');
    setIsOpen(false);
  };
  
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (navigator.share && isMobile) {
      // Use native share on mobile
      handleNativeShare();
    } else if (isToDoAppInstalled) {
      // Custom handling for ToDo app
      handleToDoAppShare();
    } else if (showOptions) {
      // Show dropdown if options are enabled
      setIsOpen(true);
    } else {
      // Fallback for browsers without Web Share API
      if (!isMobile) {
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard');
      } else {
        toast.error('Sharing not supported on this device');
      }
    }
  };

  // Simple share button without dropdown
  if (!showOptions) {
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
  }

  // Enhanced share button with dropdown options
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          size="icon" 
          variant="outline"
          className={className}
          {...buttonProps}
        >
          {children || <Share2 className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopyLink}>
          <Copy className="h-4 w-4 mr-2" />
          Copy link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAppShare('whatsapp')}>
          <Whatsapp className="h-4 w-4 mr-2" />
          Share to WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAppShare('instagram')}>
          <Instagram className="h-4 w-4 mr-2" />
          Share to Instagram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAppShare('messenger')}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Share to Messenger
        </DropdownMenuItem>
        {isToDoAppInstalled && (
          <DropdownMenuItem onClick={handleToDoAppShare}>
            <LinkIcon className="h-4 w-4 mr-2" />
            Share to ToDo App
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButton;
