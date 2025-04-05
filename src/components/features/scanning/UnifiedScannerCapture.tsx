
import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { useUnifiedDetection } from '@/utils/detectionEngine/hooks/useUnifiedDetection';
import { DetectionResult } from '@/utils/detectionEngine/types';
import { 
  generateMockExtractedText, 
  generateTypeSpecificMockData, 
  generateDetectedObjects,
  navigateBasedOnFormData
} from './utils/scanningUtils';

interface UnifiedScannerCaptureProps {
  onClose: () => void;
  onSaveSuccess?: (data: any) => void;
  preferredMode?: string;
  barcodeOnly?: boolean;
}

const UnifiedScannerCapture: React.FC<UnifiedScannerCaptureProps> = ({ 
  onClose,
  onSaveSuccess,
  preferredMode,
  barcodeOnly = false
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [recognizedItem, setRecognizedItem] = useState<RecognizedItem | null>(null);
  const [progressValue, setProgressValue] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [preferredScanMode, setPreferredScanMode] = useState<RecognizedItemType | null>(
    preferredMode as RecognizedItemType || null
  );
  const [isSmartScanActive, setIsSmartScanActive] = useState<boolean>(!barcodeOnly);
  const [scanGuide, setScanGuide] = useState<string>("Scanning for products and barcodes...");

  const { 
    detectImage, 
    startContinuousScan, 
    stopContinuousScan,
    isDetecting,
    isBarcodeResult,
    result: detectionResult,
    status: detectionStatus
  } = useUnifiedDetection();

  const handleCameraReady = useCallback(() => {
    console.log("Camera is ready in UnifiedScannerCapture");
    setScanGuide(barcodeOnly 
      ? "Position barcode in the center of the frame" 
      : "Looking for products and barcodes...");
  }, [barcodeOnly]);

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
      console.log("Camera error in UnifiedScannerCapture:", error, isPermissionDenied);
      if (!isPermissionDenied) {
        toast({
          title: "Camera Issue",
          description: error,
          variant: "destructive",
        });
      }
    },
    onCameraReady: handleCameraReady
  });

  // Start continuous scan when camera is active
  useEffect(() => {
    if (cameraActive && videoRef.current && canvasRef.current && !capturedImage) {
      console.log("Starting continuous scan");
      const cleanupScan = startContinuousScan(
        videoRef.current,
        canvasRef.current,
        handleDetectionResult,
        barcodeOnly ? 200 : 500 // Faster scan rate for barcode-only mode
      );
      
      return cleanupScan;
    }
  }, [cameraActive, capturedImage]);

  // Handle detection result from continuous scanning
  const handleDetectionResult = (result: DetectionResult) => {
    console.log("Detection result:", result);
    const imageDataURL = canvasRef.current?.toDataURL('image/jpeg') || null;
    
    // If we got an image from the canvas
    if (imageDataURL) {
      setCapturedImage(imageDataURL);
      stopCamera();
      stopContinuousScan();
      processDetectionResult(imageDataURL, result);
    }
  };

  const handleManualImageCapture = () => {
    const imageDataURL = captureCameraImage();
    if (imageDataURL) {
      setCapturedImage(imageDataURL);
      stopCamera();
      stopContinuousScan();
      processImage(imageDataURL);
    } else {
      toast({
        title: "Capture Failed",
        description: "Failed to capture image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedImage(event.target.result as string);
          processImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "Image Selected",
        description: `Processing: ${file.name}`,
      });
    }
  };
  
  const retakeImage = () => {
    setCapturedImage(null);
    setRecognizedItem(null);
    setProcessing(false);
    setRetryCount(0);
    requestCameraPermission();
  };

  const retryCamera = () => {
    setRetryCount(prev => prev + 1);
    requestCameraPermission();
    
    toast({
      title: "Retrying Camera",
      description: "Attempting to initialize camera again...",
    });
  };
  
  const processImage = async (imageDataURL: string) => {
    setProcessing(true);
    setProgressValue(0);
    
    const interval = setInterval(() => {
      setProgressValue(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 80);

    try {
      // Use our unified detection hook to process the image
      const result = await detectImage(imageDataURL, {
        confidenceThreshold: 0.65,
        preferredType: barcodeOnly ? 'barcode' : undefined
      });
      
      clearInterval(interval);
      setProgressValue(100);
      
      if (result) {
        processDetectionResult(imageDataURL, result);
      } else {
        // Fallback to mock data when no detection
        generateMockDetectionResult(imageDataURL);
      }
    } catch (error) {
      console.error("Error processing image:", error);
      clearInterval(interval);
      setProgressValue(100);
      
      // Fallback to mock data on error
      generateMockDetectionResult(imageDataURL);
    }
  };
  
  const processDetectionResult = (imageDataURL: string, result: DetectionResult) => {
    let recognizedType: RecognizedItemType;
    let confidence = result.confidence;
    let mockData: any = {};
    
    // Map the detection result to our RecognizedItem format
    switch(result.type) {
      case 'barcode':
        recognizedType = 'product';
        mockData = {
          name: result.productInfo?.name || "Scanned Product",
          price: result.productInfo?.price || "$0.00",
          barcode: result.value,
          barcodeType: result.format,
          brand: result.productInfo?.brand || "Unknown Brand",
          category: result.productInfo?.category || "General",
          description: result.productInfo?.description || "Product scanned via barcode"
        };
        break;
        
      case 'product':
        recognizedType = 'product';
        mockData = {
          name: result.productInfo?.name || "Detected Product",
          price: result.productInfo?.price || "$0.00",
          brand: result.productInfo?.brand || "Unknown Brand",
          category: result.productInfo?.category || "General",
          description: result.productInfo?.description || "Product detected via image recognition"
        };
        break;
        
      case 'document':
        recognizedType = 'document';
        mockData = {
          title: "Scanned Document",
          type: "Document",
          content: "Document content detected"
        };
        break;
        
      default:
        // Default to product or preferred mode
        recognizedType = preferredScanMode || 'product';
        mockData = generateTypeSpecificMockData(recognizedType);
    }
    
    const mockExtractedText = generateMockExtractedText(recognizedType);
    const detectedObjects = generateDetectedObjects(recognizedType);
    
    const recognizedItem: RecognizedItem = {
      type: recognizedType,
      confidence,
      data: mockData,
      imageData: imageDataURL,
      extractedText: mockExtractedText,
      detectedObjects,
      // Add detection-specific info
      detectionSource: result.type
    };
    
    setRecognizedItem(recognizedItem);
    setProcessing(false);
    
    toast({
      title: "Analysis Complete",
      description: `Detected: ${recognizedItem.type} (${Math.round(recognizedItem.confidence * 100)}% confidence)`,
    });
  };
  
  // Fallback to generate mock detection result when no result from detection engine
  const generateMockDetectionResult = (imageDataURL: string) => {
    let determinedType: RecognizedItemType;
    
    if (preferredScanMode) {
      determinedType = preferredScanMode;
    } else if (barcodeOnly) {
      determinedType = 'product'; // For barcode-only mode, default to product
    } else {
      // Default type distribution with random selection
      const types: Array<RecognizedItemType> = ['product', 'receipt', 'document', 'unknown'];
      const typeWeights = [0.5, 0.3, 0.15, 0.05]; // Higher weight for product detection
      
      const random = Math.random();
      let cumulativeWeight = 0;
      let selectedIndex = types.length - 1;
      
      for (let i = 0; i < typeWeights.length; i++) {
        cumulativeWeight += typeWeights[i];
        if (random < cumulativeWeight) {
          selectedIndex = i;
          break;
        }
      }
      
      determinedType = types[selectedIndex];
    }
    
    const confidence = 0.75 + (Math.random() * 0.2);
    const mockData = generateTypeSpecificMockData(determinedType);
    const mockExtractedText = generateMockExtractedText(determinedType);
    const detectedObjects = generateDetectedObjects(determinedType);
    
    const result: RecognizedItem = {
      type: determinedType,
      confidence,
      data: mockData,
      imageData: imageDataURL,
      extractedText: mockExtractedText,
      detectedObjects,
      detectionSource: 'mock'
    };
    
    setRecognizedItem(result);
    setProcessing(false);
    
    toast({
      title: "Analysis Complete",
      description: `Detected: ${result.type} (${Math.round(result.confidence * 100)}% confidence)`,
    });
  };
  
  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
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
            savedAt: new Date().toISOString(),
            detectionSource: originalItem.detectionSource
          };
          onSaveSuccess(savedData);
        }
        
        setTimeout(() => {
          navigateBasedOnFormData(formData, navigate);
        }, 500);
      }
    }, 100);
  };
  
  const toggleScanMode = () => {
    setIsSmartScanActive(prev => !prev);
    setScanGuide(isSmartScanActive 
      ? "Position barcode in the center of the frame"
      : "Looking for products and barcodes...");
    
    toast({
      title: isSmartScanActive ? "Barcode Mode" : "Smart Scan Mode",
      description: isSmartScanActive 
        ? "Scanning for barcodes only"
        : "Scanning for products and barcodes",
    });
  };
  
  const openBrowserSettings = () => {
    toast({
      title: "Permission Required",
      description: "Please open your browser settings and allow camera access for this site.",
    });
  };
  
  useEffect(() => {
    if (!preferredMode) {
      sessionStorage.removeItem('preferredScanMode');
    }
    
    console.log("UnifiedScannerCapture mounted, initializing camera...");
    
    // Allow time for the DOM to render before requesting camera
    const timer = setTimeout(() => {
      if (videoRef.current) {
        console.log("Video element is ready, requesting camera permission");
        requestCameraPermission();
      } else {
        console.error("Video element still not available after timeout");
      }
    }, 300);
    
    return () => {
      clearTimeout(timer);
      stopCamera();
      stopContinuousScan();
    };
  }, []);
  
  // Get title based on current state
  const getTitle = () => {
    if (capturedImage) {
      if (processing) return "Analyzing Image";
      if (recognizedItem) return "Review & Save";
      return "Smart Scan";
    }
    
    if (barcodeOnly) return "Barcode Scanner";
    if (preferredScanMode) {
      return (preferredScanMode.charAt(0).toUpperCase() + preferredScanMode.slice(1)) + " Scanner";
    }
    return "Smart Scanner";
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
        {!capturedImage && !permissionDenied && !cameraError && (
          <Button
            variant="outline"
            size="sm"
            onClick={toggleScanMode}
            className="text-xs px-2 py-1 h-8"
            disabled={barcodeOnly}
          >
            {isSmartScanActive ? 'Barcode Only' : 'Smart Scan'}
          </Button>
        )}
      </div>
      
      <div className="relative bg-black rounded-lg overflow-hidden aspect-[4/3] flex items-center justify-center">
        {/* Video element always rendered to maintain reference */}
        <video 
          id="unified-scanner-video"
          ref={videoRef}
          autoPlay 
          playsInline
          muted
          className={cameraActive && !capturedImage ? "w-full h-full object-cover" : "hidden"}
        />
        
        {cameraActive && !capturedImage && (
          <>
            <div className="absolute inset-0 pointer-events-none">
              {/* Scanning guides */}
              {isSmartScanActive || !barcodeOnly ? (
                <div className="w-full h-full border-2 border-dashed border-white/40 rounded-lg"></div>
              ) : (
                <>
                  {/* Barcode frame guide */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 h-1/3 border-2 border-white rounded flex items-center justify-center">
                    <div className="absolute left-0 right-0 h-0.5 bg-white/50"></div>
                    <div className="text-white/70 text-xs absolute -bottom-6">Center barcode here</div>
                  </div>
                </>
              )}
              <div className={`absolute left-0 right-0 h-1 bg-todo-purple opacity-50 ${isSmartScanActive ? 'animate-scan' : 'animate-scan-fast'}`}></div>
            </div>
            
            {/* Mode indicator */}
            <div className="absolute top-0 left-0 p-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-todo-purple text-white">
                {barcodeOnly ? (
                  <>
                    <Scan className="w-3 h-3 mr-1" />
                    Barcode Mode
                  </>
                ) : isSmartScanActive ? (
                  <>
                    <Camera className="w-3 h-3 mr-1" />
                    Smart Scan
                  </>
                ) : (
                  <>
                    <Scan className="w-3 h-3 mr-1" />
                    Barcode Only
                  </>
                )}
              </span>
            </div>
            
            {/* Scan guide */}
            <div className="absolute bottom-12 left-0 right-0 flex justify-center">
              <span className="px-3 py-1 rounded bg-black/70 text-white text-xs">
                {scanGuide}
              </span>
            </div>
            
            {/* Capture button */}
            <Button
              onClick={handleManualImageCapture}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-black hover:bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full border-2 border-black"></div>
            </Button>
          </>
        )}
        
        {capturedImage && (
          <img 
            src={capturedImage} 
            alt="Captured" 
            className="w-full h-full object-contain"
          />
        )}
        
        {permissionDenied && (
          <div className="text-white text-center p-4">
            <CameraOff className="mx-auto h-12 w-12 mb-2 text-red-500" />
            <p className="text-red-300 mb-2">Camera Permission Denied</p>
            <p className="text-sm text-gray-300 mb-4">
              This app needs camera access to scan items. Please allow camera access in your browser settings.
            </p>
            <div className="flex flex-col space-y-2">
              <Button onClick={requestCameraPermission} variant="outline" className="bg-white/10 hover:bg-white/20">
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
        
        {cameraError && !capturedImage && !permissionDenied && (
          <div className="text-white text-center p-4">
            <CameraOff className="mx-auto h-12 w-12 mb-2 text-red-500" />
            <p className="text-red-300 mb-2">Camera Error</p>
            <p className="text-sm text-gray-300 mb-4">{cameraError}</p>
            <div className="flex flex-col gap-2">
              {retryCount < 2 && (
                <Button onClick={retryCamera} variant="outline" className="bg-white/10 hover:bg-white/20">
                  Try Again
                </Button>
              )}
              <Button onClick={openFilePicker} variant="outline" className="bg-white/10 hover:bg-white/20">
                <Image className="mr-2 h-4 w-4" />
                Upload Image Instead
              </Button>
            </div>
          </div>
        )}
        
        {isInitializing && !capturedImage && (
          <div className="text-white text-center p-4">
            <Camera className="mx-auto h-12 w-12 mb-2 animate-pulse" />
            <p>Initializing camera...</p>
            <p className="text-xs text-gray-400 mt-2">This may take a moment</p>
          </div>
        )}
        
        {processing && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4">
            <Loader2 className="h-10 w-10 text-white animate-spin mb-4" />
            <p className="text-white mb-2">Analyzing image...</p>
            <div className="w-full max-w-xs">
              <Progress value={progressValue} className="h-2 bg-gray-700" />
            </div>
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
          <div className="mt-2">
            <p className="text-sm font-medium">Possible solutions:</p>
            <ul className="list-disc list-inside text-sm mt-1 space-y-1">
              <li>Ensure your device has a working camera</li>
              <li>Check that no other application is using your camera</li>
              <li>Try refreshing the page</li>
              <li>If on mobile, try using your phone's native camera app and upload the image</li>
            </ul>
          </div>
        </Alert>
      )}
      
      {capturedImage && !processing && (
        <div className="space-y-4">
          <DataRecognition
            recognizedItem={recognizedItem}
            isProcessing={isSaving}
            onSave={handleSaveItem}
            onCancel={retakeImage}
          />
        </div>
      )}
      
      {!capturedImage && !permissionDenied && !cameraError && (
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            onClick={openFilePicker}
            className="flex items-center"
          >
            <Image className="h-4 w-4 mr-2" />
            Upload from Gallery
          </Button>
        </div>
      )}
    </div>
  );
};

export default UnifiedScannerCapture;
