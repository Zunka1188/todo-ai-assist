
import * as React from "react"
import { useAppState } from "@/state/useStore";

const MOBILE_BREAKPOINT = 768;

export function useMobileState() {
  const appState = useAppState();
  // Access isMobile from the returned object directly
  const isMobile = appState.isMobile ?? false;
  const { actions } = appState;
  
  React.useEffect(() => {
    // Function to update state based on window dimensions
    const checkDimensions = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        actions.setMobile(width < MOBILE_BREAKPOINT);
      }
    }
    
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Run once on initial mount
      checkDimensions();
      
      // Add event listener with debounce for performance
      let timeoutId: ReturnType<typeof setTimeout>;
      const handleResize = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(checkDimensions, 100);
      };
      
      window.addEventListener("resize", handleResize);
      
      // Add orientation change listener for mobile devices
      window.addEventListener("orientationchange", () => {
        // Delay slightly as dimensions may not update immediately
        setTimeout(checkDimensions, 100);
      });
      
      // Cleanup
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("orientationchange", checkDimensions);
      };
    }
    
    return undefined;
  }, [actions]);

  return { isMobile };
}
