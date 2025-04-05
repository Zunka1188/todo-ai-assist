
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
   * Reset the scan state
   */
  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);
  
  return {
    status,
    result,
    error,
    isScanning: status === 'detecting',
    isSuccess: status === 'success',
    isError: status === 'error',
    scanBarcode,
    reset
  };
};
