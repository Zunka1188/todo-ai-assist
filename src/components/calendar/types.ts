
export type ViewMode = 'day' | 'month' | 'agenda';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
}

export interface CalendarDimensions {
  width: string;
  height: string;
  minWidth: string;
  minHeight: string;
  headerHeight: number;
  timeWidth: number;
}
