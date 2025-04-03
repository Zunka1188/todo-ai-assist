
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [windowWidth, setWindowWidth] = React.useState<number>(0)
  const [orientation, setOrientation] = React.useState<"portrait" | "landscape">("portrait")

  React.useEffect(() => {
    // Function to update state based on window width
    const checkMobile = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      setWindowWidth(width)
      setIsMobile(width < MOBILE_BREAKPOINT)
      setOrientation(width < height ? "portrait" : "landscape")
    }
    
    // Run once on initial mount (after DOM is available)
    checkMobile()
    
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

  return { isMobile, windowWidth, orientation }
}
