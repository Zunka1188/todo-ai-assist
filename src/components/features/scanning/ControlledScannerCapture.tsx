import React, { useState, useRef } from 'react';
import { X, Camera, Check, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCamera } from '@/hooks/use-camera';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useDetection } from '@/utils/detectionEngine/hooks';
interface ControlledScannerCaptureProps {
  onClose: () => void;
  onSaveSuccess: (data: any) => void;
  preferredMode?: string;
  autoStart?: boolean;
}
const ControlledScannerCapture: React.FC<ControlledScannerCaptureProps> = ({
  onClose,
  onSaveSuccess,
  preferredMode,
  autoStart = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    toast
  } = useToast();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Use the detection hook
  const {
    detectImage,
    isDetecting
  } = useDetection();
  const {
    cameraActive,
    isInitializing,
    permissionDenied,
    startCamera,
    stopCamera,
    captureImage,
    requestCameraPermission
  } = useCamera({
    facingMode: 'environment',
    videoRef,
    canvasRef,
    autoStart: autoStart,
    onCameraReady: () => {
      setIsCameraActive(true);
    },
    onError: error => {
      toast({
        title: "Camera Error",
        description: error,
        variant: "destructive"
      });
    }
  });

  // Handle camera capture button
  const handleCapture = () => {
    // Create flash effect
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 300);
    const imageDataUrl = captureImage();
    if (imageDataUrl) {
      // Stop the camera and show preview
      stopCamera();
      setIsCameraActive(false);
      setCapturedImage(imageDataUrl);
    }
  };

  // Handle retake button
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Handle confirm button
  const handleConfirm = async () => {
    if (!capturedImage) return;
    setIsProcessing(true);
    try {
      // Try to detect content in the image
      const detectionResult = await detectImage(capturedImage);
      if (detectionResult) {
        // We have a detection result, pass it along with the image
        onSaveSuccess({
          ...detectionResult,
          imageData: capturedImage,
          detectionType: detectionResult.type,
          preferredMode: preferredMode
        });
      } else {
        // No detection, just pass the image
        onSaveSuccess({
          title: "Captured Image",
          content: capturedImage,
          imageData: capturedImage,
          preferredMode: preferredMode
        });
      }
    } catch (err) {
      console.error("Error processing image:", err);
      // Handle error but still save the image
      onSaveSuccess({
        title: "Captured Image",
        content: capturedImage,
        imageData: capturedImage,
        preferredMode: preferredMode
      });
    }
    setIsProcessing(false);
  };
  return <div className="relative flex flex-col h-full bg-black">
      {/* Flash effect */}
      {showFlash && <div className="absolute inset-0 bg-white z-20 opacity-80 animate-flash"></div>}
      
      {/* Close button */}
      <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10 bg-black/30 hover:bg-black/40 text-white rounded-full" onClick={onClose}>
        <X className="h-5 w-5" />
      </Button>
      
      {!capturedImage ? <div className="relative flex-1 overflow-hidden">
          {/* Camera view */}
          <div className={cn("w-full h-full", {
        "opacity-50": isInitializing
      })}>
            
          </div>
          
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Camera controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center items-center gap-4 bg-gradient-to-t from-black/80 to-transparent">
            {!isCameraActive && !isInitializing ? <Button variant="secondary" size="lg" className="px-6 py-6" onClick={startCamera} disabled={permissionDenied}>
                <Camera className="h-6 w-6 mr-2" />
                Start Camera
              </Button> : isInitializing ? <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p>Initializing camera...</p>
              </div> : <Button size="lg" onClick={handleCapture} className="rounded-full h-16 w-16 p-0 bg-white hover:bg-gray-200" disabled={!cameraActive}>
                <div className="rounded-full h-14 w-14 border-2 border-gray-300">
                  <span className="sr-only">Capture</span>
                </div>
              </Button>}
          </div>
          
          {/* Permission denied view */}
          {permissionDenied && <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="bg-background p-6 rounded-lg max-w-xs text-center">
                <h3 className="text-lg font-medium mb-2">Camera Access Required</h3>
                <p className="text-muted-foreground mb-4">
                  Please allow camera access in your browser settings to use this feature.
                </p>
                <Button onClick={requestCameraPermission}>
                  Request Camera Access
                </Button>
              </div>
            </div>}
        </div> :
    // Image preview
    <div className="relative flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center bg-black overflow-hidden">
            <img src={capturedImage} alt="Captured" className="max-w-full max-h-full object-contain" />
          </div>
          
          <div className="p-4 bg-background border-t flex items-center justify-between">
            {isProcessing || isDetecting ? <div className="w-full flex flex-col items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                <p className="text-center text-muted-foreground">Processing image...</p>
              </div> : <>
                <Button variant="outline" onClick={handleRetake} className="flex items-center gap-2">
                  <RotateCw className="h-4 w-4" />
                  Retake
                </Button>
                
                <Button onClick={handleConfirm} className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Confirm
                </Button>
              </>}
          </div>
        </div>}
    </div>;
};
export default ControlledScannerCapture;