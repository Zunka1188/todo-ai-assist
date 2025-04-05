
import { useState, useCallback } from 'react';
import { DetectionProcessor } from '../DetectionProcessor';
import { DetectionResult, DetectionOptions, DetectionStatus } from '../types';
import { modelManager } from '../ModelManager';

/**
 * Unified hook for all detection functionality
 */
export const useDetection = () => {
  const [status, setStatus] = useState<DetectionStatus>('idle');
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.65);
  
  /**
   * Process an image through the detection engine
   */
  const detectImage = useCallback(async (
    imageData: string,
    options: DetectionOptions = {}
  ) => {
    try {
      setStatus('detecting');
      setError(null);
      
      // Apply confidence threshold
      const detectionOptions = {
        ...options,
        confidenceThreshold: options.confidenceThreshold || confidenceThreshold
      };
      
      // Process the image through the detection engine
      const detectionResult = await DetectionProcessor.process(imageData, detectionOptions);
      
      setResult(detectionResult);
      setStatus(detectionResult ? 'success' : 'error');
      return detectionResult;
    } catch (err: any) {
      console.error('Detection error:', err);
      setError(err instanceof Error ? err : new Error(err?.message || 'Unknown error'));
      setStatus('error');
      return null;
    }
  }, [confidenceThreshold]);
  
  /**
   * Process an image and return multiple detection results
   */
  const detectMultiple = useCallback(async (
    imageData: string,
    options: DetectionOptions = {}
  ) => {
    try {
      setStatus('detecting');
      setError(null);
      
      // Apply confidence threshold
      const detectionOptions = {
        ...options,
        confidenceThreshold: options.confidenceThreshold || confidenceThreshold
      };
      
      // Process the image through the detection engine
      const results = await DetectionProcessor.processMultiple(imageData, detectionOptions);
      
      setStatus(results.length > 0 ? 'success' : 'error');
      setResult(results.length > 0 ? results[0] : null);
      return results;
    } catch (err: any) {
      console.error('Detection error:', err);
      setError(err instanceof Error ? err : new Error(err?.message || 'Unknown error'));
      setStatus('error');
      return [];
    }
  }, [confidenceThreshold]);
  
  /**
   * Submit feedback about detection results
   */
  const submitFeedback = useCallback((isAccurate: boolean, userCorrection?: any) => {
    if (!result) return;
    
    modelManager.addUserFeedback(
      result.type,
      result,
      isAccurate,
      userCorrection
    );
  }, [result]);
  
  /**
   * Reset detection state
   */
  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);
  
  /**
   * Update confidence threshold
   */
  const updateConfidenceThreshold = useCallback((threshold: number) => {
    setConfidenceThreshold(threshold);
  }, []);
  
  return {
    status,
    result,
    error,
    confidenceThreshold,
    isDetecting: status === 'detecting',
    isSuccess: status === 'success',
    isError: status === 'error',
    detectImage,
    detectMultiple,
    submitFeedback,
    updateConfidenceThreshold,
    reset
  };
};
