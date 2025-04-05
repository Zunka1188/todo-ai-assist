import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Calendar, List, FileText, Receipt, Loader2, AlertCircle, CameraOff, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useCamera } from '@/hooks/use-camera';

interface CameraCaptureWithAIProps {
  onClose: () => void;
}

type DetectionResult = {
  type: 'invitation' | 'receipt' | 'product' | 'document' | 'unknown';
  confidence: number;
  data?: Record<string, any>;
}

const CameraCaptureWithAI: React.FC<CameraCaptureWithAIProps> = ({ onClose }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  
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
    autoStart: false,  // We'll call requestCameraPermission manually
    onError: (error, isPermissionDenied) => {
      console.log("Camera error in CameraCaptureWithAI:", error, isPermissionDenied);
      if (!isPermissionDenied) {
        toast({
          title: "Camera Issue",
          description: error,
          variant: "destructive",
        });
      }
    }
  });
  
  const captureImage = () => {
    const imageDataURL = captureCameraImage();
    if (imageDataURL) {
      setCapturedImage(imageDataURL);
      stopCamera();
      processImage(imageDataURL);
    }
  };
  
  const retakeImage = () => {
    setCapturedImage(null);
    setDetectionResult(null);
    requestCameraPermission();
  };
  
  const processImage = async (imageDataURL: string) => {
    setProcessing(true);
    
    // In a real app, this would send the image to an AI service for analysis
    // For this demo, we'll simulate AI detection with random results
    setTimeout(() => {
      // Simulate AI processing
      const types: Array<DetectionResult['type']> = ['invitation', 'receipt', 'product', 'document', 'unknown'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const confidence = 0.7 + (Math.random() * 0.25); // Random confidence between 70% and 95%
      
      let mockData = {};
      
      // Create realistic mock data based on the type
      if (randomType === 'invitation') {
        mockData = {
          title: "Team Offsite Meeting",
          date: "2025-05-15",
          time: "10:00 AM",
          location: "Conference Room A, Building 2",
          organizer: "Sarah Johnson"
        };
      } else if (randomType === 'receipt') {
        mockData = {
          store: "Green Grocers",
          date: "2025-04-03",
          total: "$67.89",
          items: [
            { name: "Apples", price: "$4.99" },
            { name: "Bread", price: "$3.50" },
            { name: "Milk", price: "$2.99" }
          ]
        };
      } else if (randomType === 'product') {
        mockData = {
          name: "Organic Avocados",
          price: "$5.99",
          category: "Groceries"
        };
      }
      
      const result: DetectionResult = {
        type: randomType,
        confidence,
        data: mockData
      };
      
      setDetectionResult(result);
      setProcessing(false);
      
      toast({
        title: "Analysis Complete",
        description: `Detected: ${result.type} (${Math.round(result.confidence * 100)}% confidence)`,
      });
    }, 1500);
  };
  
  const openBrowserSettings = () => {
    toast({
      title: "Permission Required",
      description: "Please open your browser settings and allow camera access for this site.",
    });
  };
  
  useEffect(() => {
    console.log("Component mounted, initializing camera");
    
    // Delay camera initialization slightly to ensure DOM is ready
    const timer = setTimeout(() => {
      if (videoRef.current) {
        console.log("Video element is ready, requesting camera permission");
        requestCameraPermission();
      } else {
        console.error("Video element not available after timeout");
      }
    }, 100);
    
    // Cleanup function to stop camera when component unmounts
    return () => {
      clearTimeout(timer);
      console.log("Component unmounting, stopping camera");
      stopCamera();
    };
  }, []);
  
  const handleSuggestedAction = () => {
    if (!detectionResult) return;
    
    switch (detectionResult.type) {
      case 'invitation':
        navigate('/calendar');
        break;
      case 'receipt':
        navigate('/spending');
        break;
      case 'product':
        navigate('/shopping');
        break;
      case 'document':
        navigate('/documents');
        break;
      default:
        toast({
          title: "No specific action",
          description: "Could not determine appropriate action for this item.",
        });
    }
  };
  
  const getActionText = () => {
    if (!detectionResult) return "";
    
    switch (detectionResult.type) {
      case 'invitation':
        return "Add to Calendar";
      case 'receipt':
        return "Save to Receipts";
      case 'product':
        return "Add to Shopping List";
      case 'document':
        return "Save to Documents";
      default:
        return "Save Item";
    }
  };
  
  const getActionIcon = () => {
    if (!detectionResult) return null;
    
    switch (detectionResult.type) {
      case 'invitation':
        return <Calendar className="mr-2 h-4 w-4" />;
      case 'receipt':
        return <Receipt className="mr-2 h-4 w-4" />;
      case 'product':
        return <List className="mr-2 h-4 w-4" />;
      case 'document':
        return <FileText className="mr-2 h-4 w-4" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="mr-2"
        >
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-medium">Smart Scan</h2>
        <div className="w-8" />
      </div>
      
      <div className="relative bg-black rounded-lg overflow-hidden aspect-[4/3] flex items-center justify-center">
        {cameraActive && !capturedImage ? (
          <>
            <video 
              ref={videoRef}
              autoPlay 
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <Button
              onClick={captureImage}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-black hover:bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full border-2 border-black"></div>
            </Button>
          </>
        ) : capturedImage ? (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
        ) : permissionDenied ? (
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
            </div>
          </div>
        ) : cameraError ? (
          <div className="text-white text-center p-4">
            <CameraOff className="mx-auto h-12 w-12 mb-2 text-red-500" />
            <p className="text-red-300 mb-2">Camera Error</p>
            <p className="text-sm text-gray-300 mb-4">{cameraError}</p>
            <Button onClick={requestCameraPermission} variant="outline" className="bg-white/10 hover:bg-white/20">
              Try Again
            </Button>
          </div>
        ) : isInitializing ? (
          <div className="text-white text-center p-4">
            <Camera className="mx-auto h-12 w-12 mb-2 animate-pulse" />
            <p>Initializing camera...</p>
            <p className="text-xs text-gray-400 mt-2">This may take a moment</p>
          </div>
        ) : (
          <div className="text-white text-center p-4">
            <Camera className="mx-auto h-12 w-12 mb-2 animate-pulse" />
            <p>Initializing camera...</p>
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
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
        </Alert>
      )}
      
      {capturedImage && (
        <div className="space-y-4">
          {processing ? (
            <div className="flex flex-col items-center justify-center p-6">
              <Loader2 className="h-8 w-8 text-todo-purple animate-spin mb-2" />
              <p className="text-center text-muted-foreground">
                Analyzing image with AI...
              </p>
            </div>
          ) : detectionResult ? (
            <div className="bg-white rounded-lg border p-4 space-y-3">
              <div className="flex items-center">
                <div className={cn(
                  "mr-3 p-2 rounded-full",
                  detectionResult.type === 'invitation' && "bg-todo-purple/10",
                  detectionResult.type === 'receipt' && "bg-green-100",
                  detectionResult.type === 'product' && "bg-blue-100",
                  detectionResult.type === 'document' && "bg-amber-100",
                  detectionResult.type === 'unknown' && "bg-gray-100",
                )}>
                  {detectionResult.type === 'invitation' && <Calendar className="h-5 w-5 text-todo-purple" />}
                  {detectionResult.type === 'receipt' && <Receipt className="h-5 w-5 text-green-600" />}
                  {detectionResult.type === 'product' && <List className="h-5 w-5 text-blue-600" />}
                  {detectionResult.type === 'document' && <FileText className="h-5 w-5 text-amber-600" />}
                  {detectionResult.type === 'unknown' && <FileText className="h-5 w-5 text-gray-600" />}
                </div>
                <div>
                  <h3 className="font-medium">Detected: {detectionResult.type.charAt(0).toUpperCase() + detectionResult.type.slice(1)}</h3>
                  <p className="text-sm text-muted-foreground">
                    Confidence: {Math.round(detectionResult.confidence * 100)}%
                  </p>
                </div>
              </div>
              
              {detectionResult.data && Object.keys(detectionResult.data).length > 0 && (
                <div className="text-sm bg-gray-50 rounded-md p-3 space-y-1">
                  {Object.entries(detectionResult.data).map(([key, value]) => {
                    // Handle nested objects like items array in receipt
                    if (Array.isArray(value)) {
                      return (
                        <div key={key}>
                          <span className="font-medium">{key}: </span>
                          <span>{value.length} items</span>
                        </div>
                      );
                    }
                    
                    return (
                      <div key={key}>
                        <span className="font-medium">{key}: </span>
                        <span>{value as string}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={handleSuggestedAction}
                  className="flex-1 bg-todo-purple hover:bg-todo-purple/90"
                >
                  {getActionIcon()}
                  {getActionText()}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={retakeImage}
                  className="flex-1"
                >
                  Retake
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              variant="outline" 
              onClick={retakeImage}
              className="w-full"
            >
              Retake Photo
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default CameraCaptureWithAI;
