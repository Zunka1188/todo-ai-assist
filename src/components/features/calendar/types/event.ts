
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
}

export interface AttachmentType {
  id: string;
  name: string;
  type: 'image' | 'document';
  url: string;
  thumbnailUrl?: string;
}
