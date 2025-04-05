
import { useState, useCallback } from 'react';
import { BarcodeScanner } from '../BarcodeScanner';
import { BarcodeResult, DetectionOptions, DetectionStatus } from '../types';

/**
 * Custom hook for barcode scanning functionality
 */
export const useBarcodeScan = () => {
  const [status, setStatus] = useState<DetectionStatus>('idle');
  const [result, setResult] = useState<BarcodeResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [scanningActive, setScanningActive] = useState(false);
  
  /**
   * Scan an image for barcodes
   */
  const scanBarcode = useCallback(async (
    imageData: string,
    options: DetectionOptions = {}
  ) => {
    try {
      setStatus('detecting');
      setError(null);
      
      console.log('Starting barcode scan...');
      
      // Scan for barcode using the BarcodeScanner
      const barcodeResult = await BarcodeScanner.detectBarcode(imageData, {
        ...options,
        confidenceThreshold: options.confidenceThreshold || 0.6
      });
      
      // Set the result state
      setResult(barcodeResult);
      setStatus(barcodeResult ? 'success' : 'error');
      
      return barcodeResult;
    } catch (err: any) {
      console.error('Barcode scan error:', err);
      setError(err instanceof Error ? err : new Error(err?.message || 'Unknown error'));
      setStatus('error');
      return null;
    }
  }, []);
  
  /**
   * Start continuous barcode scanning
   */
  const startContinuousScan = useCallback((
    scanFunction: () => Promise<BarcodeResult | null>,
    intervalMs: number = 500,
    onDetected?: (result: BarcodeResult) => void
  ) => {
    setScanningActive(true);
    setStatus('detecting');
    
    const intervalId = setInterval(async () => {
      if (!scanningActive) {
        clearInterval(intervalId);
        return;
      }
      
      try {
        const result = await scanFunction();
        
        if (result && result.confidence >= 0.6) {
          // Valid barcode found
          clearInterval(intervalId);
          setScanningActive(false);
          setResult(result);
          setStatus('success');
          
          if (onDetected) {
            onDetected(result);
          }
        }
      } catch (err) {
        console.error('Error during continuous scan:', err);
        // Continue scanning despite errors
      }
    }, intervalMs);
    
    // Return function to stop scanning
    return () => {
      clearInterval(intervalId);
      setScanningActive(false);
      setStatus('idle');
    };
  }, [scanningActive]);
  
  /**
   * Stop continuous scanning
   */
  const stopContinuousScan = useCallback(() => {
    setScanningActive(false);
    setStatus('idle');
  }, []);
  
  /**
   * Reset the scan state
   */
  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
    setScanningActive(false);
  }, []);
  
  return {
    status,
    result,
    error,
    isScanning: status === 'detecting',
    isSuccess: status === 'success',
    isError: status === 'error',
    scanningActive,
    scanBarcode,
    startContinuousScan,
    stopContinuousScan,
    reset
  };
};
