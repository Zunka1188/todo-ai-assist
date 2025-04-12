
import { Event, AttachmentType } from './event';
import { ViewMode } from '../CalendarContext';

export type { 
  Event, 
  AttachmentType,
  ViewMode
};

export type CalendarActionState = {
  isInviting: boolean;
  isAdding: boolean;
  isUpdating: boolean;
};

export interface CalendarConfig {
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  defaultView: ViewMode;
  viewModeLabels: Record<ViewMode, string>;
}

export const CALENDAR_CONFIG: CalendarConfig = {
  weekStartsOn: 1, // Monday
  firstDayOfWeek: 1, // Monday
  defaultView: 'day',
  viewModeLabels: {
    month: "Month",
    week: "Week",
    day: "Day",
    agenda: "Upcoming"
  }
};

export const ARIA_LIVE = {
  POLITE: "polite",
  ASSERTIVE: "assertive",
  OFF: "off"
};

export const ROLE = {
  ALERT: "alert",
  STATUS: "status",
  LOG: "log",
  NONE: "none"
};
