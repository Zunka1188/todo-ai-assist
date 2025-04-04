
import { useState, useEffect } from 'react';

/**
 * A debugging hook that helps identify issues in the application
 */
export const useDebugMode = () => {
  const [enabled, setEnabled] = useState(
    localStorage.getItem('debug_mode') === 'true'
  );
  
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      // Enable debug mode with Shift+Ctrl+D (or Shift+Cmd+D on Mac)
      if (e.shiftKey && (e.ctrlKey || e.metaKey) && e.code === 'KeyD') {
        const newValue = !enabled;
        setEnabled(newValue);
        localStorage.setItem('debug_mode', newValue.toString());
        console.log(`Debug mode ${newValue ? 'enabled' : 'disabled'}`);
      }
    };
    
    window.addEventListener('keydown', keyHandler);
    return () => {
      window.removeEventListener('keydown', keyHandler);
    };
  }, [enabled]);
  
  return { enabled };
};
