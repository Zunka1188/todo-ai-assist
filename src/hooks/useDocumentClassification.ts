import { useState } from 'react';
import { useDocumentClassification as useDetectionEngineDocClassification } from '@/utils/detectionEngine/hooks';
import { DocumentResult } from '@/utils/detectionEngine/types';
import { analyzeImage, AnalysisResult } from '@/utils/imageAnalysis';

interface DocumentClassificationResult {
  title?: string;
  category?: string;
  tags?: string[];
  description?: string;
  date?: string;
  extractedText?: string;
  metadata?: Record<string, any>;
  confidence?: number;
}

export const useDocumentClassification = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { classifyDocument: detectionClassify, isClassifying, status, result, error } = useDetectionEngineDocClassification();
  
  const classifyDocument = async (
    imageData: string,
    fileName?: string
  ): Promise<DocumentClassificationResult | null> => {
    setIsAnalyzing(true);
    
    try {
      // First try the more specialized document classifier from the detection engine
      const documentResult = await detectionClassify(imageData, {
        enableOCR: true,
        includeRawImage: false
      });
      
      // If we got a result from the document classifier, use it
      if (documentResult) {
        setIsAnalyzing(false);
        return transformDocumentResult(documentResult);
      }
      
      // Fall back to the general image analysis
      const analysisResult = await analyzeImage(imageData, fileName);
      setIsAnalyzing(false);
      
      return transformAnalysisResult(analysisResult);
    } catch (error) {
      console.error('Error classifying document:', error);
      setIsAnalyzing(false);
      return null;
    }
  };
  
  const transformDocumentResult = (result: DocumentResult): DocumentClassificationResult => {
    return {
      title: result.metadata?.title || generateTitleFromText(result.extractedText),
      category: mapDocumentTypeToCategory(result.documentType),
      tags: generateTagsFromMetadata(result.metadata) || [],
      description: result.extractedText?.substring(0, 150) || '',
      date: result.metadata?.date || new Date().toISOString().split('T')[0],
      extractedText: result.extractedText,
      metadata: result.metadata,
      confidence: result.confidence
    };
  };
  
  const transformAnalysisResult = (result: AnalysisResult): DocumentClassificationResult => {
    return {
      title: result.title || 'Untitled Document',
      category: result.category || 'other',
      tags: result.tags || [],
      description: result.description || '',
      date: result.date || new Date().toISOString().split('T')[0],
      extractedText: result.extractedText,
      metadata: result.metadata
    };
  };
  
  const mapDocumentTypeToCategory = (documentType?: string): string => {
    if (!documentType) return 'other';
    
    const categoryMap: Record<string, string> = {
      'invitation': 'events',
      'receipt': 'other',
      'invoice': 'other',
      'resume': 'other',
      'flyer': 'events',
      'letter': 'other',
      'document': 'other'
    };
    
    return categoryMap[documentType] || 'other';
  };
  
  const generateTitleFromText = (text?: string): string => {
    if (!text) return 'Untitled Document';
    
    // Extract first line or first few words
    const firstLine = text.split('\n')[0].trim();
    if (firstLine.length > 5 && firstLine.length < 50) {
      return firstLine;
    }
    
    // Otherwise just take the first few words
    return text.substring(0, 40).trim() + (text.length > 40 ? '...' : '');
  };
  
  const generateTagsFromMetadata = (metadata?: Record<string, any>): string[] => {
    if (!metadata) return [];
    
    const tags: string[] = [];
    
    // Extract potential tags from metadata
    if (metadata.eventType) tags.push(metadata.eventType.toLowerCase());
    if (metadata.vendor) tags.push(metadata.vendor.toLowerCase());
    if (metadata.pageCount && metadata.pageCount > 1) tags.push('multi-page');
    
    // Add type-specific tags
    if (metadata.hosts) tags.push('invitation');
    if (metadata.items && Array.isArray(metadata.items)) tags.push('itemized');
    if (metadata.invoiceNumber) tags.push('invoice');
    
    return tags.slice(0, 5); // Limit to 5 tags
  };
  
  return {
    classifyDocument,
    isAnalyzing: isAnalyzing || isClassifying,
    status,
    error
  };
};
