// Extend the existing types.ts file to add needed types for rate limiting

// This is a partial implementation as we don't have access to the full file
// We're adding types that might be needed for the rate limiter

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
}

export interface ShoppingState {
  filterMode: string;
  sortOption: string;
  items: ShoppingItem[];
  categories: Category[];
  selectedItems: string[];
  lastSynced: number;
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
  view: 'day' | 'week' | 'month';
  selectedDate: string | null;
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

export enum ErrorType {
  CLIENT = 'client_error',
  SERVER = 'server_error',
  NETWORK = 'network_error',
  AUTH = 'authentication_error',
  VALIDATION = 'validation_error',
  UNKNOWN = 'unknown_error'
}
