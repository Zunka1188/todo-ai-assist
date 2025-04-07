
/**
 * Core types for the detection engine
 */

// Base detection result with common properties
export interface DetectionResult {
  type: DetectionType;
  confidence: number;
  timestamp: string;
  rawImageData?: string;
}

// Types of detection that can be performed
export type DetectionType = 
  | 'barcode' 
  | 'product' 
  | 'document' 
  | 'context' 
  | 'unknown';

// Document classification types
export type DocumentType = 
  | 'invitation' 
  | 'receipt' 
  | 'invoice' 
  | 'resume' 
  | 'flyer' 
  | 'letter' 
  | 'document'
  | 'outfit'
  | 'clothing'
  | 'fashion'
  | 'recipe'
  | 'food'
  | 'travel'
  | 'destination'
  | 'fitness'
  | 'workout'
  | 'exercise'
  | 'event'
  | 'party';

// Context types from screenshots
export type ContextType = 
  | 'event' 
  | 'shopping' 
  | 'reminder' 
  | 'contact' 
  | 'social' 
  | 'unknown';

// Barcode format types
export type BarcodeFormat = 
  | 'QR' 
  | 'EAN' 
  | 'UPC' 
  | 'CODE128' 
  | 'CODE39' 
  | 'unknown';

// Barcode detection result
export interface BarcodeResult extends DetectionResult {
  type: 'barcode';
  format: BarcodeFormat;
  value: string;
  productInfo?: ProductInfo;
}

// Product recognition result
export interface ProductResult extends DetectionResult {
  type: 'product';
  productInfo: ProductInfo;
  detectedFeatures: string[];
}

// Document classification result
export interface DocumentResult extends DetectionResult {
  type: 'document';
  documentType: DocumentType;
  extractedText?: string;
  metadata: Record<string, any>;
}

// Context analysis result
export interface ContextResult extends DetectionResult {
  type: 'context';
  contextType: ContextType;
  extractedText?: string;
  entities: ContextEntity[];
  suggestedAction?: SuggestedAction;
}

// Product information
export interface ProductInfo {
  name: string;
  brand?: string;
  category?: string;
  price?: string;
  imageUrl?: string;
  barcode?: string;
  description?: string;
  attributes?: Record<string, any>;
}

// Context entity like dates, locations, people
export interface ContextEntity {
  type: 'date' | 'location' | 'person' | 'organization' | 'product' | 'other';
  value: string;
  confidence: number;
}

// Suggested actions based on detection
export interface SuggestedAction {
  type: 'addToCalendar' | 'addToShoppingList' | 'saveToDocuments' | 'contact' | 'none';
  data: Record<string, any>;
}

// Options for detection process
export interface DetectionOptions {
  preferredType?: DetectionType;
  includeRawImage?: boolean;
  confidenceThreshold?: number;
  maxResults?: number;
  language?: string;
  enableOCR?: boolean;
}

// Status of the detection process
export type DetectionStatus = 'idle' | 'detecting' | 'success' | 'error';

// This interface extends RecognizedItem from DataRecognition component
// to include detectionSource field and match the detectedObjects structure
export interface ScannerRecognizedItem {
  type: string;
  confidence: number;
  data: any;
  imageData: string;
  extractedText?: string;
  detectedObjects?: Array<{ name: string; confidence: number }>;
  detectionSource?: string;
}

// Define a mapper function to convert between different object formats
export const mapDetectedObjectsFormats = (
  objects: Array<{ label: string; confidence: number }> | Array<{ name: string; confidence: number }> | undefined
): Array<{ name: string; confidence: number }> => {
  if (!objects) return [];
  
  return objects.map(obj => {
    if ('name' in obj) {
      return obj;
    } else if ('label' in obj) {
      return {
        name: obj.label,
        confidence: obj.confidence
      };
    }
    return { name: 'Unknown', confidence: 0 };
  });
};
