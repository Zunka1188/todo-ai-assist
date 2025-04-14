import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { initialEvents } from '@/components/features/calendar/data/initialEvents';
import { 
  AppState, 
  CalendarState, 
  ShoppingState, 
  GlobalState,
} from './types';
import { SortOption } from '@/components/features/shopping/useShoppingItems';
import { logger } from '@/utils/logger';
import { Event } from '@/components/features/calendar/types/event';

// Define action types since they weren't properly imported from types.ts
type AppAction = {
  type: string;
  payload?: any;
};

type CalendarAction = {
  type: string;
  payload?: any;
};

type ShoppingAction = {
  type: string;
  payload?: any;
};

type GlobalAction = {
  type: string;
  action?: AppAction | CalendarAction | ShoppingAction;
  error?: boolean;
  meta?: {
    analytics?: boolean;
    persist?: boolean;
  };
};

// Initial states
const initialAppState: AppState = {
  theme: 'system',
  isMobile: false,
  debugMode: false,
  isLoading: false,
  error: null,
  csrfProtectionEnabled: true,
  securityHeadersEnabled: true,
  lastUpdated: Date.now(),
  version: '1.0.0',
  features: {}
};

const initialCalendarState: CalendarState = {
  viewMode: 'day',
  currentDate: new Date(),
  searchTerm: '',
  createDialogOpen: false,
  showFileUploader: false,
  inviteDialogOpen: false,
  isAddingEvent: false,
  isInviting: false,
  events: initialEvents,
  selectedEvent: null,
  view: 'month',
  selectedDate: null
};

const initialShoppingState: ShoppingState = {
  searchTerm: '',
  filterMode: 'all',
  sortOption: 'newest',
  selectedItems: [],
  isLoading: false,
  items: [],
  categories: [],
  lastSynced: Date.now()
};

// Create placeholder states for the other required parts of the global state
const initialAuthState = {
  isAuthenticated: false,
  token: null,
  refreshToken: null,
  expiresAt: null,
  loginAttempts: 0
};

const initialUserState = {
  id: null,
  name: null,
  email: null,
  preferences: { theme: 'system', language: 'en', notifications: true, autoSync: true },
  profile: { displayName: 'User', joinDate: Date.now() }
};

const initialNotificationsState = {
  items: [],
  unreadCount: 0,
  settings: { email: true, push: true, inApp: true, desktop: true }
};

const initialRecipesState = {
  items: [],
  favorites: [],
  recent: [],
  filters: { cuisine: [], dietary: [] }
};

const initialDocumentsState = {
  items: [],
  selectedId: null,
  isUploading: false
};

// Define the initialState that combines all the individual state objects
const initialState: GlobalState = {
  app: initialAppState,
  calendar: initialCalendarState,
  shopping: initialShoppingState,
  auth: initialAuthState,
  user: initialUserState,
  notifications: initialNotificationsState,
  recipes: initialRecipesState,
  documents: initialDocumentsState
};

// Reducers
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_MOBILE':
      return { ...state, isMobile: action.payload };
    case 'SET_DEBUG_MODE':
      return { ...state, debugMode: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CSRF_PROTECTION':
      return { ...state, csrfProtectionEnabled: action.payload };
    case 'SET_SECURITY_HEADERS':
      return { ...state, securityHeadersEnabled: action.payload };
    default:
      return state;
  }
};

const calendarReducer = (state: CalendarState, action: CalendarAction): CalendarState => {
  switch (action.type) {
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'SET_CURRENT_DATE':
      return { ...state, currentDate: action.payload };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    case 'SET_CREATE_DIALOG_OPEN':
      return { ...state, createDialogOpen: action.payload };
    case 'SET_FILE_UPLOADER':
      return { ...state, showFileUploader: action.payload };
    case 'SET_INVITE_DIALOG_OPEN':
      return { ...state, inviteDialogOpen: action.payload };
    case 'SET_IS_ADDING_EVENT':
      return { ...state, isAddingEvent: action.payload };
    case 'SET_IS_INVITING':
      return { ...state, isInviting: action.payload };
    case 'SET_EVENTS':
      return { ...state, events: action.payload };
    case 'SET_SELECTED_EVENT':
      return { ...state, selectedEvent: action.payload };
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] };
    case 'UPDATE_EVENT':
      return { 
        ...state, 
        events: state.events.map(event => 
          event.id === action.payload.id ? action.payload : event
        ) 
      };
    case 'DELETE_EVENT':
      return { 
        ...state, 
        events: state.events.filter(event => event.id !== action.payload) 
      };
    default:
      return state;
  }
};

const shoppingReducer = (state: ShoppingState, action: ShoppingAction): ShoppingState => {
  switch (action.type) {
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    case 'SET_FILTER_MODE':
      return { ...state, filterMode: action.payload };
    case 'SET_SORT_OPTION':
      return { ...state, sortOption: action.payload };
    case 'SET_SELECTED_ITEMS':
      return { ...state, selectedItems: action.payload };
    case 'ADD_SELECTED_ITEM':
      return { ...state, selectedItems: [...state.selectedItems, action.payload] };
    case 'REMOVE_SELECTED_ITEM':
      return { 
        ...state, 
        selectedItems: state.selectedItems.filter(id => id !== action.payload) 
      };
    case 'CLEAR_SELECTED_ITEMS':
      return { ...state, selectedItems: [] };
    case 'SET_SHOPPING_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

// Root reducer
const rootReducer = (state: GlobalState, action: GlobalAction): GlobalState => {
  switch (action.type) {
    case 'APP':
      return { ...state, app: appReducer(state.app, action.action) };
    case 'CALENDAR':
      return { ...state, calendar: calendarReducer(state.calendar, action.action) };
    case 'SHOPPING':
      return { ...state, shopping: shoppingReducer(state.shopping, action.action) };
    default:
      return state;
  }
};

// Create the context
const StoreContext = createContext<{
  state: GlobalState;
  dispatch: React.Dispatch<GlobalAction>;
}>({
  state: initialState,
  dispatch: () => null
});

// Create a provider component
interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const [state, dispatch] = useReducer(rootReducer, initialState);

  // Log state changes in debug mode
  React.useEffect(() => {
    if (state.app.debugMode) {
      logger.log('[Store] State updated:', state);
    }
  }, [state]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

// Custom hooks for using the context
export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

// Specialized hooks for different parts of the store
export const useAppState = () => {
  const { state, dispatch } = useStore();
  
  const actions = {
    setTheme: (theme: AppState['theme']) => 
      dispatch({ type: 'APP', action: { type: 'SET_THEME', payload: theme } }),
    setMobile: (isMobile: boolean) => 
      dispatch({ type: 'APP', action: { type: 'SET_MOBILE', payload: isMobile } }),
    setDebugMode: (enabled: boolean) => 
      dispatch({ type: 'APP', action: { type: 'SET_DEBUG_MODE', payload: enabled } }),
    setLoading: (isLoading: boolean) => 
      dispatch({ type: 'APP', action: { type: 'SET_LOADING', payload: isLoading } }),
    setError: (error: string | null) => 
      dispatch({ type: 'APP', action: { type: 'SET_ERROR', payload: error } }),
    setCsrfProtection: (enabled: boolean) => 
      dispatch({ type: 'APP', action: { type: 'SET_CSRF_PROTECTION', payload: enabled } }),
    setSecurityHeaders: (enabled: boolean) => 
      dispatch({ type: 'APP', action: { type: 'SET_SECURITY_HEADERS', payload: enabled } })
  };

  return { 
    ...state.app,
    actions
  };
};

export const useCalendarState = () => {
  const { state, dispatch } = useStore();
  
  const actions = {
    setViewMode: (viewMode: CalendarState['viewMode']) => 
      dispatch({ type: 'CALENDAR', action: { type: 'SET_VIEW_MODE', payload: viewMode } }),
    setCurrentDate: (date: Date) => 
      dispatch({ type: 'CALENDAR', action: { type: 'SET_CURRENT_DATE', payload: date } }),
    setSearchTerm: (term: string) => 
      dispatch({ type: 'CALENDAR', action: { type: 'SET_SEARCH_TERM', payload: term } }),
    setCreateDialogOpen: (open: boolean) => 
      dispatch({ type: 'CALENDAR', action: { type: 'SET_CREATE_DIALOG_OPEN', payload: open } }),
    setFileUploader: (show: boolean) => 
      dispatch({ type: 'CALENDAR', action: { type: 'SET_FILE_UPLOADER', payload: show } }),
    setInviteDialogOpen: (open: boolean) => 
      dispatch({ type: 'CALENDAR', action: { type: 'SET_INVITE_DIALOG_OPEN', payload: open } }),
    setIsAddingEvent: (adding: boolean) => 
      dispatch({ type: 'CALENDAR', action: { type: 'SET_IS_ADDING_EVENT', payload: adding } }),
    setIsInviting: (inviting: boolean) => 
      dispatch({ type: 'CALENDAR', action: { type: 'SET_IS_INVITING', payload: inviting } }),
    setEvents: (events: Event[]) => 
      dispatch({ type: 'CALENDAR', action: { type: 'SET_EVENTS', payload: events } }),
    setSelectedEvent: (event: Event | null) => 
      dispatch({ type: 'CALENDAR', action: { type: 'SET_SELECTED_EVENT', payload: event } }),
    addEvent: (event: Event) => 
      dispatch({ type: 'CALENDAR', action: { type: 'ADD_EVENT', payload: event } }),
    updateEvent: (event: Event) => 
      dispatch({ type: 'CALENDAR', action: { type: 'UPDATE_EVENT', payload: event } }),
    deleteEvent: (eventId: string) => 
      dispatch({ type: 'CALENDAR', action: { type: 'DELETE_EVENT', payload: eventId } })
  };

  return {
    ...state.calendar,
    actions
  };
};

export const useShoppingState = () => {
  const { state, dispatch } = useStore();
  
  const actions = {
    setSearchTerm: (term: string) => 
      dispatch({ type: 'SHOPPING', action: { type: 'SET_SEARCH_TERM', payload: term } }),
    setFilterMode: (mode: ShoppingState['filterMode']) => 
      dispatch({ type: 'SHOPPING', action: { type: 'SET_FILTER_MODE', payload: mode } }),
    setSortOption: (option: SortOption) => 
      dispatch({ type: 'SHOPPING', action: { type: 'SET_SORT_OPTION', payload: option } }),
    setSelectedItems: (items: string[]) => 
      dispatch({ type: 'SHOPPING', action: { type: 'SET_SELECTED_ITEMS', payload: items } }),
    addSelectedItem: (id: string) => 
      dispatch({ type: 'SHOPPING', action: { type: 'ADD_SELECTED_ITEM', payload: id } }),
    removeSelectedItem: (id: string) => 
      dispatch({ type: 'SHOPPING', action: { type: 'REMOVE_SELECTED_ITEM', payload: id } }),
    clearSelectedItems: () => 
      dispatch({ type: 'SHOPPING', action: { type: 'CLEAR_SELECTED_ITEMS' } }),
    setLoading: (loading: boolean) => 
      dispatch({ type: 'SHOPPING', action: { type: 'SET_SHOPPING_LOADING', payload: loading } })
  };

  return {
    ...state.shopping,
    actions
  };
};
