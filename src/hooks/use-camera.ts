
import { useState, useEffect, useRef, RefObject } from 'react';

interface UseCameraOptions {
  facingMode?: 'environment' | 'user';
  onError?: (error: string, isPermissionDenied: boolean) => void;
  videoRef?: RefObject<HTMLVideoElement>;
  canvasRef?: RefObject<HTMLCanvasElement>;
  autoStart?: boolean;
}

interface UseCameraReturn {
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  cameraActive: boolean;
  isInitializing: boolean;
  permissionDenied: boolean;
  cameraError: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureImage: () => string | null;
  requestCameraPermission: () => Promise<void>;
}

export const useCamera = (options: UseCameraOptions = {}): UseCameraReturn => {
  // Use passed refs or create new ones
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const videoRef = options.videoRef || localVideoRef;
  const canvasRef = options.canvasRef || localCanvasRef;
  
  const [cameraActive, setCameraActive] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const initAttempts = useRef(0);

  const { 
    facingMode = 'environment',
    onError,
    autoStart = true
  } = options;

  const handleError = (error: string, isPermissionDenied: boolean = false) => {
    console.error("Camera error:", error);
    setCameraError(error);
    if (isPermissionDenied) {
      setPermissionDenied(true);
    }
    if (onError) {
      onError(error, isPermissionDenied);
    }
  };

  const startCamera = async () => {
    try {
      console.log("Starting camera...", { attempt: initAttempts.current + 1, videoRefExists: !!videoRef.current });
      initAttempts.current += 1;
      setCameraError(null);
      setPermissionDenied(false);
      setIsInitializing(true);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        handleError("Camera API not supported in this browser", false);
        setIsInitializing(false);
        return;
      }
      
      // Check if video ref is available
      if (!videoRef.current) {
        console.error("Video reference not available");
        handleError("Camera initialization failed - video element not found", false);
        setIsInitializing(false);
        return;
      }
      
      // Check if the browser is in a secure context
      if (!window.isSecureContext) {
        console.warn("Not running in secure context - camera might not work");
      }
      
      // First check if permissions API is available
      let permissionState: PermissionState | null = null;
      
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
          permissionState = permissionStatus.state;
          console.log("Camera permission state:", permissionState);
          
          if (permissionState === 'denied') {
            handleError("Camera permission is denied. Please update your browser settings.", true);
            setIsInitializing(false);
            return;
          }
        }
      } catch (permErr) {
        console.log("Permission query not supported or other error:", permErr);
      }
      
      const constraints = { 
        video: { 
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      console.log("Attempting camera access with constraints:", constraints);
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true'); // Important for iOS
          videoRef.current.setAttribute('muted', 'true');
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          
          videoRef.current.onloadedmetadata = () => {
            console.log("Video metadata loaded, attempting to play");
            if (videoRef.current) {
              videoRef.current.play()
                .then(() => {
                  console.log("Camera started successfully");
                  setCameraActive(true);
                  setIsInitializing(false);
                  initAttempts.current = 0; // Reset attempts counter on success
                })
                .catch(err => {
                  console.error("Error playing video:", err);
                  handleError(`Error playing video: ${err.message}`, false);
                  setIsInitializing(false);
                });
            }
          };
          
          videoRef.current.onerror = (e) => {
            console.error("Video element error:", e);
            handleError("Video element error", false);
            setIsInitializing(false);
          };
        } else {
          console.error("Video reference not available after stream");
          handleError("Camera initialization failed - video element not found after obtaining stream", false);
          setIsInitializing(false);
        }
      } catch (err: any) {
        console.error("Camera access error:", err);
        
        // Check if this is a permission error
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          console.error("Camera permission denied:", err);
          handleError("Camera permission denied. Please allow camera access in your browser settings.", true);
          setIsInitializing(false);
          return;
        }
        
        // Try fallback with simpler constraints
        console.error("First attempt failed, trying with different constraints", err);
        
        try {
          const fallbackConstraints = {
            video: true,
            audio: false
          };
          
          console.log("Trying fallback constraints:", fallbackConstraints);
          const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
          
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            videoRef.current.setAttribute('playsinline', 'true');
            videoRef.current.setAttribute('muted', 'true');
            videoRef.current.muted = true;
            videoRef.current.playsInline = true;
            
            videoRef.current.onloadedmetadata = () => {
              console.log("Video metadata loaded with fallback constraints");
              if (videoRef.current) {
                videoRef.current.play()
                  .then(() => {
                    console.log("Camera started successfully with fallback constraints");
                    setCameraActive(true);
                    setIsInitializing(false);
                    initAttempts.current = 0; // Reset attempts counter on success
                  })
                  .catch(playErr => {
                    console.error("Error playing video with fallback constraints:", playErr);
                    handleError(`Error starting camera: ${playErr.message}`, false);
                    setIsInitializing(false);
                  });
              }
            };
          } else {
            console.error("Video reference not available for fallback");
            handleError("Camera initialization failed - video element not found for fallback", false);
            setIsInitializing(false);
          }
        } catch (fallbackErr: any) {
          console.error("Both camera initialization attempts failed:", fallbackErr);
          
          if (fallbackErr.name === 'NotAllowedError' || fallbackErr.name === 'PermissionDeniedError') {
            setPermissionDenied(true);
            handleError("Camera permission denied. Please allow camera access in your browser settings.", true);
          } else {
            handleError(`Could not access camera: ${fallbackErr.message || "Unknown error"}`, false);
          }
          
          setIsInitializing(false);
        }
      }
    } catch (error: any) {
      console.error('Error in camera initialization:', error);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        handleError("Camera permission denied. Please allow camera access in your browser settings.", true);
      } else {
        handleError(error.message || "Unknown camera error", false);
      }
      
      setIsInitializing(false);
    }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => {
        console.log("Stopping track:", track.kind);
        track.stop();
      });
      
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };
  
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageDataURL = canvas.toDataURL('image/jpeg');
        return imageDataURL;
      }
    }
    return null;
  };
  
  const requestCameraPermission = async () => {
    try {
      // Check if previously denied - if so, show instructions
      if (permissionDenied) {
        console.log("Camera permission previously denied, showing guidance");
        return;
      }
      
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
          
          console.log("Camera permission result:", result.state);
          
          if (result.state === 'granted') {
            startCamera();
          } else if (result.state === 'prompt') {
            startCamera();
          } else if (result.state === 'denied') {
            handleError("Camera permission is blocked. Please update your browser settings to allow camera access.", true);
          }
          
          // Listen for permission changes
          result.addEventListener('change', () => {
            console.log("Camera permission changed to:", result.state);
            if (result.state === 'granted') {
              setPermissionDenied(false);
              if (initAttempts.current < 3) {
                startCamera();
              }
            } else if (result.state === 'denied') {
              setPermissionDenied(true);
            }
          });
        } catch (error) {
          console.log("Permission API not supported or other error", error);
          startCamera();
        }
      } else {
        startCamera();
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
      startCamera();
    }
  };

  // Mark component as ready in the next tick to ensure DOM is available
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Auto-start camera when ready, if option is enabled
  useEffect(() => {
    if (isReady && autoStart) {
      requestCameraPermission();
    }
  }, [isReady, autoStart]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return {
    videoRef,
    canvasRef,
    cameraActive,
    isInitializing,
    permissionDenied,
    cameraError,
    startCamera,
    stopCamera,
    captureImage,
    requestCameraPermission
  };
};
