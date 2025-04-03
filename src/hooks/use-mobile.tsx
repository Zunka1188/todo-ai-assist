
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [windowWidth, setWindowWidth] = React.useState<number>(0)
  const [orientation, setOrientation] = React.useState<"portrait" | "landscape">("portrait")
  const [hasCamera, setHasCamera] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Function to update state based on window width
    const checkMobile = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setWindowWidth(width)
      setIsMobile(width < MOBILE_BREAKPOINT)
      setOrientation(width < height ? "portrait" : "landscape")
    }
    
    // Check if the device has a camera
    const checkCameraAvailability = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const hasVideoInput = devices.some(device => device.kind === 'videoinput');
          setHasCamera(hasVideoInput);
        } else {
          // If the API is not available, assume no camera
          setHasCamera(false);
        }
      } catch (error) {
        console.error('Error checking camera availability:', error);
        setHasCamera(false);
      }
    };
    
    // Run once on initial mount (after DOM is available)
    checkMobile()
    checkCameraAvailability()
    
    // Add event listener with debounce for performance
    let timeoutId: ReturnType<typeof setTimeout>
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(checkMobile, 100)
    }
    
    window.addEventListener("resize", handleResize)
    
    // Add orientation change listener for mobile devices
    window.addEventListener("orientationchange", checkMobile)
    
    // Cleanup
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("orientationchange", checkMobile)
    }
  }, [])

  return { isMobile, windowWidth, orientation, hasCamera }
}
