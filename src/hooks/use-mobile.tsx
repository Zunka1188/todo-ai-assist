
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [windowWidth, setWindowWidth] = React.useState<number>(0)

  React.useEffect(() => {
    // Function to update state based on window width
    const checkMobile = () => {
      const width = window.innerWidth
      setWindowWidth(width)
      setIsMobile(width < MOBILE_BREAKPOINT)
    }
    
    // Run once on initial mount
    checkMobile()
    
    // Add event listener with debounce for performance
    let timeoutId: ReturnType<typeof setTimeout>
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(checkMobile, 100)
    }
    
    window.addEventListener("resize", handleResize)
    
    // Cleanup
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return { isMobile, windowWidth }
}
