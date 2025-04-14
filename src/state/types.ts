
// Extended type definitions for the application state management

// Basic types for shopping items
export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  category?: string;
  purchased?: boolean;
  createdAt: number;
  image?: string;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
}

// User-related types
export interface UserPreferences {
  theme: string;
  language: string;
  notifications: boolean;
  autoSync: boolean;
}

export interface UserProfile {
  displayName: string;
  photoURL?: string;
  joinDate: number;
  bio?: string;
}

// Recipe-related types
export interface Recipe {
  id: string;
  name: string;
  description?: string;
  ingredients: string[];
  steps: string[];
  time?: number;
  image?: string;
}

export interface RecipeFilters {
  cuisine: string[];
  dietary: string[];
  time?: number;
  complexity?: string;
}

// Event type for calendar
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  attendees?: string[];
  color?: string;
  allDay?: boolean;
  image?: string;
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: number;
  type: 'info' | 'warning' | 'error' | 'success';
  link?: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
  desktop: boolean;
}

// Document types
export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  size?: number;
  createdAt: number;
  category?: string;
  tags?: string[];
}

// State types for the global state
export interface GlobalState {
  app: AppState;
  shopping: ShoppingState;
  auth: AuthState;
  user: UserState;
  notifications: NotificationState;
  recipes: RecipeState;
  calendar: CalendarState;
  documents: DocumentState;
}

export interface AppState {
  theme: string;
  debugMode: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;
  version: string;
  features: Record<string, boolean>;
  isMobile: boolean;
  csrfProtectionEnabled: boolean;
  securityHeadersEnabled: boolean;
}

export interface ShoppingState {
  filterMode: string;
  sortOption: string;
  items: ShoppingItem[];
  categories: Category[];
  selectedItems: string[];
  lastSynced: number;
  searchTerm: string;
  isLoading: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  loginAttempts: number;
}

export interface UserState {
  id: string | null;
  name: string | null;
  email: string | null;
  preferences: UserPreferences;
  profile: UserProfile;
}

export interface NotificationState {
  items: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
}

export interface RecipeState {
  items: Recipe[];
  favorites: string[];
  recent: string[];
  filters: RecipeFilters;
}

export interface CalendarState {
  events: CalendarEvent[];
  view: 'day' | 'week' | 'month' | 'agenda';
  selectedDate: string | null;
  viewMode: 'day' | 'week' | 'month' | 'agenda';
  currentDate: Date;
  searchTerm: string;
  createDialogOpen: boolean;
  showFileUploader: boolean;
  inviteDialogOpen: boolean;
  isAddingEvent: boolean;
  isInviting: boolean;
  selectedEvent: CalendarEvent | null;
}

export interface DocumentState {
  items: Document[];
  selectedId: string | null;
  isUploading: boolean;
}

// Action Types
export type GlobalAction = {
  type: string;
  action?: {
    type: string;
    payload?: any;
    meta?: {
      timestamp: number;
      source: string;
    };
  };
  error?: boolean;
  meta?: {
    analytics?: boolean;
    persist?: boolean;
  };
};

// Define specific action types for each slice
export type AppAction = {
  type: string;
  payload?: any;
};

export type CalendarAction = {
  type: string;
  payload?: any;
};

export type ShoppingAction = {
  type: string;
  payload?: any;
};

export enum ErrorType {
  CLIENT = 'client_error',
  SERVER = 'server_error',
  NETWORK = 'network_error',
  AUTH = 'authentication_error',
  VALIDATION = 'validation_error',
  UNKNOWN = 'unknown_error'
}
