
import { BarcodeScanner } from './BarcodeScanner';
import { ProductRecognizer } from './ProductRecognizer';
import { DocumentClassifier } from './DocumentClassifier';
import { ContextualAnalyzer } from './ContextualAnalyzer';
import { 
  DetectionResult, 
  DetectionOptions, 
  BarcodeResult,
  ProductResult,
  DocumentResult,
  ContextResult
} from './types';

/**
 * Main Detection Processor
 * Coordinates various detection modules and provides a unified detection API
 */
export class DetectionProcessor {
  /**
   * Process an image through all relevant detection modules
   * Returns the best matching result based on confidence scores
   */
  static async process(
    imageData: string, 
    options: DetectionOptions = {}
  ): Promise<DetectionResult | null> {
    try {
      console.log('Processing image through detection engine...');
      
      // Determine which modules to run based on preferred type
      let results: Array<DetectionResult | null> = [];
      
      if (!options.preferredType || options.preferredType === 'barcode') {
        const barcodeResult = await BarcodeScanner.detectBarcode(imageData, options);
        if (barcodeResult) results.push(barcodeResult);
      }
      
      if (!options.preferredType || options.preferredType === 'product') {
        const productResult = await ProductRecognizer.detectProduct(imageData, options);
        if (productResult) results.push(productResult);
      }
      
      if (!options.preferredType || options.preferredType === 'document') {
        const documentResult = await DocumentClassifier.classifyDocument(imageData, options);
        if (documentResult) results.push(documentResult);
      }
      
      if (!options.preferredType || options.preferredType === 'context') {
        const contextResult = await ContextualAnalyzer.analyzeContext(imageData, options);
        if (contextResult) results.push(contextResult);
      }
      
      // Filter out null results and sort by confidence
      results = results.filter(Boolean).sort((a, b) => b!.confidence - a!.confidence);
      
      // Apply confidence threshold if specified
      if (options.confidenceThreshold) {
        results = results.filter(r => r!.confidence >= options.confidenceThreshold!);
      }
      
      // Return the best match or null if nothing was detected
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Detection processor error:', error);
      return null;
    }
  }
  
  /**
   * Process an image through all relevant detection modules
   * Returns multiple results sorted by confidence
   */
  static async processMultiple(
    imageData: string, 
    options: DetectionOptions = {}
  ): Promise<DetectionResult[]> {
    try {
      console.log('Processing image for multiple detection types...');
      
      // Run all detection modules in parallel
      const [barcodeResult, productResult, documentResult, contextResult] = await Promise.all([
        BarcodeScanner.detectBarcode(imageData, options),
        ProductRecognizer.detectProduct(imageData, options),
        DocumentClassifier.classifyDocument(imageData, options),
        ContextualAnalyzer.analyzeContext(imageData, options)
      ]);
      
      // Collect all non-null results
      let results: DetectionResult[] = [];
      if (barcodeResult) results.push(barcodeResult);
      if (productResult) results.push(productResult);
      if (documentResult) results.push(documentResult);
      if (contextResult) results.push(contextResult);
      
      // Sort by confidence
      results = results.sort((a, b) => b.confidence - a.confidence);
      
      // Apply confidence threshold if specified
      if (options.confidenceThreshold) {
        results = results.filter(r => r.confidence >= options.confidenceThreshold!);
      }
      
      // Limit results if maxResults is specified
      if (options.maxResults && options.maxResults > 0) {
        results = results.slice(0, options.maxResults);
      }
      
      return results;
    } catch (error) {
      console.error('Multiple detection processor error:', error);
      return [];
    }
  }
}
