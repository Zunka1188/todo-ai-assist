
import { useState, useCallback } from 'react';
import { DetectionProcessor } from '../DetectionProcessor';
import { DetectionResult, DetectionOptions, DetectionStatus } from '../types';

/**
 * Hook for using the detection engine in React components
 */
export const useDetection = () => {
  const [status, setStatus] = useState<DetectionStatus>('idle');
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [results, setResults] = useState<DetectionResult[]>([]);
  const [error, setError] = useState<Error | null>(null);
  
  /**
   * Process an image through the detection engine
   */
  const detectFromImage = useCallback(async (
    imageData: string,
    options: DetectionOptions = {}
  ) => {
    try {
      setStatus('detecting');
      setError(null);
      
      const detectionResult = await DetectionProcessor.process(imageData, options);
      
      setResult(detectionResult);
      setStatus(detectionResult ? 'success' : 'error');
      return detectionResult;
    } catch (err: any) {
      console.error('Detection error:', err);
      setError(err instanceof Error ? err : new Error(err?.message || 'Unknown error'));
      setStatus('error');
      return null;
    }
  }, []);
  
  /**
   * Process an image through multiple detection modules
   */
  const detectMultipleFromImage = useCallback(async (
    imageData: string,
    options: DetectionOptions = {}
  ) => {
    try {
      setStatus('detecting');
      setError(null);
      
      const detectionResults = await DetectionProcessor.processMultiple(imageData, options);
      
      setResults(detectionResults);
      setStatus(detectionResults.length > 0 ? 'success' : 'error');
      
      // Also set the top result
      if (detectionResults.length > 0) {
        setResult(detectionResults[0]);
      }
      
      return detectionResults;
    } catch (err: any) {
      console.error('Multiple detection error:', err);
      setError(err instanceof Error ? err : new Error(err?.message || 'Unknown error'));
      setStatus('error');
      return [];
    }
  }, []);
  
  /**
   * Reset detection state
   */
  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setResults([]);
    setError(null);
  }, []);
  
  return {
    status,
    result,
    results,
    error,
    isDetecting: status === 'detecting',
    isSuccess: status === 'success',
    isError: status === 'error',
    detectFromImage,
    detectMultipleFromImage,
    reset
  };
};
