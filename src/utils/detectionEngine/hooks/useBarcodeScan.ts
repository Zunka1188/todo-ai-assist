
import { useState, useCallback, useRef } from 'react';
import { BarcodeScanner } from '../BarcodeScanner';
import { BarcodeResult, DetectionOptions, DetectionStatus } from '../types';

/**
 * Hook for barcode scanning functionality
 */
export const useBarcodeScan = () => {
  const [status, setStatus] = useState<DetectionStatus>('idle');
  const [result, setResult] = useState<BarcodeResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  /**
   * Scan for barcodes in an image
   */
  const scanBarcode = useCallback(async (
    imageData: string,
    options: DetectionOptions = {}
  ) => {
    try {
      setStatus('detecting');
      setError(null);
      
      const barcodeResult = await BarcodeScanner.detectBarcode(imageData, options);
      
      setResult(barcodeResult);
      setStatus(barcodeResult ? 'success' : 'error');
      return barcodeResult;
    } catch (err: any) {
      console.error('Barcode scanning error:', err);
      setError(err instanceof Error ? err : new Error(err?.message || 'Unknown error'));
      setStatus('error');
      return null;
    }
  }, []);

  /**
   * Start continuous barcode scanning with video element
   * @param videoElement The video element to scan from
   * @param onDetect Callback function called when a barcode is detected
   * @param intervalMs Interval between scans in milliseconds
   */
  const startContinuousScan = useCallback((
    videoElement: HTMLVideoElement,
    canvasElement: HTMLCanvasElement,
    onDetect: (result: BarcodeResult) => void,
    intervalMs: number = 500
  ) => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    setStatus('detecting');
    
    // Create a function to capture frames and detect barcodes
    const scanFrame = async () => {
      if (!videoElement || !canvasElement) return;
      
      // Only scan if video is playing and has dimensions
      if (videoElement.readyState !== videoElement.HAVE_ENOUGH_DATA || 
          videoElement.videoWidth === 0 || 
          videoElement.paused) {
        return;
      }
      
      try {
        // Draw the current frame to canvas
        const ctx = canvasElement.getContext('2d');
        if (!ctx) return;
        
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        
        // Get image data from canvas
        const imageData = canvasElement.toDataURL('image/jpeg');
        
        // Scan for barcodes
        const result = await BarcodeScanner.detectBarcode(imageData);
        
        if (result) {
          setResult(result);
          setStatus('success');
          onDetect(result);
          
          // Stop scanning after detection
          if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
          }
        }
      } catch (err: any) {
        console.error('Error in continuous scan:', err);
      }
    };
    
    // Start the scanning interval
    scanIntervalRef.current = setInterval(scanFrame, intervalMs);
    
    // Return cleanup function
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
    };
  }, []);

  /**
   * Stop continuous scanning
   */
  const stopContinuousScan = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setStatus('idle');
  }, []);
  
  /**
   * Reset barcode scanning state
   */
  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  }, []);
  
  return {
    status,
    result,
    error,
    isScanning: status === 'detecting',
    isSuccess: status === 'success',
    isError: status === 'error',
    scanBarcode,
    startContinuousScan,
    stopContinuousScan,
    reset
  };
};
