import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, CameraOff, Settings, Image, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import DataRecognition, { RecognizedItem, RecognizedItemType } from './DataRecognition';
import './camera-animations.css';

interface EnhancedCameraCaptureProps {
  onClose: () => void;
  onSaveSuccess?: (data: any) => void;
  preferredMode?: string;
}

const EnhancedCameraCapture: React.FC<EnhancedCameraCaptureProps> = ({ 
  onClose,
  onSaveSuccess,
  preferredMode
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
  const [preferredScanMode, setPreferredScanMode] = useState<RecognizedItemType | null>(
    preferredMode as RecognizedItemType || null
  );
  
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
        
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          console.error("Camera permission denied:", err);
          setPermissionDenied(true);
          setCameraError("Camera permission denied. Please allow camera access in your browser settings.");
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
        
        stopCamera();
        
        processImage(imageDataURL);
      }
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
    setCameraError(null);
    setProcessing(false);
    startCamera();
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
    
    const mockExtractedText = generateMockExtractedText(preferredScanMode);
    
    setTimeout(() => {
      clearInterval(interval);
      setProgressValue(100);
      
      let determinedType: RecognizedItemType;
      if (preferredScanMode) {
        determinedType = preferredScanMode;
      } else {
        const types: Array<RecognizedItemType> = ['invitation', 'receipt', 'product', 'document', 'unknown'];
        const typeWeights = [0.3, 0.3, 0.2, 0.15, 0.05];
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
      
      const detectedObjects = generateDetectedObjects(determinedType);
      
      const result: RecognizedItem = {
        type: determinedType,
        confidence,
        data: mockData,
        imageData: imageDataURL,
        extractedText: mockExtractedText,
        detectedObjects
      };
      
      setRecognizedItem(result);
      setProcessing(false);
      
      toast({
        title: "Analysis Complete",
        description: `Detected: ${result.type} (${Math.round(result.confidence * 100)}% confidence)`,
      });
    }, 1500);
  };
  
  const generateMockExtractedText = (scanMode: RecognizedItemType | null): string => {
    switch (scanMode) {
      case 'invitation':
        return `TEAM OFFSITE MEETING\n\nDate: May 15, 2025\nTime: 10:00 AM - 4:00 PM\nLocation: Conference Room A, Building 2\n\nOrganizer: Sarah Johnson\nsarah.j@company.com\n\nQuarterly team meeting. Bring your presentation materials.`;
      
      case 'receipt':
        return `GREEN GROCERS\n123 Main Street\nCity, State 12345\n\nDate: 04/03/2025\nTime: 14:35\n\nApples      $4.99\nBread       $3.50\nMilk        $2.99\n\nSubtotal    $11.48\nTax (8%)     $0.92\n\nTOTAL       $12.40\n\nTHANK YOU FOR SHOPPING!`;
      
      case 'product':
        return `Organic Avocados\n2 count package\n\nPrice: $5.99\nCategory: Groceries\n\nFresh organic avocados, perfect for guacamole.\n\nNutrition Facts:\nServing Size: 1 avocado\nCalories: 240\nTotal Fat: 22g`;
      
      case 'document':
        return `MEETING MINUTES\n\nDate: April 10, 2025\nSubject: Product Launch Planning\n\nAttendees:\n- John Smith (Chair)\n- Jane Doe\n- Alex Johnson\n\nDiscussion Items:\n1. Marketing strategy for Q2\n2. Budget allocation\n3. Timeline for upcoming product launch`;
      
      default:
        const textOptions = [
          `TEXT DETECTION\nThis is a sample of detected text\nThe AI system would extract\nall visible text from the image\nand format it appropriately.`,
          `PRODUCT DETAILS\nModern Desk Lamp\nAdjustable brightness\nEnergy efficient\nPrice: $45.99\nIn stock: Yes`,
          `NOTES\nPick up dry cleaning\nCall dentist for appointment\nBuy groceries for dinner\n- Chicken\n- Vegetables\n- Rice`
        ];
        return textOptions[Math.floor(Math.random() * textOptions.length)];
    }
  };
  
  const generateTypeSpecificMockData = (type: RecognizedItemType) => {
    switch (type) {
      case 'invitation':
        return {
          title: "Team Offsite Meeting",
          date: "2025-05-15",
          time: "10:00 AM",
          location: "Conference Room A, Building 2",
          organizer: "Sarah Johnson",
          notes: "Quarterly team meeting. Bring your presentation materials."
        };
      
      case 'receipt':
        return {
          store: "Green Grocers",
          date: "2025-04-03",
          total: "$12.40",
          items: [
            { name: "Apples", price: "$4.99" },
            { name: "Bread", price: "$3.50" },
            { name: "Milk", price: "$2.99" }
          ]
        };
      
      case 'product':
        return {
          name: "Organic Avocados",
          price: "$5.99",
          category: "Groceries",
          brand: "Nature's Best",
          description: "Fresh organic avocados, perfect for guacamole."
        };
      
      case 'document':
        return {
          title: "Meeting Minutes",
          date: "2025-04-10",
          content: "Discussion about upcoming product launch and marketing strategy.",
          author: "John Smith"
        };
      
      default:
        return {
          title: "Unidentified Item",
          description: "This item couldn't be clearly categorized. Please provide additional details manually."
        };
    }
  };
  
  const generateDetectedObjects = (type: RecognizedItemType) => {
    const objects = [];
    
    switch (type) {
      case 'product':
        objects.push(
          { name: "Avocado", confidence: 0.96 },
          { name: "Fruit", confidence: 0.92 },
          { name: "Food item", confidence: 0.88 }
        );
        break;
      
      case 'receipt':
        objects.push(
          { name: "Receipt", confidence: 0.97 },
          { name: "Document", confidence: 0.88 },
          { name: "Printed text", confidence: 0.95 }
        );
        break;
      
      case 'invitation':
        objects.push(
          { name: "Document", confidence: 0.92 },
          { name: "Calendar", confidence: 0.84 },
          { name: "Text", confidence: 0.96 }
        );
        break;
      
      case 'document':
        objects.push(
          { name: "Document", confidence: 0.98 },
          { name: "Paper", confidence: 0.93 },
          { name: "Text", confidence: 0.97 }
        );
        break;
      
      default:
        objects.push(
          { name: "Document", confidence: 0.82 },
          { name: "Object", confidence: 0.78 }
        );
    }
    
    return objects;
  };
  
  const requestCameraPermission = async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        
        if (result.state === 'granted') {
          startCamera();
        } else if (result.state === 'prompt') {
          startCamera();
        } else if (result.state === 'denied') {
          setCameraError("Camera permission is blocked. Please update your browser settings to allow camera access.");
          setPermissionDenied(true);
        }
      } else {
        startCamera();
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
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
          navigateBasedOnFormData(formData);
        }, 500);
      }
    }, 100);
  };
  
  const navigateBasedOnFormData = (formData: any) => {
    if (formData.addToShoppingList) {
      navigate('/shopping');
    } else if (formData.addToCalendar) {
      navigate('/calendar');
    } else if (formData.saveToSpending) {
      navigate('/spending');
    } else if (formData.saveToDocuments) {
      navigate('/documents');
    } else {
      switch (formData.itemType) {
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
    }
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
    requestCameraPermission();
    
    return () => {
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
            : preferredScanMode 
              ? (preferredScanMode.charAt(0).toUpperCase() + preferredScanMode.slice(1)) + " Scanner"
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
            
            {preferredScanMode && (
              <div className="absolute top-0 left-0 p-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-todo-purple text-white">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {preferredScanMode.charAt(0).toUpperCase() + preferredScanMode.slice(1)} Mode
                </span>
              </div>
            )}
            
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full border-2 border-dashed border-white/40 rounded-lg"></div>
              <div className="absolute left-0 right-0 h-1 bg-todo-purple opacity-50 animate-scan"></div>
            </div>
            
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
