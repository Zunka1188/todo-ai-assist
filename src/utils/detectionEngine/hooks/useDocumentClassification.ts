
import { useState, useCallback } from 'react';
import { DocumentClassifier } from '../DocumentClassifier';
import { DocumentResult, DetectionOptions, DetectionStatus } from '../types';

/**
 * Hook for document classification functionality
 */
export const useDocumentClassification = () => {
  const [status, setStatus] = useState<DetectionStatus>('idle');
  const [result, setResult] = useState<DocumentResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  /**
   * Classify document in an image
   */
  const classifyDocument = useCallback(async (
    imageData: string,
    options: DetectionOptions = {}
  ) => {
    try {
      setStatus('detecting');
      setError(null);
      
      const documentResult = await DocumentClassifier.classifyDocument(imageData, options);
      
      setResult(documentResult);
      setStatus(documentResult ? 'success' : 'error');
      return documentResult;
    } catch (err: any) {
      console.error('Document classification error:', err);
      setError(err instanceof Error ? err : new Error(err?.message || 'Unknown error'));
      setStatus('error');
      return null;
    }
  }, []);
  
  /**
   * Reset document classification state
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
    isClassifying: status === 'detecting',
    isSuccess: status === 'success',
    isError: status === 'error',
    classifyDocument,
    reset
  };
};
