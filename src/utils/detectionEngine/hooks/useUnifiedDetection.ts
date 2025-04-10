
import { useState, useCallback, useRef } from 'react';
import { DetectionProcessor } from '../DetectionProcessor';
import { DetectionResult, DetectionOptions, DetectionStatus } from '../types';
import { ProductRecognizer } from '../ProductRecognizer';

/**
 * Unified hook for smart scanning functionality
 * Focuses on product recognition
 */
export const useUnifiedDetection = () => {
  const [status, setStatus] = useState<DetectionStatus>('idle');
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [detectionType, setDetectionType] = useState<'product' | 'barcode' | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  /**
   * Process an image for product recognition
   */
  const detectImage = useCallback(async (
    imageData: string,
    options: DetectionOptions = {}
  ) => {
    try {
      setStatus('detecting');
      setError(null);
      setDetectionType(null);
      
      console.log('Product detection started...');
      
      // Try product recognition
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
      setDetectionType(generalResult?.type === 'product' ? 'product' : 
                      generalResult?.type === 'barcode' ? 'barcode' : null);
      
      return generalResult;
    } catch (err: any) {
      console.error('Detection error:', err);
      setError(err instanceof Error ? err : new Error(err?.message || 'Unknown error'));
      setStatus('error');
      return null;
    }
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
    isProductResult: detectionType === 'product',
    detectImage,
    reset
  };
};
