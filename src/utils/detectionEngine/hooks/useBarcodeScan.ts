
import { useState, useCallback } from 'react';
import { BarcodeScanner } from '../BarcodeScanner';
import { BarcodeResult, DetectionOptions, DetectionStatus } from '../types';

/**
 * Hook for barcode scanning functionality
 */
export const useBarcodeScan = () => {
  const [status, setStatus] = useState<DetectionStatus>('idle');
  const [result, setResult] = useState<BarcodeResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
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
   * Reset barcode scanning state
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
