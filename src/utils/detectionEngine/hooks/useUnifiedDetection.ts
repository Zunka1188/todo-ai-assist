
import { useState, useCallback, useRef } from 'react';
import { DetectionProcessor } from '../DetectionProcessor';
import { DetectionResult, DetectionOptions, DetectionStatus } from '../types';
import { BarcodeScanner } from '../BarcodeScanner';
import { ProductRecognizer } from '../ProductRecognizer';

/**
 * Unified hook for smart scanning functionality
 * Combines barcode scanning and product recognition into a single process
 */
export const useUnifiedDetection = () => {
  const [status, setStatus] = useState<DetectionStatus>('idle');
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [detectionType, setDetectionType] = useState<'barcode' | 'product' | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  /**
   * Process an image for both barcode and product recognition
   * Attempts barcode detection first, then falls back to product recognition
   */
  const detectImage = useCallback(async (
    imageData: string,
    options: DetectionOptions = {}
  ) => {
    try {
      setStatus('detecting');
      setError(null);
      setDetectionType(null);
      
      console.log('Unified detection started...');
      
      // Try barcode detection first (usually faster)
      const barcodeResult = await BarcodeScanner.detectBarcode(imageData, {
        ...options,
        confidenceThreshold: options.confidenceThreshold || 0.6
      });
      
      // If barcode detected successfully
      if (barcodeResult && barcodeResult.confidence >= (options.confidenceThreshold || 0.6)) {
        console.log('Barcode detected:', barcodeResult);
        setResult(barcodeResult);
        setStatus('success');
        setDetectionType('barcode');
        return barcodeResult;
      }
      
      // If no barcode or low confidence, try product recognition
      console.log('No barcode detected, trying product recognition...');
      const productResult = await ProductRecognizer.detectProduct(imageData, {
        ...options,
        confidenceThreshold: options.confidenceThreshold || 0.65
      });
      
      if (productResult) {
        console.log('Product detected:', productResult);
        setResult(productResult);
        setStatus('success');
        setDetectionType('product');
        return productResult;
      }
      
      // If nothing detected with sufficient confidence, use general detection
      const generalResult = await DetectionProcessor.process(imageData, options);
      
      setResult(generalResult);
      setStatus(generalResult ? 'success' : 'error');
      setDetectionType(generalResult ? (generalResult.type === 'barcode' ? 'barcode' : 'product') : null);
      
      return generalResult;
    } catch (err: any) {
      console.error('Unified detection error:', err);
      setError(err instanceof Error ? err : new Error(err?.message || 'Unknown error'));
      setStatus('error');
      return null;
    }
  }, []);

  /**
   * Start continuous scanning with video element
   */
  const startContinuousScan = useCallback((
    videoElement: HTMLVideoElement,
    canvasElement: HTMLCanvasElement,
    onDetect: (result: DetectionResult) => void,
    intervalMs: number = 500
  ) => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    setStatus('detecting');
    
    // Create a function to capture frames and detect
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
        
        // Detect using unified detection
        const result = await detectImage(imageData, {
          confidenceThreshold: 0.6, // Lower threshold for real-time scanning
        });
        
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
  }, [detectImage]);

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
   * Reset detection state
   */
  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
    setDetectionType(null);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  }, []);
  
  return {
    status,
    result,
    error,
    detectionType,
    isDetecting: status === 'detecting',
    isSuccess: status === 'success',
    isError: status === 'error',
    isBarcodeResult: detectionType === 'barcode',
    isProductResult: detectionType === 'product',
    detectImage,
    startContinuousScan,
    stopContinuousScan,
    reset
  };
};
