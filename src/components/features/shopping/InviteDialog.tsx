
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, CheckCircle, Link, Clock, Trash } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface InviteLinkData {
  id: string;
  link: string;
  expiresAt?: Date;
  createDate: Date;
  isActive: boolean;
}

const InviteDialog: React.FC<InviteDialogProps> = ({ 
  open,
  onOpenChange
}) => {
  const [copied, setCopied] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [inviteLinks, setInviteLinks] = useState<InviteLinkData[]>([]);
  const [expiration, setExpiration] = useState<string>('never');
  const [enableReadOnly, setEnableReadOnly] = useState(false);
  const { toast } = useToast();
  const { isMobile } = useIsMobile();

  // Load existing invite links from local storage
  useEffect(() => {
    try {
      const storedLinks = localStorage.getItem('shoppingInviteLinks');
      if (storedLinks) {
        const parsedLinks = JSON.parse(storedLinks);
        
        // Filter out expired links
        const now = new Date();
        const activeLinks = parsedLinks.filter((link: InviteLinkData) => {
          if (!link.isActive) return false;
          if (!link.expiresAt) return true;
          return new Date(link.expiresAt) > now;
        });
        
        setInviteLinks(activeLinks);
        
        // Set current invite link if available
        if (activeLinks.length > 0) {
          setInviteLink(activeLinks[0].link);
        }
      }
    } catch (error) {
      console.error("Error loading invite links:", error);
    }
  }, [open]);

  // Generate a unique invitation link
  const generateInviteLink = () => {
    setGeneratingLink(true);
    
    // Simulate API call to generate a link
    setTimeout(() => {
      // In a real implementation, this would be a secure token from your backend
      const uniqueId = `shop_${Math.random().toString(36).substring(2, 15)}`;
      const baseUrl = window.location.origin;
      const newLink = `${baseUrl}/shopping?invite=${uniqueId}${enableReadOnly ? '&mode=readonly' : ''}`;
      
      // Calculate expiration date if applicable
      let expiresAt: Date | undefined;
      if (expiration !== 'never') {
        expiresAt = new Date();
        if (expiration === '1day') {
          expiresAt.setDate(expiresAt.getDate() + 1);
        } else if (expiration === '7days') {
          expiresAt.setDate(expiresAt.getDate() + 7);
        } else if (expiration === '30days') {
          expiresAt.setDate(expiresAt.getDate() + 30);
        }
      }
      
      const newLinkData: InviteLinkData = {
        id: uniqueId,
        link: newLink,
        expiresAt,
        createDate: new Date(),
        isActive: true
      };
      
      // Add new link to the list
      const updatedLinks = [newLinkData, ...inviteLinks];
      setInviteLinks(updatedLinks);
      setInviteLink(newLink);
      
      // Save to localStorage
      localStorage.setItem('shoppingInviteLinks', JSON.stringify(updatedLinks));
      
      setGeneratingLink(false);
      
      toast({
        title: "New invite link created",
        description: expiresAt 
          ? `This link will expire on ${expiresAt.toLocaleDateString()}` 
          : "This link has no expiration date"
      });
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

  // Revoke a specific invite link
  const revokeLink = (linkId: string) => {
    const updatedLinks = inviteLinks.map(link => 
      link.id === linkId ? { ...link, isActive: false } : link
    );
    
    setInviteLinks(updatedLinks.filter(link => link.isActive));
    localStorage.setItem('shoppingInviteLinks', JSON.stringify(updatedLinks));
    
    // If the current link was revoked, update the display
    if (inviteLink.includes(linkId)) {
      const activeLinks = updatedLinks.filter(link => link.isActive);
      setInviteLink(activeLinks.length > 0 ? activeLinks[0].link : '');
    }
    
    toast({
      title: "Link revoked",
      description: "This invitation link has been deactivated"
    });
  };

  // Helper function to format expiration date
  const formatExpiration = (link: InviteLinkData) => {
    if (!link.expiresAt) return "No expiration";
    
    const expiryDate = new Date(link.expiresAt);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return "Expired";
    if (diffDays === 1) return "Expires in 1 day";
    return `Expires in ${diffDays} days`;
  };

  // Generate link on dialog open if not already available
  useEffect(() => {
    if (open && !inviteLink && !generatingLink && inviteLinks.length === 0) {
      generateInviteLink();
    }
  }, [open, inviteLink, generatingLink, inviteLinks]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center sm:text-left">Invite to Shopping List</DialogTitle>
          <DialogDescription>
            Share this link to invite others to collaborate on your shopping list.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-2">
          {generatingLink ? (
            <div className="flex items-center justify-center p-4">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-sm">Generating secure link...</span>
            </div>
          ) : (
            <>
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
              
              <div className="space-y-3 border-t pt-3">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="expiration">Link Expiration</Label>
                  <Select
                    value={expiration}
                    onValueChange={setExpiration}
                  >
                    <SelectTrigger id="expiration">
                      <SelectValue placeholder="Select expiration time" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="never">Never expires</SelectItem>
                      <SelectItem value="1day">1 day</SelectItem>
                      <SelectItem value="7days">7 days</SelectItem>
                      <SelectItem value="30days">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="read-only"
                    checked={enableReadOnly}
                    onCheckedChange={setEnableReadOnly}
                  />
                  <Label htmlFor="read-only">Read-only access</Label>
                </div>
              </div>
              
              {inviteLinks.length > 0 && (
                <div className="border-t pt-3">
                  <h3 className="text-sm font-medium mb-2">Active Invite Links</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {inviteLinks.map(link => (
                      <div key={link.id} className="flex items-center justify-between p-2 bg-muted rounded-md text-xs">
                        <div className="flex flex-col">
                          <span className="font-medium truncate max-w-[150px]">{link.id}</span>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatExpiration(link)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => revokeLink(link.id)}
                          className="h-7 w-7 p-0"
                        >
                          <Trash className="h-3.5 w-3.5 text-red-500" />
                          <span className="sr-only">Revoke link</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
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
