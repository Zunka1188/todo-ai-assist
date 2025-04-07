
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CopyIcon, Share2, UserPlus, Link2Icon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useShareableLinks } from '@/hooks/useShareableLinks';
import { Event } from '../types/event';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface InviteDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  event?: Event;
  onInviteUsers?: (emails: string[]) => void;
  onShareLink?: (link: string) => void;
}

const InviteDialog: React.FC<InviteDialogProps> = ({
  isOpen,
  setIsOpen,
  event,
  onInviteUsers,
  onShareLink
}) => {
  const [tab, setTab] = useState<'users' | 'link'>('link');
  const [userInput, setUserInput] = useState('');
  const [users, setUsers] = useState<string[]>([]);
  const [shareableLink, setShareableLink] = useState<string | null>(null);
  const { toast } = useToast();
  const { createShareableLink } = useShareableLinks();

  // Generate a shareable link for this calendar or event
  const generateShareableLink = () => {
    try {
      const itemId = event ? event.id : 'calendar';
      const itemType = 'calendar';
      const link = createShareableLink(itemId, itemType, 7); // 7 days expiry
      
      setShareableLink(link);
      if (onShareLink) onShareLink(link);
    } catch (error) {
      console.error('Error generating link:', error);
      toast({
        title: "Error",
        description: "Failed to generate shareable link"
      });
    }
  };

  // Handle adding a user to the invite list
  const handleAddUser = () => {
    if (userInput.trim()) {
      setUsers([...users, userInput.trim()]);
      setUserInput('');
    }
  };

  // Handle removing a user from the invite list
  const handleRemoveUser = (indexToRemove: number) => {
    setUsers(users.filter((_, index) => index !== indexToRemove));
  };

  // Handle sending invites to users
  const handleInviteUsers = () => {
    if (users.length > 0 && onInviteUsers) {
      onInviteUsers(users);
      toast({
        title: "Invitations Sent",
        description: `Invited ${users.length} user${users.length > 1 ? 's' : ''}`
      });
      setUsers([]);
      setIsOpen(false);
    } else {
      toast({
        title: "No Users Selected",
        description: "Please add users to invite"
      });
    }
  };

  // Handle copying link to clipboard
  const handleCopyLink = () => {
    if (shareableLink) {
      navigator.clipboard.writeText(shareableLink);
      toast({
        title: "Link Copied",
        description: "Shareable link copied to clipboard"
      });
    }
  };

  // Handle native sharing if available
  const handleNativeShare = () => {
    if (shareableLink && navigator.share) {
      navigator.share({
        title: event ? `Invitation to: ${event.title}` : "Calendar Invitation",
        text: event 
          ? `Join me for ${event.title} on ${event.startDate.toLocaleDateString()}` 
          : "I'd like to share my calendar with you",
        url: shareableLink
      }).catch(err => {
        console.error('Share failed:', err);
      });
    } else if (shareableLink) {
      handleCopyLink();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {event ? `Share "${event.title}"` : "Share Calendar"}
          </DialogTitle>
          <DialogDescription>
            {event 
              ? "Invite others to this event" 
              : "Share your calendar with others"}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" value={tab} onValueChange={(value) => setTab(value as 'users' | 'link')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">Share Link</TabsTrigger>
            <TabsTrigger value="users">Invite Users</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4 py-4">
            {shareableLink ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input 
                    value={shareableLink} 
                    readOnly 
                    className="flex-1"
                  />
                  <Button size="icon" variant="outline" onClick={handleCopyLink}>
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleNativeShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="default" onClick={() => setShareableLink(null)}>
                    <Link2Icon className="mr-2 h-4 w-4" />
                    Generate New Link
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-4">
                <Link2Icon className="h-16 w-16 text-muted-foreground" />
                <p className="text-center text-sm text-muted-foreground">
                  Generate a link to share your {event ? "event" : "calendar"}
                </p>
                <Button onClick={generateShareableLink}>
                  Generate Shareable Link
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input 
                  placeholder="Email or username" 
                  value={userInput} 
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
                />
                <Button size="icon" variant="outline" onClick={handleAddUser}>
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
              
              {users.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Users to invite:</p>
                  <ul className="space-y-1">
                    {users.map((user, index) => (
                      <li key={index} className="flex items-center justify-between rounded-md bg-muted p-2 text-sm">
                        <span>{user}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveUser(index)}
                          className="h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <Button 
                className="w-full" 
                disabled={users.length === 0}
                onClick={handleInviteUsers}
              >
                Send Invitations
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default InviteDialog;
