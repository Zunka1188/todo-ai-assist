import React, { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Share2, Copy, Instagram, MessageSquare, Link as LinkIcon } from 'lucide-react';
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
  
  const shareUrl = url || window.location.href;
  
  const isToDoAppInstalled = window.navigator.userAgent.includes('ToDoApp');

  const handleNativeShare = async () => {
    try {
      const shareData: ShareData = {
        title,
        text: text || title,
      };

      if (shareUrl) {
        shareData.url = shareUrl;
      }

      if (file) {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            ...shareData,
          });
        } else {
          await navigator.share(shareData);
        }
      } else if (fileUrl) {
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
            await navigator.share(shareData);
          }
        } catch (error) {
          console.error('Error fetching file to share:', error);
          await navigator.share(shareData);
        }
      } else {
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
        navigator.clipboard.writeText(`${title} ${shareUrl}`);
        toast.success('Content copied! Now you can paste it in Instagram');
        setIsOpen(false);
        return;
      case 'messenger':
        if (isMobile) {
          shareAppUrl = `fb-messenger://share/?link=${encodedUrl}`;
        } else {
          shareAppUrl = `https://www.messenger.com/new`;
          navigator.clipboard.writeText(`${title} ${shareUrl}`);
          toast.success('Opening Messenger. Content copied to clipboard for sharing!');
        }
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
      handleNativeShare();
    } else if (isToDoAppInstalled) {
      handleToDoAppShare();
    } else if (showOptions) {
      setIsOpen(true);
    } else {
      if (!isMobile) {
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard');
      } else {
        toast.error('Sharing not supported on this device');
      }
    }
  };

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
          <MessageSquare className="h-4 w-4 mr-2" />
          Share to WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAppShare('instagram')}>
          <Instagram className="h-4 w-4 mr-2" />
          Share to Instagram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAppShare('messenger')}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Share to Messenger App
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
