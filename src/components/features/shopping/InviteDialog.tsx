
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, CheckCircle, Link } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InviteDialog: React.FC<InviteDialogProps> = ({ 
  open,
  onOpenChange
}) => {
  const [copied, setCopied] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const { toast } = useToast();
  const { isMobile } = useIsMobile();

  // Generate a unique invitation link
  const generateInviteLink = () => {
    setGeneratingLink(true);
    
    // Simulate API call to generate a link
    setTimeout(() => {
      // In a real implementation, this would be a secure token from your backend
      const uniqueId = `shop_${Math.random().toString(36).substring(2, 15)}`;
      const baseUrl = window.location.origin;
      const newLink = `${baseUrl}/shopping?invite=${uniqueId}`;
      
      setInviteLink(newLink);
      setGeneratingLink(false);
    }, 800); // Simulate a delay for link generation
  };

  // Handle copying the link to clipboard
  const handleCopyLink = async () => {
    if (!inviteLink) return;
    
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast({
        title: "Link copied",
        description: "Invitation link copied to clipboard"
      });
      
      // Reset copied status after 3 seconds
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try copying the link manually",
        variant: "destructive"
      });
    }
  };

  // Generate link on dialog open if not already available
  React.useEffect(() => {
    if (open && !inviteLink && !generatingLink) {
      generateInviteLink();
    }
  }, [open, inviteLink, generatingLink]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center sm:text-left">Invite to Shopping List</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            Share this link to invite others to collaborate on your shopping list. 
            Anyone with this link can view and edit your list.
          </p>
          
          {generatingLink ? (
            <div className="flex items-center justify-center p-4">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-sm">Generating secure link...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Link className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  value={inviteLink}
                  readOnly 
                  className="pr-10 pl-8"
                />
              </div>
              <Button 
                type="button"
                size={isMobile ? "sm" : "default"}
                className={copied ? "bg-green-600" : ""}
                onClick={handleCopyLink}
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
        
        <DialogFooter className="sm:justify-start">
          <div className="w-full flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => onOpenChange(false)}
              size={isMobile ? "sm" : "default"}
            >
              Close
            </Button>
            <Button 
              type="button" 
              onClick={generateInviteLink}
              disabled={generatingLink}
              size={isMobile ? "sm" : "default"}
            >
              Generate New Link
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteDialog;
