import React, { useState, useRef, useEffect } from 'react';
import { ScanBarcode, X, Camera, AlertCircle, Loader2, ShoppingBag, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import DataRecognition, { RecognizedItem } from './DataRecognition';
import { useCamera } from '@/hooks/use-camera';

interface BarcodeScannerCaptureProps {
  onClose: () => void;
  onSaveSuccess?: (data: any) => void;
}

const BarcodeScannerCapture: React.FC<BarcodeScannerCaptureProps> = ({ 
  onClose,
  onSaveSuccess
}) => {
  const { toast } = useToast();
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [recognizedItem, setRecognizedItem] = useState<RecognizedItem | null>(null);
  const [progressValue, setProgressValue] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [detectedBarcode, setDetectedBarcode] = useState<string | null>(null);
  const [scanningActive, setScanningActive] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    onError: (error, isPermissionDenied) => {
      toast({
        title: isPermissionDenied ? "Camera Permission Denied" : "Camera Error",
        description: error,
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    let scanInterval: NodeJS.Timeout;
    
    if (cameraActive && scanningActive) {
      scanInterval = setInterval(() => {
        if (Math.random() > 0.85) {
          const barcodeTypes = ['UPC-A', 'EAN-13', 'QR'];
          const randomType = barcodeTypes[Math.floor(Math.random() * barcodeTypes.length)];
          const randomDigits = Array(12).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
          
          handleBarcodeDetected(`${randomType}: ${randomDigits}`);
        }
      }, 1000);
    }
    
    return () => {
      if (scanInterval) clearInterval(scanInterval);
    };
  }, [cameraActive, scanningActive]);
  
  const handleBarcodeDetected = (barcodeValue: string) => {
    setScanningActive(false);
    setDetectedBarcode(barcodeValue);
    
    const imageDataURL = captureCameraImage();
    if (imageDataURL) {
      setCapturedImage(imageDataURL);
      processBarcode(imageDataURL, barcodeValue);
    }
    
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhbAYAAAD//wIA9v8EAPn/+//q//3/CwDw//X/BQDv/+v/9P8DAAgAAgDm//X/BwDx/wQA//8BAO//7/8RAPL/5P/8/wcACQD9/+3/+P8JAAEA7f/8/xoA+P/V/+3/FQAbAOr/3v/3/w4AFQDw/+v//v8LABYACQDW/+P/IQAhAPX/zv/x/yQAGQDz/9r/9f8iAB0A8P/Y//j/JAAcAAAA1P/j/yAALgDr/8z/9/8LACsA///j//j/BgAYAP//6v/w/wEAFQALAOf/5//0/xAACQDc/+//9v8EAAQA7P/e//z/EgD+/+b/5v8HAAcA9//5//L/8P8KAAQA4//x//r/AgAIAPb/7//0/wIACgD///D/7f/8/xIAAwDk/+f/AQALAPj/8P/0//n/BwAGAO//8f///wEABQD6//D/9v8GAAIA7v/0//7/AwAEAPr/9//4/wQABAD0//T/+/8CAAMAAAD2//P/AQAGAPv/9f/2/wMABAD7//X/+v8EAAQA9//1//z/AwAEAPj/9v/9/wIABAD6//f//P8BAAUA/P/3//3/AQAFAP3/9//8/wIABAD9//j//P8CAAUA/v/4//z/AgAFAP///f/+/wIAAgD///7//v8BAAIA/////v/+/wEAAQAAAP///v8AAAEAAAD///3/AAABAAAA///+/wAAAAAAAAD+/wAAAAAAAP///v8AAAAAAAAAAP//AAAAAAAAAAAAAAAA');
    audio.play();
    
    toast({
      title: "Barcode Detected",
      description: `Processing barcode: ${barcodeValue.substring(0, 25)}...`,
    });
  };
  
  const processBarcode = (imageDataURL: string, barcodeValue: string) => {
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
    
    setTimeout(() => {
      clearInterval(interval);
      setProgressValue(100);
      
      const mockProductData = {
        name: "Organic Cranberry Juice",
        price: "$4.99",
        category: "Beverages",
        brand: "Nature's Best",
        barcode: barcodeValue,
        description: "100% pure cranberry juice, no sugar added.",
        quantity: 1
      };
      
      const result: RecognizedItem = {
        type: 'product',
        confidence: 0.95,
        data: mockProductData,
        imageData: imageDataURL,
        extractedText: `Product: ${mockProductData.name}\nPrice: ${mockProductData.price}\nBarcode: ${barcodeValue}`,
        detectedObjects: [
          { name: "Bottle", confidence: 0.92 },
          { name: "Product", confidence: 0.98 }
        ]
      };
      
      setRecognizedItem(result);
      setProcessing(false);
      stopCamera();
      
      toast({
        title: "Product Identified",
        description: `Found: ${mockProductData.name}`,
      });
    }, 1500);
  };
  
  const retryScanning = () => {
    setCapturedImage(null);
    setRecognizedItem(null);
    setDetectedBarcode(null);
    setProcessing(false);
    setScanningActive(true);
    requestCameraPermission();
  };
  
  const openBrowserSettings = () => {
    toast({
      title: "Permission Required",
      description: "Please open your browser settings and allow camera access for this site.",
    });
  };
  
  const handleSaveItem = (formData: any, originalItem: RecognizedItem) => {
    setIsSaving(true);
    
    setTimeout(() => {
      setIsSaving(false);
      
      if (onSaveSuccess) {
        const savedData = {
          ...formData,
          originalType: originalItem.type,
          barcode: detectedBarcode,
          imageData: formData.keepImage ? originalItem.imageData : null,
          savedAt: new Date().toISOString()
        };
        onSaveSuccess(savedData);
      }
    }, 1000);
  };
  
  useEffect(() => {
    console.log("BarcodeScannerCapture mounted, initializing camera...");
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
              ? "Processing Barcode" 
              : recognizedItem 
                ? "Review Product" 
                : "Barcode Scanner"
            : "Barcode Scanner"
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
            
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full border-2 border-dashed border-white/40 rounded-lg"></div>
              <div className="absolute top-[45%] left-0 right-0 h-[10%] border-t-2 border-b-2 border-red-500/70"></div>
              <div className="absolute left-0 right-0 h-0.5 bg-red-500 opacity-70 top-1/2 animate-scan"></div>
            </div>
            
            <div className="absolute top-4 left-4 bg-black/50 rounded-lg px-3 py-1.5 text-xs text-white flex items-center">
              <ScanBarcode className="h-3.5 w-3.5 mr-1.5" />
              Scanning for barcodes...
            </div>
          </>
        ) : capturedImage ? (
          <img 
            src={capturedImage} 
            alt="Captured" 
            className="w-full h-full object-contain"
          />
        ) : permissionDenied ? (
          <div className="text-white text-center p-4">
            <Camera className="mx-auto h-12 w-12 mb-2 text-red-500" />
            <p className="text-red-300 mb-2">Camera Permission Denied</p>
            <p className="text-sm text-gray-300 mb-4">
              This app needs camera access to scan barcodes. Please allow camera access in your browser settings.
            </p>
            <div className="flex flex-col space-y-2">
              <Button onClick={requestCameraPermission} variant="outline" className="bg-white/10 hover:bg-white/20">
                Try Again
              </Button>
              <Button onClick={openBrowserSettings} variant="outline" className="bg-white/10 hover:bg-white/20">
                Open Settings
              </Button>
            </div>
          </div>
        ) : cameraError ? (
          <div className="text-white text-center p-4">
            <Camera className="mx-auto h-12 w-12 mb-2 text-red-500" />
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
        
        {processing && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4">
            <Loader2 className="h-10 w-10 text-white animate-spin mb-4" />
            <p className="text-white mb-2">Looking up product...</p>
            <div className="w-full max-w-xs">
              <Progress value={progressValue} className="h-2 bg-gray-700" />
            </div>
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
              ? "This application needs camera access to scan barcodes. Please update your browser settings to allow camera access for this site."
              : cameraError || "Could not access camera. Please check your device and try again."
            }
          </AlertDescription>
        </Alert>
      )}
      
      {detectedBarcode && !processing && !recognizedItem && (
        <Alert className="mt-4">
          <ShoppingBag className="h-4 w-4" />
          <AlertTitle>Barcode Detected</AlertTitle>
          <AlertDescription>
            Barcode: {detectedBarcode}
          </AlertDescription>
        </Alert>
      )}
      
      {recognizedItem && !processing && (
        <div className="space-y-4">
          <DataRecognition
            recognizedItem={recognizedItem}
            isProcessing={isSaving}
            onSave={handleSaveItem}
            onCancel={retryScanning}
            showAddToShoppingList={true}
          />
        </div>
      )}
      
      {capturedImage && !processing && !recognizedItem && (
        <div className="flex justify-center mt-4">
          <Button 
            variant="default" 
            onClick={retryScanning}
          >
            <Camera className="h-4 w-4 mr-2" />
            Scan Another Barcode
          </Button>
        </div>
      )}
      
      {cameraActive && !capturedImage && !permissionDenied && !cameraError && (
        <div className="text-center text-sm text-muted-foreground">
          <p>Point your camera at a barcode to scan.</p>
          <p className="mt-1">Hold the device steady for best results.</p>
        </div>
      )}
    </div>
  );
};

export default BarcodeScannerCapture;
