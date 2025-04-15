
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareShoppingListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listName?: string;
}

const ShareShoppingListDialog = ({ open, onOpenChange, listName = "Shopping List" }: ShareShoppingListDialogProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  // Generate a share URL with list ID
  const shareUrl = `${window.location.origin}/shopping?share=${Date.now()}`;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard"
      });
    });
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Shared ${listName}`,
        text: `Check out my shopping list!`,
        url: shareUrl,
      }).catch(err => console.log('Error sharing', err));
    } else {
      handleCopy();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Shopping List</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="shareLink">Share Link</Label>
            <div className="flex items-center gap-2">
              <Input
                id="shareLink"
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button 
                type="button" 
                size="icon" 
                onClick={handleCopy}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Label>Share Options</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareShoppingListDialog;
