
import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, CameraOff, Settings, Image, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import DataRecognition, { RecognizedItem, RecognizedItemType } from './DataRecognition';

interface EnhancedCameraCaptureProps {
  onClose: () => void;
  onSaveSuccess?: (data: any) => void;
}

const EnhancedCameraCapture: React.FC<EnhancedCameraCaptureProps> = ({ 
  onClose,
  onSaveSuccess
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [recognizedItem, setRecognizedItem] = useState<RecognizedItem | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  
  const startCamera = async () => {
    try {
      console.log("Starting camera...");
      setCameraError(null);
      setPermissionDenied(false);
      setIsInitializing(true);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Camera API not supported");
        setCameraError("Camera API not supported in this browser");
        setIsInitializing(false);
        return;
      }
      
      // First try with environment facing camera for mobile devices
      const constraints = { 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      console.log("Requesting camera access with constraints:", constraints);
      
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
                  console.error("Error playing video:", err);
                  setCameraError(`Error playing video: ${err.message}`);
                  setIsInitializing(false);
                });
            }
          };
          
          videoRef.current.onerror = (e) => {
            console.error("Video element error:", e);
            setCameraError("Video element error");
            setIsInitializing(false);
          };
        } else {
          console.error("Video reference not available");
          setCameraError("Camera initialization failed - video element not found");
          setIsInitializing(false);
        }
      } catch (err: any) {
        console.error("Camera access error:", err);
        
        // Check if this is a permission error
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          console.error("Camera permission denied:", err);
          setPermissionDenied(true);
          setCameraError("Camera permission denied. Please allow camera access in your browser settings.");
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
            videoRef.current.setAttribute('playsinline', 'true'); // Important for iOS
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
                    console.error("Error playing video with fallback constraints:", playErr);
                    setCameraError(`Error starting camera: ${playErr.message}`);
                    setIsInitializing(false);
                  });
              }
            };
          }
        } catch (fallbackErr: any) {
          console.error("Both camera initialization attempts failed:", fallbackErr);
          
          // Check if this is a permission error
          if (fallbackErr.name === 'NotAllowedError' || fallbackErr.name === 'PermissionDeniedError') {
            setPermissionDenied(true);
            setCameraError("Camera permission denied. Please allow camera access in your browser settings.");
          } else {
            setCameraError(`Could not access camera: ${fallbackErr.message || "Unknown error"}`);
          }
          
          setIsInitializing(false);
        }
      }
    } catch (error: any) {
      console.error('Error in camera initialization:', error);
      
      // Check if this is a permission error
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setCameraError("Camera permission denied. Please allow camera access in your browser settings.");
      } else {
        setCameraError(error.message || "Unknown camera error");
      }
      
      setIsInitializing(false);
      
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions and try again.",
        variant: "destructive",
      });
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
        setCapturedImage(imageDataURL);
        
        // Stop the camera after capturing
        stopCamera();
        
        // Process the image for recognition
        processImage(imageDataURL);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Create a preview of the uploaded image
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
    setCameraError(null);
    setProcessing(false);
    startCamera();
  };
  
  const processImage = async (imageDataURL: string) => {
    setProcessing(true);
    setProgressValue(0);
    
    // Simulate progress updates
    const interval = setInterval(() => {
      setProgressValue(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);
    
    // In a real app, this would send the image to an AI service for analysis
    // For this demo, we'll simulate AI detection with random results
    setTimeout(() => {
      clearInterval(interval);
      setProgressValue(100);
      
      // Simulate AI processing
      const types: Array<RecognizedItemType> = ['invitation', 'receipt', 'product', 'document', 'unknown'];
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
          organizer: "Sarah Johnson",
          notes: "Quarterly team meeting. Bring your presentation materials."
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
          category: "Groceries",
          description: "Fresh organic avocados, perfect for guacamole."
        };
      } else if (randomType === 'document') {
        mockData = {
          title: "Meeting Minutes",
          date: "2025-04-10",
          content: "Discussion about upcoming product launch and marketing strategy.",
          author: "John Smith"
        };
      }
      
      const result: RecognizedItem = {
        type: randomType,
        confidence,
        data: mockData,
        imageData: imageDataURL
      };
      
      setRecognizedItem(result);
      setProcessing(false);
      
      toast({
        title: "Analysis Complete",
        description: `Detected: ${result.type} (${Math.round(result.confidence * 100)}% confidence)`,
      });
    }, 2000);
  };
  
  const requestCameraPermission = async () => {
    try {
      // On some browsers, we can request permission explicitly
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        
        if (result.state === 'granted') {
          // Permission already granted, restart camera
          startCamera();
        } else if (result.state === 'prompt') {
          // Will trigger the permission prompt
          startCamera();
        } else if (result.state === 'denied') {
          setCameraError("Camera permission is blocked. Please update your browser settings to allow camera access.");
          setPermissionDenied(true);
        }
      } else {
        // Fallback to just trying to access the camera
        startCamera();
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
      // Just try starting the camera anyway
      startCamera();
    }
  };
  
  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleSaveItem = (formData: any, originalItem: RecognizedItem) => {
    setIsSaving(true);
    
    // Simulate saving process with progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        clearInterval(interval);
        
        // Show success message
        toast({
          title: "Item Saved Successfully",
          description: `"${formData.title}" has been saved.`,
          variant: "default",
        });
        
        setIsSaving(false);
        
        // Trigger the onSaveSuccess callback if provided
        if (onSaveSuccess) {
          const savedData = {
            ...formData,
            originalType: originalItem.type,
            imageData: originalItem.imageData,
            savedAt: new Date().toISOString()
          };
          onSaveSuccess(savedData);
        }
        
        // Close the component or navigate based on the type
        setTimeout(() => {
          navigateBasedOnType(originalItem.type);
        }, 500);
      }
    }, 100);
  };
  
  const navigateBasedOnType = (type: RecognizedItemType) => {
    switch (type) {
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
        onClose();
    }
  };
  
  const openBrowserSettings = () => {
    // We can't programmatically open browser settings, but we can give instructions
    toast({
      title: "Permission Required",
      description: "Please open your browser settings and allow camera access for this site.",
    });
  };
  
  useEffect(() => {
    console.log("Component mounted, starting camera");
    requestCameraPermission();
    
    // Cleanup function to stop camera when component unmounts
    return () => {
      console.log("Component unmounting, stopping camera");
      stopCamera();
    };
  }, []);
  
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
        <h2 className="text-xl font-medium">
          {capturedImage 
            ? processing 
              ? "Analyzing Image" 
              : recognizedItem 
                ? "Review & Save" 
                : "Smart Scan"
            : "Smart Scanner"
          }
        </h2>
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
          <img 
            src={capturedImage} 
            alt="Captured" 
            className="w-full h-full object-contain"
          />
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
            <div className="flex flex-col gap-2">
              <Button onClick={requestCameraPermission} variant="outline" className="bg-white/10 hover:bg-white/20">
                Try Again
              </Button>
              <Button onClick={openFilePicker} variant="outline" className="bg-white/10 hover:bg-white/20">
                <Image className="mr-2 h-4 w-4" />
                Upload Image Instead
              </Button>
            </div>
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

export default EnhancedCameraCapture;
