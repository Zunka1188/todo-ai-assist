import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, CameraOff, Settings, Image, Loader2, AlertCircle, Scan, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import DataRecognition, { RecognizedItem, RecognizedItemType } from './DataRecognition';
import './camera-animations.css';
import { useCamera } from '@/hooks/use-camera';
import { BarcodeResult } from '@/utils/detectionEngine/types';
import { useBarcodeScan } from '@/utils/detectionEngine/hooks';

interface ControlledScannerCaptureProps {
  onClose: () => void;
  onSaveSuccess?: (data: any) => void;
  preferredMode?: string;
}

const ControlledScannerCapture: React.FC<ControlledScannerCaptureProps> = ({
  onClose,
  onSaveSuccess,
  preferredMode
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // State for camera and scanning control
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [recognizedItem, setRecognizedItem] = useState<RecognizedItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [scanResult, setScanResult] = useState<BarcodeResult | null>(null);
  
  // Camera hook with autoStart explicitly set to false
  const { 
    cameraActive,
    isInitializing,
    permissionDenied,
    cameraError,
    startCamera,
    stopCamera,
    captureImage: captureCameraImage,
    requestCameraPermission
  } = useCamera({
    videoRef,
    canvasRef,
    autoStart: false,
    onError: (error, isPermissionDenied) => {
      console.log("Camera error in ControlledScannerCapture:", error, isPermissionDenied);
      if (!isPermissionDenied) {
        toast({
          title: "Camera Issue",
          description: error,
          variant: "destructive",
        });
      }
    }
  });
  
  // Barcode scanner hook
  const { scanBarcode, isScanning: isBarcodeScanning } = useBarcodeScan();
  
  // Function to manually start the camera
  const handleStartCamera = () => {
    requestCameraPermission();
    setIsCameraActive(true);
    toast({
      title: "Camera Activated",
      description: "Camera is now active. Press 'Capture' to take a picture.",
    });
  };
  
  // Function to manually capture an image
  const handleCaptureImage = () => {
    const imageDataURL = captureCameraImage();
    if (imageDataURL) {
      setCapturedImage(imageDataURL);
      setIsCameraActive(false);
      stopCamera();
      
      toast({
        title: "Image Captured",
        description: "Press 'Start Scanning' to scan the image for barcodes.",
      });
    } else {
      toast({
        title: "Capture Failed",
        description: "Failed to capture image. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Function to start scanning the captured image
  const handleStartScanning = async () => {
    if (!capturedImage) return;
    
    setIsScanning(true);
    setScanProgress(0);
    
    // Progress indicator
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);
    
    try {
      // Scan for barcode
      const result = await scanBarcode(capturedImage, {
        confidenceThreshold: 0.7
      });
      
      clearInterval(interval);
      setScanProgress(100);
      setScanResult(result);
      
      if (result) {
        // Create a recognized item for barcode
        const recognizedItemData: RecognizedItem = {
          type: 'product',
          confidence: result.confidence,
          data: {
            name: result.productInfo?.name || "Scanned Product",
            price: result.productInfo?.price || "$0.00",
            barcode: result.value,
            barcodeType: result.format,
            brand: result.productInfo?.brand || "Unknown Brand",
            category: result.productInfo?.category || "General",
            description: result.productInfo?.description || "Product scanned via barcode"
          },
          imageData: capturedImage,
          extractedText: `Barcode: ${result.value}`,
          detectedObjects: []
        };
        
        setRecognizedItem(recognizedItemData);
        
        toast({
          title: "Barcode Detected",
          description: `Found ${result.format} barcode: ${result.value.substring(0, 10)}${result.value.length > 10 ? '...' : ''}`,
        });
      } else {
        toast({
          title: "No Barcode Found",
          description: "No valid barcode was detected in the image. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error scanning barcode:", error);
      clearInterval(interval);
      setScanProgress(100);
      
      toast({
        title: "Scan Error",
        description: "An error occurred while scanning. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsScanning(false);
  };
  
  // Function to stop scanning
  const handleStopScanning = () => {
    setIsScanning(false);
    setScanProgress(0);
    
    toast({
      title: "Scan Stopped",
      description: "Scanning has been stopped.",
    });
  };
  
  // Function to restart the camera and retake picture
  const handleRetake = () => {
    setCapturedImage(null);
    setRecognizedItem(null);
    setScanResult(null);
    setIsScanning(false);
    setScanProgress(0);
    setIsCameraActive(false);
  };
  
  // Function to upload a file instead
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedImage(event.target.result as string);
          setIsCameraActive(false);
          
          toast({
            title: "Image Selected",
            description: `Press 'Start Scanning' to scan the image.`,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Function to open file picker
  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Function to save the scanned result
  const handleSaveItem = (formData: any, originalItem: RecognizedItem) => {
    setIsSaving(true);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        clearInterval(interval);
        
        let savedLocation = "";
        if (formData.addToShoppingList) savedLocation = "Shopping List";
        else if (formData.addToCalendar) savedLocation = "Calendar";
        else if (formData.saveToSpending) savedLocation = "Receipts & Expenses";
        else if (formData.saveToDocuments) savedLocation = "Documents";
        else savedLocation = "your collection";
        
        toast({
          title: "Item Saved Successfully",
          description: `"${formData.title}" has been saved to ${savedLocation}.`,
          variant: "default",
        });
        
        setIsSaving(false);
        
        if (onSaveSuccess) {
          const savedData = {
            ...formData,
            originalType: originalItem.type,
            imageData: formData.keepImage ? originalItem.imageData : null,
            savedAt: new Date().toISOString()
          };
          onSaveSuccess(savedData);
        }
        
        setTimeout(() => {
          // Navigate based on the form data
          if (formData.addToShoppingList) {
            navigate('/shopping');
          } else if (formData.addToCalendar) {
            navigate('/calendar');
          } else if (formData.saveToSpending) {
            navigate('/spending');
          } else if (formData.saveToDocuments) {
            navigate('/documents');
          } else {
            onClose();
          }
        }, 500);
      }
    }, 100);
  };
  
  // Function to guide user to browser settings
  const openBrowserSettings = () => {
    toast({
      title: "Permission Required",
      description: "Please open your browser settings and allow camera access for this site.",
    });
  };

  // Get title based on current state
  const getTitle = () => {
    if (capturedImage) {
      if (isScanning) return "Scanning Barcode";
      if (recognizedItem) return "Barcode Detected";
      return "Start Scanning";
    }
    return isCameraActive ? "Take Picture" : "Scanner";
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="mr-2"
        >
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-medium">{getTitle()}</h2>
        <div className="w-8" />
      </div>
      
      <div className="relative bg-black rounded-lg overflow-hidden aspect-[4/3] flex items-center justify-center">
        {/* Camera view */}
        {isCameraActive && cameraActive && !capturedImage && (
          <>
            <video 
              id="controlled-scanner-video"
              ref={videoRef}
              autoPlay 
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 h-1/3 border-2 border-white rounded flex items-center justify-center">
                <div className="absolute left-0 right-0 h-0.5 bg-white/50"></div>
                <div className="text-white/70 text-xs absolute -bottom-6">Center the barcode here</div>
              </div>
            </div>
            
            {/* Capture button */}
            <Button
              onClick={handleCaptureImage}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-black hover:bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full border-2 border-black"></div>
            </Button>
          </>
        )}
        
        {/* Captured image */}
        {capturedImage && (
          <img 
            src={capturedImage} 
            alt="Captured" 
            className="w-full h-full object-contain"
          />
        )}
        
        {/* Camera not active view */}
        {!isCameraActive && !capturedImage && !permissionDenied && !cameraError && (
          <div className="text-white text-center p-4">
            <Camera className="mx-auto h-12 w-12 mb-4" />
            <p className="mb-2">Camera is not active</p>
            <p className="text-sm text-gray-300 mb-6">
              Press the button below to start the camera
            </p>
            <Button 
              onClick={handleStartCamera}
              className="bg-todo-purple hover:bg-todo-purple/90 text-white"
            >
              <Camera className="h-4 w-4 mr-2" />
              Start Camera
            </Button>
            <div className="mt-4">
              <span className="text-xs text-gray-400">or</span>
            </div>
            <Button 
              variant="outline" 
              onClick={openFilePicker}
              className="mt-4 bg-transparent text-white border-white hover:bg-white/10"
            >
              <Image className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
          </div>
        )}
        
        {/* Permission denied view */}
        {permissionDenied && (
          <div className="text-white text-center p-4">
            <CameraOff className="mx-auto h-12 w-12 mb-2 text-red-500" />
            <p className="text-red-300 mb-2">Camera Permission Denied</p>
            <p className="text-sm text-gray-300 mb-4">
              This app needs camera access to scan items. Please allow camera access in your browser settings.
            </p>
            <div className="flex flex-col space-y-2">
              <Button onClick={handleStartCamera} variant="outline" className="bg-white/10 hover:bg-white/20">
                Try Again
              </Button>
              <Button onClick={openBrowserSettings} variant="outline" className="bg-white/10 hover:bg-white/20">
                <Settings className="mr-2 h-4 w-4" />
                Open Settings Guide
              </Button>
              <Button onClick={openFilePicker} variant="outline" className="bg-white/10 hover:bg-white/20">
                <Image className="mr-2 h-4 w-4" />
                Upload Image Instead
              </Button>
            </div>
          </div>
        )}
        
        {/* Camera error view */}
        {cameraError && !capturedImage && !permissionDenied && (
          <div className="text-white text-center p-4">
            <CameraOff className="mx-auto h-12 w-12 mb-2 text-red-500" />
            <p className="text-red-300 mb-2">Camera Error</p>
            <p className="text-sm text-gray-300 mb-4">{cameraError}</p>
            <div className="flex flex-col gap-2">
              <Button onClick={handleStartCamera} variant="outline" className="bg-white/10 hover:bg-white/20">
                Try Again
              </Button>
              <Button onClick={openFilePicker} variant="outline" className="bg-white/10 hover:bg-white/20">
                <Image className="mr-2 h-4 w-4" />
                Upload Image Instead
              </Button>
            </div>
          </div>
        )}
        
        {/* Camera initializing view */}
        {isInitializing && isCameraActive && (
          <div className="text-white text-center p-4">
            <Camera className="mx-auto h-12 w-12 mb-2 animate-pulse" />
            <p>Initializing camera...</p>
            <p className="text-xs text-gray-400 mt-2">This may take a moment</p>
          </div>
        )}
        
        {/* Scanning overlay */}
        {isScanning && capturedImage && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4">
            <Loader2 className="h-10 w-10 text-white animate-spin mb-4" />
            <p className="text-white mb-2">Scanning for barcode...</p>
            <div className="w-full max-w-xs mb-4">
              <Progress value={scanProgress} className="h-2 bg-gray-700" />
            </div>
            <Button 
              variant="outline" 
              onClick={handleStopScanning}
              className="bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="h-4 w-4 mr-2" />
              Stop Scanning
            </Button>
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
        <input 
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileUpload}
        />
      </div>
      
      {/* Error alerts */}
      {(cameraError || permissionDenied) && !capturedImage && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {permissionDenied ? "Camera Permission Denied" : "Camera Access Error"}
          </AlertTitle>
          <AlertDescription>
            {permissionDenied 
              ? "This application needs camera access to function properly. Please update your browser settings to allow camera access for this site."
              : cameraError || "Could not access camera. Please check your device and try again."
            }
          </AlertDescription>
        </Alert>
      )}
      
      {/* Controls for captured image */}
      {capturedImage && !isScanning && !recognizedItem && (
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-primary/10">
                <Scan className="h-5 w-5 text-primary" />
              </div>
              <div className="ml-3">
                <h3 className="font-medium">Image Captured</h3>
                <p className="text-sm text-muted-foreground">
                  Ready to scan for barcodes
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={handleStartScanning}
              className="flex-1 bg-todo-purple hover:bg-todo-purple/90"
            >
              <Scan className="h-4 w-4 mr-2" />
              Start Scanning
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRetake}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              Retake
            </Button>
          </div>
        </div>
      )}
      
      {/* Display scan result */}
      {capturedImage && recognizedItem && !isScanning && (
        <div className="space-y-4">
          <DataRecognition
            recognizedItem={recognizedItem}
            isProcessing={isSaving}
            onSave={handleSaveItem}
            onCancel={handleRetake}
          />
        </div>
      )}
    </div>
  );
};

export default ControlledScannerCapture;
