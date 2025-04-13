import { Event } from '@/components/features/calendar/types/event';
import { SortOption } from '@/components/features/shopping/useShoppingItems';
import { ViewMode } from '@/components/features/calendar/types';

// App-wide state types
export interface AppState {
  // User preferences
  theme: 'light' | 'dark' | 'system';
  isMobile: boolean;
  
  // Feature flags and settings
  debugMode: boolean;

  // Global loading and error states
  isLoading: boolean;
  error: string | null;
  
  // Security state
  csrfProtectionEnabled?: boolean;
  securityHeadersEnabled?: boolean;
}

// Calendar state types
export interface CalendarState {
  // View state
  viewMode: ViewMode;
  currentDate: Date;
  searchTerm: string;

  // UI state
  createDialogOpen: boolean;
  showFileUploader: boolean;
  inviteDialogOpen: boolean;
  isAddingEvent: boolean;
  isInviting: boolean;
  
  // Data
  events: Event[];
  selectedEvent: Event | null;
}

// Shopping state types
export interface ShoppingState {
  searchTerm: string;
  filterMode: 'all' | 'one-off' | 'weekly' | 'monthly';
  sortOption: SortOption;
  selectedItems: string[];
  isLoading: boolean;
}

// Complete app state
export interface GlobalState {
  app: AppState;
  calendar: CalendarState;
  shopping: ShoppingState;
}

// Action types
export type AppAction = 
  | { type: 'SET_THEME'; payload: AppState['theme'] }
  | { type: 'SET_MOBILE'; payload: boolean }
  | { type: 'SET_DEBUG_MODE'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CSRF_PROTECTION'; payload: boolean }
  | { type: 'SET_SECURITY_HEADERS'; payload: boolean };

export type CalendarAction = 
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_CURRENT_DATE'; payload: Date }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_CREATE_DIALOG_OPEN'; payload: boolean }
  | { type: 'SET_FILE_UPLOADER'; payload: boolean }
  | { type: 'SET_INVITE_DIALOG_OPEN'; payload: boolean }
  | { type: 'SET_IS_ADDING_EVENT'; payload: boolean }
  | { type: 'SET_IS_INVITING'; payload: boolean }
  | { type: 'SET_EVENTS'; payload: Event[] }
  | { type: 'SET_SELECTED_EVENT'; payload: Event | null }
  | { type: 'ADD_EVENT'; payload: Event }
  | { type: 'UPDATE_EVENT'; payload: Event }
  | { type: 'DELETE_EVENT'; payload: string }; // event id

export type ShoppingAction =
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_FILTER_MODE'; payload: ShoppingState['filterMode'] }
  | { type: 'SET_SORT_OPTION'; payload: SortOption }
  | { type: 'SET_SELECTED_ITEMS'; payload: string[] }
  | { type: 'ADD_SELECTED_ITEM'; payload: string }
  | { type: 'REMOVE_SELECTED_ITEM'; payload: string }
  | { type: 'CLEAR_SELECTED_ITEMS' }
  | { type: 'SET_SHOPPING_LOADING'; payload: boolean };

export type GlobalAction = 
  | { type: 'APP'; action: AppAction }
  | { type: 'CALENDAR'; action: CalendarAction }
  | { type: 'SHOPPING'; action: ShoppingAction };
