
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Scan, X, Check } from 'lucide-react';
import { useUnifiedDetection } from '@/utils/detectionEngine/hooks/useUnifiedDetection';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import './camera-animations.css';
import { DetectionResult } from '@/utils/detectionEngine/types';

interface UnifiedScannerCaptureProps {
  onCapture: (result: any) => void;
  onSaveSuccess?: (data: any) => void;
  onClose?: () => void;
  mode?: 'smart';
  initialCameraActive?: boolean;
  manualCapture?: boolean;
  autoStart?: boolean;
  preferredMode?: string;
}

const UnifiedScannerCapture: React.FC<UnifiedScannerCaptureProps> = ({
  onCapture,
  onSaveSuccess,
  onClose,
  mode = 'smart',
  initialCameraActive = false,
  manualCapture = true,
  autoStart = true,
  preferredMode,
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(initialCameraActive || autoStart);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState<boolean>(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const { 
    detectImage,
    isDetecting
  } = useUnifiedDetection();

  const initializeCamera = async (videoElement: HTMLVideoElement): Promise<void> => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment', 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.srcObject = stream;
      await new Promise((resolve) => {
        videoElement.onloadedmetadata = () => {
          videoElement.play().then(resolve);
        };
      });
      
      console.log("Camera initialized successfully");
    } catch (error) {
      console.error("Error initializing camera:", error);
      throw error;
    }
  };

  const stopCamera = (): void => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      console.log("Camera stopped");
    }
  };

  const captureImageFromVideo = (videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): string => {
    const width = videoElement.videoWidth;
    const height = videoElement.videoHeight;
    
    canvasElement.width = width;
    canvasElement.height = height;
    
    const context = canvasElement.getContext('2d');
    if (context) {
      context.drawImage(videoElement, 0, 0, width, height);
      return canvasElement.toDataURL('image/jpeg', 0.8);
    }
    return '';
  };

  useEffect(() => {
    let mounted = true;

    const setupCamera = async () => {
      if (cameraActive && videoRef.current) {
        try {
          await initializeCamera(videoRef.current);
        } catch (error) {
          if (mounted) {
            toast({
              title: "Camera Error",
              description: "Could not access camera. Please check permissions.",
              variant: "destructive"
            });
            setCameraActive(false);
          }
        }
      }
    };

    if (cameraActive) {
      setupCamera();
    }

    return () => {
      mounted = false;
      if (cameraActive) {
        stopCamera();
      }
    };
  }, [cameraActive, toast]);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || isDetecting) return;

    try {
      setScanning(true);
      const imageData = captureImageFromVideo(videoRef.current, canvasRef.current);
      setCapturedImage(imageData);
      
      const result = await detectImage(imageData);
      setDetectionResult(result);
      setScanning(false);
      
      if (result && Object.keys(result).length > 0) {
        const detectionName = "Detected item";
        toast({
          title: "Detection Successful",
          description: `${detectionName} was identified.`,
        });
      } else {
        toast({
          description: "No clear detection. You can try again or use manual input.",
          variant: "default",
        });
      }
    } catch (error) {
      setScanning(false);
      toast({
        title: "Detection Error",
        description: "An error occurred while processing the image.",
        variant: "destructive"
      });
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      const result = {
        ...detectionResult,
        image: capturedImage,
        timestamp: new Date().toISOString(),
      };
      onCapture(result);
      
      if (onSaveSuccess) {
        onSaveSuccess(result);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setDetectionResult(null);
  };

  const handleStartCamera = () => {
    setCameraActive(true);
  };

  const handleCloseCamera = () => {
    stopCamera();
    setCameraActive(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      {cameraActive && !capturedImage && (
        <div className="relative w-full aspect-[3/4] max-w-md bg-black rounded-lg overflow-hidden">
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover" 
            autoPlay 
            playsInline 
            muted
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <div className="scan-animation"></div>
              <p className="text-white font-medium absolute bottom-10">Scanning...</p>
            </div>
          )}
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
            <Button 
              onClick={handleCapture} 
              disabled={scanning || isDetecting} 
              size="lg" 
              className="rounded-full h-16 w-16"
            >
              <Camera className="h-8 w-8" />
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full" 
            onClick={handleCloseCamera}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
      
      {capturedImage && (
        <div className="relative w-full max-w-md">
          <img src={capturedImage} alt="Captured" className="w-full rounded-lg" />
          <div className="mt-4 flex justify-center space-x-4">
            <Button variant="outline" onClick={handleRetake}>
              Retake
            </Button>
            <Button onClick={handleConfirm}>
              <Check className="mr-2 h-4 w-4" /> Confirm
            </Button>
          </div>
        </div>
      )}
      
      {!cameraActive && !capturedImage && (
        <Button onClick={handleStartCamera} className="mt-4">
          <Camera className="mr-2 h-5 w-5" /> Start Camera
        </Button>
      )}
    </div>
  );
};

export default UnifiedScannerCapture;
