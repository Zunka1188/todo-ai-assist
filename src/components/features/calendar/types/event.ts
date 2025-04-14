
export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  location?: string;
  color?: string;
  image?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    occurrences?: number;
    daysOfWeek?: number[];
  };
  reminder?: string;
  attachments?: AttachmentType[];
  rsvp?: RSVPType[];
  organizer?: {
    userId: string;
    name: string;
    email?: string;
  };
  participants?: ParticipantType[];
}

export interface AttachmentType {
  id: string;
  name: string;
  type: 'image' | 'document';
  url: string;
  thumbnailUrl?: string;
  size?: number;
  lastModified?: Date;
}

export interface RSVPType {
  userId: string;
  name: string;
  status: 'yes' | 'no' | 'maybe' | 'pending';
  timestamp: Date;
  comment?: string;
}

export interface ParticipantType {
  userId: string;
  name: string;
  email?: string;
  role?: 'attendee' | 'optional' | 'organizer';
  status?: 'invited' | 'accepted' | 'declined' | 'tentative';
}
