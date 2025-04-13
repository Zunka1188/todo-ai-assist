
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [windowWidth, setWindowWidth] = React.useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0
  )
  const [windowHeight, setWindowHeight] = React.useState<number>(
    typeof window !== 'undefined' ? window.innerHeight : 0
  )
  const [orientation, setOrientation] = React.useState<"portrait" | "landscape">("portrait")
  const [hasCamera, setHasCamera] = React.useState<boolean>(false)
  const [isIOS, setIsIOS] = React.useState<boolean>(false)
  const [isAndroid, setIsAndroid] = React.useState<boolean>(false)
  const [isTouchDevice, setIsTouchDevice] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Function to update state based on window dimensions
    const checkDimensions = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setWindowWidth(width)
      setWindowHeight(height)
      setIsMobile(width < MOBILE_BREAKPOINT)
      setOrientation(width < height ? "portrait" : "landscape")
    }

    // Check if the device is a touch device
    const checkTouchDevice = () => {
      setIsTouchDevice(
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 || 
        (navigator as any).msMaxTouchPoints > 0
      )
    }
    
    // Check platform
    const checkPlatform = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
      setIsIOS(/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream);
      setIsAndroid(/android/i.test(userAgent));
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
    
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Run once on initial mount (after DOM is available)
      checkDimensions()
      checkTouchDevice()
      checkPlatform()
      checkCameraAvailability()
      
      // Add event listener with debounce for performance
      let timeoutId: ReturnType<typeof setTimeout>
      const handleResize = () => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          checkDimensions()
        }, 100)
      }
      
      window.addEventListener("resize", handleResize)
      
      // Add orientation change listener for mobile devices
      window.addEventListener("orientationchange", () => {
        // Delay slightly as dimensions may not update immediately
        setTimeout(checkDimensions, 100)
      })
      
      // Cleanup
      return () => {
        clearTimeout(timeoutId)
        window.removeEventListener("resize", handleResize)
        window.removeEventListener("orientationchange", checkDimensions)
      }
    }
    
    return undefined;
  }, [])

  return { 
    isMobile, 
    windowWidth, 
    windowHeight,
    orientation, 
    hasCamera,
    isIOS,
    isAndroid,
    isTouchDevice
  }
}
