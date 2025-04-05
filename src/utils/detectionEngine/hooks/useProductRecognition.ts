
import { useState, useCallback } from 'react';
import { ProductRecognizer } from '../ProductRecognizer';
import { ProductResult, DetectionOptions, DetectionStatus } from '../types';

/**
 * Hook for product recognition functionality
 */
export const useProductRecognition = () => {
  const [status, setStatus] = useState<DetectionStatus>('idle');
  const [result, setResult] = useState<ProductResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  /**
   * Recognize products in an image
   */
  const recognizeProduct = useCallback(async (
    imageData: string,
    options: DetectionOptions = {}
  ) => {
    try {
      setStatus('detecting');
      setError(null);
      
      const productResult = await ProductRecognizer.detectProduct(imageData, options);
      
      setResult(productResult);
      setStatus(productResult ? 'success' : 'error');
      return productResult;
    } catch (err: any) {
      console.error('Product recognition error:', err);
      setError(err instanceof Error ? err : new Error(err?.message || 'Unknown error'));
      setStatus('error');
      return null;
    }
  }, []);
  
  /**
   * Reset product recognition state
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
    isRecognizing: status === 'detecting',
    isSuccess: status === 'success',
    isError: status === 'error',
    recognizeProduct,
    reset
  };
};
