
import { useState, useEffect } from 'react';

interface ShareableLink {
  id: string;
  itemId: string;
  itemType: 'document' | 'shopping' | 'todo' | 'note';
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
  
  /**
   * Generate a new shareable link
   */
  const createShareableLink = (
    itemId: string, 
    itemType: 'document' | 'shopping' | 'todo' | 'note',
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
  
  return {
    createShareableLink,
    revokeLink,
    revokeAllLinksForItem,
    validateLink,
    getLinksForItem,
    getLinkDetails,
    cleanupExpiredLinks,
    links
  };
};
