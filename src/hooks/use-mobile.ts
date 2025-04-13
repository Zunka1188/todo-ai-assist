
import { useState, useEffect } from 'react';

interface MobileState {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  hasCamera: boolean;
  windowWidth: number;
  windowHeight?: number;
  orientation?: "portrait" | "landscape";
  isTouchDevice?: boolean;
}

export const useIsMobile = (): MobileState => {
  const [state, setState] = useState<MobileState>({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    hasCamera: false,
    windowWidth: typeof window !== 'undefined' ? window.innerWidth : 0
  });

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const isMobile = windowWidth < 768;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /Android/.test(userAgent);
      const hasCamera = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
      const orientation = windowWidth < windowHeight ? "portrait" : "landscape";
      const isTouchDevice = 'ontouchstart' in window || 
                          navigator.maxTouchPoints > 0 || 
                          (navigator as any).msMaxTouchPoints > 0;

      setState({
        isMobile,
        isIOS,
        isAndroid,
        hasCamera,
        windowWidth,
        windowHeight,
        orientation,
        isTouchDevice
      });
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return state;
};
