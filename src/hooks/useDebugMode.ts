
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

export interface DebugModeOptions {
  logProps?: boolean;
  logEvents?: boolean; 
  logApiRequests?: boolean;
  logApiResponses?: boolean;
}

/**
 * Enhanced debugging hook that helps identify issues in the application
 */
export const useDebugMode = () => {
  const [enabled, setEnabled] = useState(
    localStorage.getItem('debug_mode') === 'true'
  );
  
  const [options, setOptions] = useState<DebugModeOptions>({
    logProps: true,
    logEvents: true,
    logApiRequests: true,
    logApiResponses: true,
  });
  
  const { toast } = useToast();
  
  // Load saved options from localStorage
  useEffect(() => {
    const savedOptions = localStorage.getItem('debug_mode_options');
    if (savedOptions) {
      try {
        setOptions(JSON.parse(savedOptions));
      } catch (e) {
        console.error('Failed to parse debug options', e);
      }
    }
  }, []);
  
  // Save options to localStorage when they change
  useEffect(() => {
    localStorage.setItem('debug_mode_options', JSON.stringify(options));
  }, [options]);
  
  // Toggle specific debug options
  const toggleOption = useCallback((option: keyof DebugModeOptions) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  }, []);

  // Enable or disable all debug options
  const setAllOptions = useCallback((state: boolean) => {
    setOptions({
      logProps: state,
      logEvents: state,
      logApiRequests: state,
      logApiResponses: state
    });
  }, []);
  
  // Keyboard shortcut handler
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      // Enable debug mode with Shift+Ctrl+D (or Shift+Cmd+D on Mac)
      if (e.shiftKey && (e.ctrlKey || e.metaKey) && e.code === 'KeyD') {
        const newValue = !enabled;
        setEnabled(newValue);
        localStorage.setItem('debug_mode', newValue.toString());
        
        toast({
          title: `Debug Mode ${newValue ? 'Enabled' : 'Disabled'}`,
          description: newValue 
            ? "Debug logs will now appear in the console (Shift+Ctrl+D to turn off)" 
            : "Debug logs have been disabled",
          variant: newValue ? "default" : "secondary",
        });
        
        console.log(`Debug mode ${newValue ? 'enabled' : 'disabled'}`);
      }
    };
    
    window.addEventListener('keydown', keyHandler);
    return () => {
      window.removeEventListener('keydown', keyHandler);
    };
  }, [enabled, toast]);
  
  // Log helper functions
  const logProps = useCallback((componentName: string, props: any) => {
    if (enabled && options.logProps) {
      console.group(`[${componentName}] Props:`);
      console.log(props);
      console.groupEnd();
    }
  }, [enabled, options.logProps]);

  const logEvent = useCallback((eventName: string, data?: any) => {
    if (enabled && options.logEvents) {
      console.group(`[Event] ${eventName}`);
      if (data) console.log(data);
      console.groupEnd();
    }
  }, [enabled, options.logEvents]);

  const logApiRequest = useCallback((endpoint: string, method: string, data?: any) => {
    if (enabled && options.logApiRequests) {
      console.group(`[API Request] ${method} ${endpoint}`);
      if (data) console.log('Request Data:', data);
      console.log('Timestamp:', new Date().toISOString());
      console.groupEnd();
    }
  }, [enabled, options.logApiRequests]);

  const logApiResponse = useCallback((endpoint: string, status: number, data?: any) => {
    if (enabled && options.logApiResponses) {
      const statusType = status < 300 ? 'Success' : status < 400 ? 'Redirect' : status < 500 ? 'Client Error' : 'Server Error';
      console.group(`[API Response] ${endpoint} (${status}: ${statusType})`);
      if (data) console.log('Response Data:', data);
      console.log('Timestamp:', new Date().toISOString());
      console.groupEnd();
    }
  }, [enabled, options.logApiResponses]);
  
  return { 
    enabled,
    options,
    toggleOption,
    setAllOptions,
    logProps,
    logEvent,
    logApiRequest,
    logApiResponse
  };
};
