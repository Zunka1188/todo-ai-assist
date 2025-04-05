import React, { useState, useRef, useEffect } from 'react';
import { Camera, Scan, X, Check } from 'lucide-react';
import { useUnifiedDetection } from '@/utils/detectionEngine/hooks/useUnifiedDetection';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import './camera-animations.css';
import { DetectionResult } from '@/utils/detectionEngine/types';

interface UnifiedScannerCaptureProps {
  onCapture: (result: any) => void;
  onClose?: () => void;
  mode?: 'smart' | 'barcode';
  initialCameraActive?: boolean;
}

const UnifiedScannerCapture: React.FC<UnifiedScannerCaptureProps> = ({
  onCapture,
  onClose,
  mode = 'smart',
  initialCameraActive = false,
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(initialCameraActive);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState<boolean>(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const { 
    initializeCamera, 
    stopCamera,
    captureImageFromVideo,
    detectInImage,
    isBusy,
  } = useUnifiedDetection();

  // Handle camera initialization
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
  }, [cameraActive, initializeCamera, stopCamera, toast]);

  // Handle capture and detection
  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || isBusy) return;

    try {
      setScanning(true);
      const imageData = captureImageFromVideo(videoRef.current, canvasRef.current);
      setCapturedImage(imageData);
      
      // Perform detection on the captured image
      const result = await detectInImage(imageData, mode);
      setDetectionResult(result);
      setScanning(false);
      
      // Display detection results if found
      if (result && Object.keys(result).length > 0) {
        const detectionName = result.name || result.text || "Detected item";
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

  const handleBarcodeScan = async () => {
    if (!videoRef.current || !canvasRef.current || isBusy) return;
    
    try {
      setScanning(true);
      // Keep scanning until a barcode is found or canceled
      const scanInterval = setInterval(async () => {
        if (!videoRef.current || !canvasRef.current) {
          clearInterval(scanInterval);
          return;
        }
        
        const imageData = captureImageFromVideo(videoRef.current, canvasRef.current);
        const result = await detectInImage(imageData, 'barcode');
        
        if (result && result.barcode) {
          clearInterval(scanInterval);
          setCapturedImage(imageData);
          setDetectionResult(result);
          setScanning(false);
          
          toast({
            title: "Barcode Found",
            description: `Barcode ${result.barcode} detected.`,
          });
        }
      }, 1000);
      
      // Clear interval after 20 seconds if no barcode found
      setTimeout(() => {
        if (scanning) {
          clearInterval(scanInterval);
          setScanning(false);
          toast({
            description: "No barcode found. Please try again or enter details manually.",
            variant: "default",
          });
        }
      }, 20000);
      
      // Store interval ID for cleanup
      return () => clearInterval(scanInterval);
    } catch (error) {
      setScanning(false);
      toast({
        title: "Scan Error",
        description: "An error occurred while scanning for barcodes.",
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
      {/* Video for camera feed */}
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
          
          {/* Scanning overlay */}
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <div className="scan-animation"></div>
              <p className="text-white font-medium absolute bottom-10">Scanning...</p>
            </div>
          )}
          
          {/* Camera controls */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
            {mode === 'smart' ? (
              <Button 
                onClick={handleCapture} 
                disabled={scanning || isBusy} 
                size="lg" 
                className="rounded-full h-16 w-16"
              >
                <Camera className="h-8 w-8" />
              </Button>
            ) : (
              <Button 
                onClick={handleBarcodeScan} 
                disabled={scanning || isBusy} 
                size="lg" 
                className="rounded-full h-16 w-16"
              >
                <Scan className="h-8 w-8" />
              </Button>
            )}
          </div>
          
          {/* Close button */}
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
      
      {/* Captured image preview */}
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
      
      {/* Start camera button */}
      {!cameraActive && !capturedImage && (
        <Button onClick={handleStartCamera} className="mt-4">
          {mode === 'smart' ? (
            <>
              <Camera className="mr-2 h-5 w-5" /> Start Camera
            </>
          ) : (
            <>
              <Scan className="mr-2 h-5 w-5" /> Scan Barcode
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default UnifiedScannerCapture;
