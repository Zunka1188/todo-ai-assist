
import { useState, useEffect } from 'react';

interface ShareableLink {
  id: string;
  itemId: string;
  itemType: 'document' | 'shopping' | 'todo' | 'note' | 'calendar';
  created: string;
  expires: string;
  accessCount: number;
  revoked: boolean;
}

export const useShareableLinks = () => {
  const [links, setLinks] = useState<ShareableLink[]>([]);
  
  // Load links from localStorage on initial load
  useEffect(() => {
    const storedLinks = localStorage.getItem('shareable-links');
    if (storedLinks) {
      try {
        const parsedLinks = JSON.parse(storedLinks);
        setLinks(parsedLinks);
      } catch (e) {
        console.error('Error loading shareable links:', e);
      }
    }
  }, []);
  
  // Save links to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('shareable-links', JSON.stringify(links));
  }, [links]);

  // Clean up expired links on component mount
  useEffect(() => {
    cleanupExpiredLinks();
    
    // Set up a daily cleanup interval
    const cleanupInterval = setInterval(() => {
      cleanupExpiredLinks();
    }, 24 * 60 * 60 * 1000); // Once per day
    
    return () => clearInterval(cleanupInterval);
  }, []);
  
  /**
   * Generate a new shareable link
   */
  const createShareableLink = (
    itemId: string, 
    itemType: 'document' | 'shopping' | 'todo' | 'note' | 'calendar',
    expiresInDays: number = 7
  ): string => {
    const id = generateLinkId();
    const now = new Date();
    const expires = new Date(now);
    expires.setDate(expires.getDate() + expiresInDays);
    
    const newLink: ShareableLink = {
      id,
      itemId,
      itemType,
      created: now.toISOString(),
      expires: expires.toISOString(),
      accessCount: 0,
      revoked: false
    };
    
    setLinks(prevLinks => [...prevLinks, newLink]);
    return generateShareableUrl(id);
  };
  
  /**
   * Revoke a specific link
   */
  const revokeLink = (linkId: string): boolean => {
    let found = false;
    
    setLinks(prevLinks => 
      prevLinks.map(link => {
        if (link.id === linkId) {
          found = true;
          return { ...link, revoked: true };
        }
        return link;
      })
    );
    
    return found;
  };
  
  /**
   * Revoke all links for a specific item
   */
  const revokeAllLinksForItem = (itemId: string): number => {
    let count = 0;
    
    setLinks(prevLinks => 
      prevLinks.map(link => {
        if (link.itemId === itemId && !link.revoked) {
          count++;
          return { ...link, revoked: true };
        }
        return link;
      })
    );
    
    return count;
  };
  
  /**
   * Check if a link is valid
   */
  const validateLink = (linkId: string): boolean => {
    const link = links.find(l => l.id === linkId);
    if (!link) return false;
    
    // Check if link is revoked
    if (link.revoked) return false;
    
    // Check if link is expired
    const now = new Date();
    const expires = new Date(link.expires);
    if (now > expires) return false;
    
    // Link is valid, increment access count
    setLinks(prevLinks => 
      prevLinks.map(l => {
        if (l.id === linkId) {
          return { ...l, accessCount: l.accessCount + 1 };
        }
        return l;
      })
    );
    
    return true;
  };
  
  /**
   * Get links for a specific item
   */
  const getLinksForItem = (itemId: string): ShareableLink[] => {
    return links.filter(link => 
      link.itemId === itemId && !link.revoked && new Date() < new Date(link.expires)
    );
  };

  /**
   * Get all links for a specific item, including revoked and expired ones
   */
  const getAllLinksForItem = (itemId: string): ShareableLink[] => {
    return links.filter(link => link.itemId === itemId);
  };

  /**
   * Get link details from a link ID
   */
  const getLinkDetails = (linkId: string): ShareableLink | null => {
    return links.find(link => link.id === linkId) || null;
  };
  
  /**
   * Clean up expired links
   */
  const cleanupExpiredLinks = (): number => {
    const now = new Date();
    let count = 0;
    
    setLinks(prevLinks => 
      prevLinks.filter(link => {
        const expires = new Date(link.expires);
        if (now > expires) {
          count++;
          return false;
        }
        return true;
      })
    );
    
    return count;
  };
  
  /**
   * Generate a random link ID
   */
  const generateLinkId = (): string => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };
  
  /**
   * Generate a shareable URL from a link ID
   */
  const generateShareableUrl = (linkId: string): string => {
    // In a real app, this would be a proper domain with possible route params
    return `${window.location.origin}/share/${linkId}`;
  };

  /**
   * Extend an existing link's expiration date
   */
  const extendLinkExpiration = (linkId: string, additionalDays: number = 7): boolean => {
    let found = false;
    
    setLinks(prevLinks => 
      prevLinks.map(link => {
        if (link.id === linkId && !link.revoked) {
          found = true;
          const currentExpiry = new Date(link.expires);
          currentExpiry.setDate(currentExpiry.getDate() + additionalDays);
          return { ...link, expires: currentExpiry.toISOString() };
        }
        return link;
      })
    );
    
    return found;
  };

  /**
   * Get all active links
   */
  const getAllActiveLinks = (): ShareableLink[] => {
    const now = new Date();
    return links.filter(link => 
      !link.revoked && new Date(link.expires) > now
    );
  };

  /**
   * Get all links, including expired and revoked ones
   */
  const getAllLinks = (): ShareableLink[] => {
    return links;
  };
  
  return {
    createShareableLink,
    revokeLink,
    revokeAllLinksForItem,
    validateLink,
    getLinksForItem,
    getLinkDetails,
    cleanupExpiredLinks,
    extendLinkExpiration,
    getAllActiveLinks,
    getAllLinks,
    getAllLinksForItem,
    links
  };
};
