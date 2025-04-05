
import { useState, useEffect, useRef } from 'react';

interface UseCameraOptions {
  facingMode?: 'environment' | 'user';
  onError?: (error: string, isPermissionDenied: boolean) => void;
}

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const { 
    facingMode = 'environment',
    onError
  } = options;

  const handleError = (error: string, isPermissionDenied: boolean = false) => {
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
      console.log("Starting camera...");
      setCameraError(null);
      setPermissionDenied(false);
      setIsInitializing(true);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        handleError("Camera API not supported in this browser", false);
        setIsInitializing(false);
        return;
      }
      
      const constraints = { 
        video: { 
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
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
                })
                .catch(err => {
                  handleError(`Error playing video: ${err.message}`, false);
                  setIsInitializing(false);
                });
            }
          };
          
          videoRef.current.onerror = (e) => {
            handleError("Video element error", false);
            setIsInitializing(false);
          };
        } else {
          handleError("Camera initialization failed - video element not found", false);
          setIsInitializing(false);
        }
      } catch (err: any) {
        console.error("Camera access error:", err);
        
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          handleError("Camera permission denied. Please allow camera access in your browser settings.", true);
          setIsInitializing(false);
          return;
        }
        
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
                  })
                  .catch(playErr => {
                    handleError(`Error starting camera: ${playErr.message}`, false);
                    setIsInitializing(false);
                  });
              }
            };
          }
        } catch (fallbackErr: any) {
          console.error("Both camera initialization attempts failed:", fallbackErr);
          
          if (fallbackErr.name === 'NotAllowedError' || fallbackErr.name === 'PermissionDeniedError') {
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
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
          
          if (result.state === 'granted') {
            startCamera();
          } else if (result.state === 'prompt') {
            startCamera();
          } else if (result.state === 'denied') {
            handleError("Camera permission is blocked. Please update your browser settings to allow camera access.", true);
          }
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
