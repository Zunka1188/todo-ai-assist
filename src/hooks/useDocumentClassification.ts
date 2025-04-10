import { useState } from 'react';
import { useDocumentClassification as useDetectionEngineDocClassification } from '@/utils/detectionEngine/hooks';
import { DocumentResult } from '@/utils/detectionEngine/types';
import { analyzeImage, AnalysisResult } from '@/utils/imageAnalysis';
import { DocumentCategory } from '@/components/features/documents/types';

interface DocumentClassificationResult {
  title?: string;
  category?: DocumentCategory;
  tags?: string[];
  description?: string;
  date?: string;
  extractedText?: string;
  metadata?: Record<string, any>;
  confidence?: number;
  price?: string | number;
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
      tags: generateTagsFromMetadata(result.metadata, result.documentType) || [],
      description: result.extractedText?.substring(0, 150) || '',
      date: result.metadata?.date || new Date().toISOString().split('T')[0],
      extractedText: result.extractedText,
      metadata: result.metadata,
      confidence: result.confidence,
      price: result.metadata?.price || null
    };
  };
  
  const transformAnalysisResult = (result: AnalysisResult): DocumentClassificationResult => {
    return {
      title: result.title || 'Untitled Document',
      category: result.category as DocumentCategory || 'other',
      tags: result.tags || [],
      description: result.description || '',
      date: result.date || new Date().toISOString().split('T')[0],
      extractedText: result.extractedText,
      metadata: result.metadata,
      price: result.price || result.metadata?.price || null
    };
  };
  
  const mapDocumentTypeToCategory = (documentType?: string): DocumentCategory => {
    if (!documentType) return 'other';
    
    const categoryMap: Record<string, DocumentCategory> = {
      'invitation': 'events',
      'receipt': 'other',
      'invoice': 'other',
      'resume': 'other',
      'flyer': 'events',
      'letter': 'other',
      'clothing': 'style',
      'outfit': 'style',
      'fashion': 'style',
      'food': 'recipes',
      'recipe': 'recipes',
      'meal': 'recipes',
      'travel': 'travel',
      'vacation': 'travel',
      'landscape': 'travel',
      'destination': 'travel',
      'workout': 'fitness',
      'exercise': 'fitness',
      'fitness': 'fitness',
      'event': 'events',
      'party': 'events',
      'celebration': 'events',
      'wedding': 'events',
      'pdf': 'files',
      'excel': 'files',
      'word': 'files',
      'spreadsheet': 'files',
      'document': 'files'
    };
    
    return categoryMap[documentType.toLowerCase()] || 'other';
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
  
  const generateTagsFromMetadata = (metadata?: Record<string, any>, documentType?: string): string[] => {
    if (!metadata) return [];
    
    const tags: string[] = [];
    
    // Add document type as a tag if available
    if (documentType) tags.push(documentType.toLowerCase());
    
    // Extract potential tags from metadata
    if (metadata.eventType) tags.push(metadata.eventType.toLowerCase());
    if (metadata.vendor) tags.push(metadata.vendor.toLowerCase());
    if (metadata.pageCount && metadata.pageCount > 1) tags.push('multi-page');
    
    // Add category-specific tags based on metadata
    if (metadata.hosts) {
      tags.push('invitation');
      tags.push('event');
    }
    
    if (metadata.items && Array.isArray(metadata.items)) {
      tags.push('itemized');
      
      // Check if it's a recipe by looking at the items
      const foodRelatedWords = ['ingredient', 'cup', 'tablespoon', 'teaspoon', 'ounce', 'pound', 'gram'];
      const isFoodRelated = metadata.items.some((item: any) => 
        foodRelatedWords.some(word => 
          (typeof item === 'string' && item.toLowerCase().includes(word)) || 
          (item.name && item.name.toLowerCase().includes(word))
        )
      );
      
      if (isFoodRelated) {
        tags.push('recipe');
        tags.push('food');
      }
    }
    
    if (metadata.invoiceNumber) {
      tags.push('invoice');
      tags.push('payment');
    }
    
    // Add image recognition tags if available
    if (metadata.imageObjects && Array.isArray(metadata.imageObjects)) {
      // Map detected objects to appropriate categories
      const styleObjects = ['clothing', 'fashion', 'dress', 'shirt', 'pants', 'shoes', 'accessory'];
      const foodObjects = ['food', 'meal', 'dish', 'ingredient', 'recipe', 'kitchen'];
      const travelObjects = ['landscape', 'mountain', 'beach', 'city', 'monument', 'hotel', 'vacation'];
      const fitnessObjects = ['gym', 'workout', 'exercise', 'fitness', 'sport', 'athletic'];
      const eventObjects = ['party', 'celebration', 'wedding', 'conference', 'meeting'];
      
      metadata.imageObjects.forEach((obj: string) => {
        const objLower = obj.toLowerCase();
        
        // Add the object as a tag
        tags.push(objLower);
        
        // Add category tags based on detected objects
        if (styleObjects.some(item => objLower.includes(item))) {
          tags.push('style');
          tags.push('fashion');
        }
        
        if (foodObjects.some(item => objLower.includes(item))) {
          tags.push('recipe');
          tags.push('food');
        }
        
        if (travelObjects.some(item => objLower.includes(item))) {
          tags.push('travel');
          tags.push('destination');
        }
        
        if (fitnessObjects.some(item => objLower.includes(item))) {
          tags.push('fitness');
          tags.push('workout');
        }
        
        if (eventObjects.some(item => objLower.includes(item))) {
          tags.push('event');
        }
      });
    }
    
    // Remove duplicates and limit to 8 tags
    return [...new Set(tags)].slice(0, 8);
  };
  
  return {
    classifyDocument,
    isAnalyzing: isAnalyzing || isClassifying,
    status,
    error
  };
};
