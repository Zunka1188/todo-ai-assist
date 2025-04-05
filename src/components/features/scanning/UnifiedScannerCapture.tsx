
import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, RotateCw, Check, ScanBarcode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCamera } from '@/hooks/use-camera';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useUnifiedDetection } from '@/utils/detectionEngine/hooks/useUnifiedDetection';
import './camera-animations.css';

interface UnifiedScannerCaptureProps {
  onClose: () => void;
  onSaveSuccess: (data: any) => void;
  preferredMode?: string;
  barcodeOnly?: boolean;
  manualCapture?: boolean;
  autoStart?: boolean;
}

const UnifiedScannerCapture: React.FC<UnifiedScannerCaptureProps> = ({
  onClose,
  onSaveSuccess,
  preferredMode = 'smart',
  barcodeOnly = false,
  manualCapture = true,
  autoStart = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [scanActive, setScanActive] = useState(false);
  const { toast } = useToast();
  const [showFlash, setShowFlash] = useState(false);
  
  // Detection hooks
  const { detectImage, startContinuousScan, stopContinuousScan, reset: resetDetection } = useUnifiedDetection();
  
  // Camera hook with manual control
  const {
    videoRef: cameraVideoRef,
    canvasRef: cameraCanvasRef,
    cameraActive,
    isInitializing,
    permissionDenied,
    cameraError,
    startCamera,
    stopCamera,
    captureImage,
    requestCameraPermission
  } = useCamera({
    facingMode: 'environment',
    videoRef,
    canvasRef,
    autoStart: autoStart,
    onError: (error, isPermissionDenied) => {
      toast({
        title: isPermissionDenied ? "Camera Permission Denied" : "Camera Error",
        description: error,
        variant: "destructive",
      });
    },
    onCameraReady: () => {
      if (!manualCapture && !barcodeOnly) {
        // For automatic mode, capture immediately
        handleCapture();
      } else if (barcodeOnly) {
        // For barcode scanning, start continuous detection
        startScan();
      }
    }
  });
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      stopContinuousScan();
    };
  }, []);
  
  const startScan = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setScanActive(true);
    
    // Start continuous scanning for barcodes
    const cleanupScan = startContinuousScan(
      videoRef.current,
      canvasRef.current,
      (result) => {
        // Stop scanning once we get a result
        stopContinuousScan();
        setScanActive(false);
        setProcessing(false);
        
        // Create flash effect
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 300);
        
        console.log("Detected:", result);
        
        // Save data
        onSaveSuccess({
          ...result,
          detectionType: result.type,
          title: result.title || "Scanned Item",
        });
      },
      500 // Scan interval in ms
    );
  };
  
  const handleCapture = () => {
    if (!cameraActive) return;
    
    // Create flash effect
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 300);
    
    const imageData = captureImage();
    if (imageData) {
      setCapturedImage(imageData);
      stopCamera();
      
      if (!barcodeOnly) {
        setProcessing(true);
        
        // Process the captured image
        detectImage(imageData)
          .then((result) => {
            if (result) {
              console.log("Detection result:", result);
              // If this was a barcode scan or we need to process further, pass to save
              onSaveSuccess({
                ...result,
                detectionType: result.type,
                title: result.title || "Captured Item",
                imageData
              });
            } else {
              // Just save the image if no detection
              onSaveSuccess({
                title: "Captured Image",
                content: imageData,
                imageData
              });
            }
          })
          .catch((error) => {
            console.error("Error detecting image:", error);
            // Just save the image if detection fails
            onSaveSuccess({
              title: "Captured Image",
              content: imageData,
              imageData
            });
          })
          .finally(() => {
            setProcessing(false);
          });
      } else {
        // For barcode-only mode, we'll have already processed via continuous scan
        setProcessing(false);
      }
    }
  };
  
  const handleRetake = () => {
    setCapturedImage(null);
    resetDetection();
    stopContinuousScan();
    setScanActive(false);
    startCamera();
  };
  
  const handleConfirm = () => {
    if (capturedImage) {
      onSaveSuccess({
        title: "Captured Image",
        content: capturedImage,
        imageData: capturedImage
      });
    }
  };

  return (
    <div className="relative flex flex-col h-full">
      {/* Flash effect */}
      {showFlash && (
        <div className="absolute inset-0 bg-white z-20 opacity-80 animate-flash"></div>
      )}
      
      {/* Close button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2 z-10 bg-black/30 hover:bg-black/40 text-white rounded-full"
        onClick={onClose}
      >
        <X className="h-5 w-5" />
      </Button>
      
      {/* Camera view */}
      {!capturedImage && (
        <div className="relative flex-1 flex flex-col items-center justify-center bg-black">
          {permissionDenied ? (
            <div className="text-center p-4">
              <h3 className="text-lg font-medium text-white mb-2">Camera Access Required</h3>
              <p className="text-gray-300 mb-4">
                Please allow camera access in your browser settings to use the scanner.
              </p>
              <Button onClick={requestCameraPermission}>
                Request Camera Access
              </Button>
            </div>
          ) : (
            <>
              <div className={cn("relative w-full h-full flex items-center justify-center", {
                "opacity-50": isInitializing && !cameraActive
              })}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {barcodeOnly && scanActive && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-5/6 max-w-xs aspect-[4/3] border-2 border-primary rounded-lg">
                      <div className="barcode-scanner-line"></div>
                    </div>
                  </div>
                )}
                
                <canvas ref={canvasRef} className="hidden" />
              </div>
              
              {/* Camera controls */}
              <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center items-center gap-4 bg-gradient-to-t from-black/80 to-transparent">
                {!cameraActive && !isInitializing ? (
                  <Button 
                    size="lg" 
                    className="rounded-full px-6 py-6 bg-primary hover:bg-primary/90"
                    onClick={startCamera}
                  >
                    Start Camera
                  </Button>
                ) : isInitializing ? (
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p>Initializing camera...</p>
                  </div>
                ) : barcodeOnly ? (
                  <>
                    {!scanActive ? (
                      <Button 
                        size="lg" 
                        className="rounded-full px-6 py-6 bg-secondary hover:bg-secondary/90"
                        onClick={startScan}
                      >
                        <ScanBarcode className="h-6 w-6 mr-2" />
                        Start Scanning
                      </Button>
                    ) : (
                      <Button 
                        size="lg" 
                        variant="destructive" 
                        className="rounded-full px-6 py-6"
                        onClick={() => {
                          stopContinuousScan();
                          setScanActive(false);
                        }}
                      >
                        Stop Scanning
                      </Button>
                    )}
                  </>
                ) : (
                  <Button 
                    size="lg" 
                    onClick={handleCapture} 
                    className="rounded-full h-16 w-16 p-0 bg-white hover:bg-gray-200"
                    disabled={isInitializing || !cameraActive}
                  >
                    <div className="rounded-full h-14 w-14 border-2 border-gray-300">
                      <span className="sr-only">Capture</span>
                    </div>
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Preview captured image */}
      {capturedImage && (
        <div className="relative flex-1 flex flex-col">
          <div className="flex-1 bg-black flex items-center justify-center overflow-hidden">
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="max-w-full max-h-full object-contain" 
            />
          </div>
          
          <div className="p-4 bg-background border-t flex items-center justify-between">
            {processing ? (
              <div className="w-full flex flex-col items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                <p className="text-center text-muted-foreground">Processing image...</p>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleRetake}
                  className="flex items-center gap-2"
                >
                  <RotateCw className="h-4 w-4" />
                  Retake
                </Button>
                
                <Button
                  onClick={handleConfirm}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Confirm
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedScannerCapture;
