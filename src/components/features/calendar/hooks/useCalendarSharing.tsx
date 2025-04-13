
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useShareableLinks } from '@/hooks/useShareableLinks';
import { Event } from '../types/event';
import { validateWithSchema } from '@/utils/input-validation';
import { z } from 'zod';

type RSVPStatus = 'yes' | 'no' | 'maybe' | 'pending';

interface RSVPResponse {
  userId?: string;
  name: string;
  status: RSVPStatus;
  timestamp: string;
}

export interface EventInvite {
  eventId: string;
  invitedBy: string;
  inviteLink: string;
  responses: RSVPResponse[];
  expiresAt: string;
}

// Schema for RSVP response
const RSVPResponseSchema = z.object({
  userId: z.string().optional(),
  name: z.string().min(1, "Name is required").max(100),
  status: z.enum(["yes", "no", "maybe", "pending"]),
  timestamp: z.string().datetime()
});

// Schema for event invite
const EventInviteSchema = z.object({
  eventId: z.string().min(1),
  invitedBy: z.string(),
  inviteLink: z.string().url("Invalid URL format"),
  responses: z.array(RSVPResponseSchema),
  expiresAt: z.string().datetime()
});

export const useCalendarSharing = () => {
  const [invites, setInvites] = useState<EventInvite[]>([]);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { toast } = useToast();
  const { 
    createShareableLink,
    validateLink,
    revokeLink,
    getLinksForItem,
    getAllLinksForItem,
    extendLinkExpiration
  } = useShareableLinks();

  // Create a shareable link for an entire calendar
  const shareCalendar = (userId: string, expiresInDays: number = 7) => {
    try {
      const linkUrl = createShareableLink(userId, 'calendar', expiresInDays);
      return linkUrl;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create calendar share link"
      });
      return null;
    }
  };

  // Create a shareable link for a specific event
  const shareEvent = (event: Event, expiresInDays: number = 7) => {
    try {
      // Validate the event
      if (!event.id) {
        throw new Error("Event must have an ID");
      }
      
      const linkUrl = createShareableLink(event.id, 'calendar', expiresInDays);
      
      // Store the event invite information locally
      const newInvite: EventInvite = {
        eventId: event.id,
        invitedBy: 'current-user', // In a real app, this would be the current user's ID
        inviteLink: linkUrl,
        responses: [],
        expiresAt: new Date(Date.now() + (expiresInDays * 24 * 60 * 60 * 1000)).toISOString()
      };
      
      // Validate invite structure before storing
      const validation = validateWithSchema(EventInviteSchema, newInvite);
      if (!validation.success) {
        throw new Error("Invalid event invite structure");
      }
      
      setInvites(prev => [...prev, newInvite]);
      
      return linkUrl;
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to create event share link"
      });
      return null;
    }
  };

  // Get all responses for a specific event
  const getEventResponses = (eventId: string): RSVPResponse[] => {
    const eventInvite = invites.find(invite => invite.eventId === eventId);
    return eventInvite?.responses || [];
  };

  // Record an RSVP response for an event
  const recordRSVP = (eventId: string, name: string, status: RSVPStatus, userId?: string): boolean => {
    try {
      const response: RSVPResponse = {
        userId,
        name,
        status,
        timestamp: new Date().toISOString()
      };

      // Validate RSVP response
      const validation = validateWithSchema(RSVPResponseSchema, response);
      if (!validation.success) {
        throw new Error(validation.errors?.[0]?.message || "Invalid RSVP response");
      }

      setInvites(prev => prev.map(invite => {
        if (invite.eventId === eventId) {
          // If user already responded, update their response
          const existingIndex = invite.responses.findIndex(r => 
            (userId && r.userId === userId) || (!userId && r.name === name)
          );

          if (existingIndex >= 0) {
            const updatedResponses = [...invite.responses];
            updatedResponses[existingIndex] = response;
            return { ...invite, responses: updatedResponses };
          } else {
            // Add new response
            return {
              ...invite,
              responses: [...invite.responses, response]
            };
          }
        }
        return invite;
      }));

      toast({
        title: "RSVP Recorded",
        description: `Response: ${status.toUpperCase()}`
      });

      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record RSVP"
      });
      return false;
    }
  };

  // Revoke a calendar or event share link
  const revokeShareLink = (linkId: string): boolean => {
    const result = revokeLink(linkId);
    
    if (result) {
      toast({
        title: "Link Revoked",
        description: "The share link has been revoked"
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to revoke link"
      });
    }
    
    return result;
  };

  // Extend the expiration date of a link
  const extendLink = (linkId: string, additionalDays: number = 7): boolean => {
    const result = extendLinkExpiration(linkId, additionalDays);
    
    if (result) {
      toast({
        title: "Link Extended",
        description: `The link has been extended by ${additionalDays} days`
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to extend link"
      });
    }
    
    return result;
  };

  // Get all active shares for an event
  const getEventShares = (eventId: string) => {
    return getLinksForItem(eventId);
  };

  // Get all shares (including expired/revoked) for an event
  const getAllEventShares = (eventId: string) => {
    return getAllLinksForItem(eventId);
  };

  return {
    shareCalendar,
    shareEvent,
    getEventResponses,
    recordRSVP,
    revokeShareLink,
    extendLink,
    getEventShares,
    getAllEventShares,
    isInviteDialogOpen,
    setIsInviteDialogOpen,
    selectedEvent,
    setSelectedEvent
  };
};
