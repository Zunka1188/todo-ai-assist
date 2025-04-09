
import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, AlertCircle, Upload, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { AIDetectionService, AIDetectionMode, AIDetectionResult } from '@/services/aiDetectionService';
import { RecognizedItem, RecognizedItemType } from './DataRecognition';
import DataRecognition from './DataRecognition';
import CategorySelection from './CategorySelection';
import './camera-animations.css';

interface SmartScannerCaptureProps {
  onCapture?: (result: any) => void;
  onSaveSuccess?: (data: any) => void;
  onClose?: () => void;
  preferredMode?: AIDetectionMode;
  autoStart?: boolean;
}

const SmartScannerCapture: React.FC<SmartScannerCaptureProps> = ({
  onCapture,
  onSaveSuccess,
  onClose,
  preferredMode = 'auto',
  autoStart = false,
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(autoStart);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [detectionResult, setDetectionResult] = useState<AIDetectionResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<RecognizedItemType>('unknown');
  const [categoryConfirmed, setCategoryConfirmed] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { isMobile } = useIsMobile();

  // Initialize camera
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
      
      console.log("[SmartScanner] Camera initialized successfully");
    } catch (error) {
      console.error("[SmartScanner] Error initializing camera:", error);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive"
      });
      setCameraActive(false);
      throw error;
    }
  };

  // Stop the camera
  const stopCamera = (): void => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      console.log("[SmartScanner] Camera stopped");
    }
  };

  // Capture image from video
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

  // Initialize camera on component mount
  useEffect(() => {
    let mounted = true;

    const setupCamera = async () => {
      if (cameraActive && videoRef.current) {
        try {
          await initializeCamera(videoRef.current);
        } catch (error) {
          if (mounted) {
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
  }, [cameraActive]);

  // Progress animation for AI processing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (processing) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);
    } else {
      setProgress(processing ? 0 : 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [processing]);

  // Handle image capture from camera
  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      setScanning(true);
      const imageData = captureImageFromVideo(videoRef.current, canvasRef.current);
      setCapturedImage(imageData);
      setScanning(false);
      
      // Now process the captured image with AI
      await processImageWithAI(imageData);
    } catch (error) {
      console.error("[SmartScanner] Capture error:", error);
      setScanning(false);
      toast({
        title: "Capture Error",
        description: "An error occurred while capturing the image",
        variant: "destructive"
      });
    }
  };

  // Process image with AI detection service
  const processImageWithAI = async (imageData: string) => {
    setProcessing(true);
    
    try {
      // Process with AI detection service
      const result = await AIDetectionService.processImage(
        imageData,
        preferredMode,
        { confidenceThreshold: 0.4, enhancedProcessing: true }
      );
      
      if (result) {
        setDetectionResult(result);
        setSelectedCategory(result.type);
        
        // If confidence is high, auto-confirm category
        if (result.confidence > 0.75) {
          setCategoryConfirmed(true);
        }
        
        toast({
          title: "AI Detection Complete",
          description: `Detected as ${result.type} (${Math.round(result.confidence * 100)}% confidence)`,
        });
      } else {
        setSelectedCategory('unknown');
        
        toast({
          title: "No Clear Detection",
          description: "Could not determine type with confidence",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("[SmartScanner] AI processing error:", error);
      toast({
        title: "Processing Error",
        description: "Failed to analyze image",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  // Handle category confirmation
  const confirmCategory = () => {
    setCategoryConfirmed(true);
    
    // If we have a detection result but of different type, reprocess as the selected type
    if (detectionResult && detectionResult.type !== selectedCategory && capturedImage) {
      toast({
        title: "Reprocessing Image",
        description: `Analyzing as ${selectedCategory}...`,
      });
      
      // Re-process with the selected category
      processImageWithAI(capturedImage);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    let file: File | null = null;
    
    // Handle both drag event and input change event
    if ('dataTransfer' in event) {
      file = event.dataTransfer?.files?.[0] || null;
    } else {
      file = event.target?.files?.[0] || null;
    }
    
    if (!file) {
      toast({
        title: "Upload Error",
        description: "No file selected",
        variant: "destructive"
      });
      return;
    }
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File",
        description: "Please upload an image or PDF file",
        variant: "destructive"
      });
      return;
    }
    
    setUploadedFile(file);
    
    // Convert file to data URL for processing
    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        const fileDataURL = e.target.result as string;
        setCapturedImage(fileDataURL);
        
        // Process with AI
        await processImageWithAI(fileDataURL);
      }
    };
    reader.readAsDataURL(file);
    
    toast({
      title: "File Received",
      description: `Processing: ${file.name}`,
    });
  };

  // Handle drop event for file upload
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFileUpload(e);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Retry scanning
  const handleRetake = () => {
    setCapturedImage(null);
    setDetectionResult(null);
    setCategoryConfirmed(false);
    setUploadedFile(null);
  };

  // Save recognized data
  const handleSaveItem = (formData: any, originalItem: RecognizedItem) => {
    setIsSaving(true);
    
    setTimeout(() => {
      setIsSaving(false);
      
      if (onCapture) {
        onCapture({
          ...formData,
          originalDetection: detectionResult,
          image: capturedImage
        });
      }
      
      if (onSaveSuccess) {
        onSaveSuccess({
          ...formData,
          itemType: selectedCategory
        });
      } else {
        toast({
          title: "Item Saved",
          description: `Successfully saved ${formData.title || 'item'}`,
        });
        
        // Reset the scanner
        handleRetake();
      }
    }, 800);
  };

  const convertToRecognizedItem = (result: AIDetectionResult): RecognizedItem => {
    return {
      type: result.type,
      confidence: result.confidence,
      data: result.data,
      imageData: capturedImage || undefined,
      extractedText: result.extractedText,
      detectedObjects: result.detectedObjects
    };
  };

  // Convert AIDetectionResult to format expected by DataRecognition component
  const getRecognizedItem = (): RecognizedItem | null => {
    if (!detectionResult) return null;
    
    return convertToRecognizedItem(detectionResult);
  };

  return (
    <div className="relative flex flex-col items-center space-y-4">
      {!capturedImage ? (
        <>
          {cameraActive ? (
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
                  disabled={scanning} 
                  size="lg" 
                  className="rounded-full h-16 w-16 bg-primary hover:bg-primary/90"
                >
                  <Camera className="h-8 w-8" />
                </Button>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full" 
                onClick={() => {
                  stopCamera();
                  setCameraActive(false);
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="w-full max-w-md p-4">
              <div 
                className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-primary bg-opacity-10 p-4 rounded-full">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Upload or Take Photo</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                      {isMobile 
                        ? "Take a photo or upload an image for AI analysis" 
                        : "Drag and drop files here or click to select files"}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 justify-center">
                    {isMobile && (
                      <Button 
                        onClick={() => setCameraActive(true)}
                        className="flex items-center"
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Take Photo
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload File
                    </Button>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*,application/pdf"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="w-full max-w-md">
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden aspect-[4/3] flex items-center justify-center">
              <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
              
              {processing && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4">
                  <Loader2 className="h-10 w-10 text-white animate-spin mb-4" />
                  <p className="text-white mb-2">
                    Analyzing with AI...
                  </p>
                  <div className="w-full max-w-xs bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {!processing && detectionResult && categoryConfirmed && (
              <DataRecognition
                recognizedItem={getRecognizedItem()}
                isProcessing={isSaving}
                onSave={handleSaveItem}
                onCancel={handleRetake}
                showAddToShoppingList={true}
                showAddToCalendar={true}
                showSaveToDocuments={true}
              />
            )}
            
            {!processing && detectionResult && !categoryConfirmed && (
              <CategorySelection
                suggestedCategory={detectionResult.type}
                selectedCategory={selectedCategory}
                aiConfidence={detectionResult.confidence}
                onSelectCategory={(category) => setSelectedCategory(category as RecognizedItemType)}
                onConfirm={confirmCategory}
              />
            )}
            
            {!processing && !detectionResult && (
              <div className="p-4 border rounded-lg bg-background flex flex-col items-center">
                <AlertCircle className="h-8 w-8 text-yellow-500 mb-2" />
                <h3 className="text-lg font-medium mb-2">No Results</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Could not detect anything in this image. Try again or use manual input.
                </p>
                <Button variant="outline" onClick={handleRetake}>Try Again</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartScannerCapture;
