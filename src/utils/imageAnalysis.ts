import { DocumentType } from './detectionEngine/types';
import { DocumentCategory } from '@/components/features/documents/types';

// Define the AnalysisResult interface that's being imported by other files
export interface AnalysisResult {
  title?: string;
  category?: DocumentCategory | string;
  tags?: string[];
  description?: string;
  date?: string;
  extractedText?: string;
  metadata?: Record<string, any>;
}

// Helper function to map detected document types to document categories
export const mapDocumentTypeToCategory = (docType: DocumentType): DocumentCategory => {
  switch (docType) {
    case 'outfit':
    case 'clothing':
    case 'fashion':
      return 'style';
    case 'recipe':
    case 'food':
      return 'recipes';
    case 'travel':
    case 'destination':
      return 'travel';
    case 'fitness':
    case 'workout':
    case 'exercise':
      return 'fitness';
    case 'event':
    case 'party':
    case 'invitation':
      return 'events';
    case 'document':
    case 'resume':
    case 'invoice':
    case 'letter':
    case 'flyer':
      return 'other';
    default:
      return 'other';
  }
};

// Helper function to generate tags based on document type
export const generateTagsFromDocumentType = (docType: DocumentType): string[] => {
  switch (docType) {
    case 'outfit':
    case 'clothing':
    case 'fashion':
      return ['style', 'outfit', 'fashion'];
    case 'recipe':
    case 'food':
      return ['recipe', 'food', 'cooking'];
    case 'travel':
    case 'destination':
      return ['travel', 'destination', 'vacation'];
    case 'fitness':
    case 'workout':
    case 'exercise':
      return ['fitness', 'workout', 'health'];
    case 'event':
    case 'party':
    case 'invitation':
      return ['event', 'invitation', 'calendar'];
    case 'document':
    case 'resume':
    case 'invoice':
    case 'letter':
    case 'flyer':
      return ['document', 'important'];
    default:
      return ['general'];
  }
};

// Function to analyze extracted text and determine document type
export const analyzeText = (text: string): DocumentType => {
  text = text.toLowerCase();
  
  // Check for recipe indicators
  if (text.includes('recipe') || 
      text.includes('ingredients') || 
      text.includes('instructions') ||
      text.includes('cook') ||
      text.includes('bake') ||
      text.includes('minutes') && (text.includes('heat') || text.includes('oven'))) {
    return 'recipe';
  }
  
  // Check for clothing/style indicators
  if (text.includes('outfit') || 
      text.includes('wear') || 
      text.includes('fashion') ||
      text.includes('style') ||
      text.includes('clothing')) {
    return 'clothing';
  }
  
  // Check for travel indicators
  if (text.includes('travel') || 
      text.includes('vacation') || 
      text.includes('destination') ||
      text.includes('flight') ||
      text.includes('trip') ||
      text.includes('hotel') ||
      text.includes('booking')) {
    return 'travel';
  }
  
  // Check for fitness indicators
  if (text.includes('workout') || 
      text.includes('exercise') || 
      text.includes('fitness') ||
      text.includes('gym') ||
      text.includes('training') ||
      text.includes('cardio') ||
      text.includes('reps') ||
      text.includes('sets')) {
    return 'fitness';
  }
  
  // Check for event indicators
  if (text.includes('event') || 
      text.includes('invitation') || 
      text.includes('party') ||
      text.includes('wedding') ||
      text.includes('celebrate') ||
      text.includes('rsvp')) {
    return 'event';
  }
  
  // Check for professional document indicators
  if (text.includes('resume') || 
      text.includes('cv') || 
      text.includes('invoice') ||
      text.includes('contract') ||
      text.includes('agreement') ||
      text.includes('report')) {
    return 'document';
  }
  
  // Default to generic document type if no specific matches
  return 'document';
};

// Function to suggest a title based on document content
export const suggestTitle = (text: string, docType: DocumentType): string => {
  // Split text into lines
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // First line is often a good title candidate for many document types
  if (lines.length > 0 && lines[0].length < 100 && lines[0].length > 3) {
    return lines[0];
  }
  
  // For recipes, look for a line containing "Recipe" or ending with common dish identifiers
  if (docType === 'recipe' || docType === 'food') {
    for (const line of lines) {
      if (line.toLowerCase().includes('recipe') || 
          /\b(salad|soup|pasta|dish|cake|pie|bread)\b/i.test(line)) {
        return line.length < 100 ? line : line.substring(0, 97) + '...';
      }
    }
    return 'Food Recipe';
  }
  
  // For events, look for event type mentions
  if (docType === 'event' || docType === 'party' || docType === 'invitation') {
    for (const line of lines) {
      if (/\b(party|celebration|wedding|birthday|anniversary|event)\b/i.test(line)) {
        return line.length < 100 ? line : line.substring(0, 97) + '...';
      }
    }
    return 'Event Invitation';
  }
  
  // For fitness, look for workout related terms
  if (docType === 'fitness' || docType === 'workout' || docType === 'exercise') {
    for (const line of lines) {
      if (/\b(workout|routine|training|program|plan|fitness)\b/i.test(line)) {
        return line.length < 100 ? line : line.substring(0, 97) + '...';
      }
    }
    return 'Workout Plan';
  }
  
  // For travel, look for destination information
  if (docType === 'travel' || docType === 'destination') {
    for (const line of lines) {
      if (/\b(trip|itinerary|travel|vacation|visit|tour)\b/i.test(line)) {
        return line.length < 100 ? line : line.substring(0, 97) + '...';
      }
    }
    return 'Travel Plan';
  }
  
  // For style/outfit, look for descriptive text
  if (docType === 'outfit' || docType === 'clothing' || docType === 'fashion') {
    for (const line of lines) {
      if (/\b(outfit|look|style|fashion|wear|dress)\b/i.test(line)) {
        return line.length < 100 ? line : line.substring(0, 97) + '...';
      }
    }
    return 'Outfit Idea';
  }
  
  // Default titles based on document type if we couldn't find a good candidate
  switch(docType) {
    case 'document': return 'Important Document';
    case 'invoice': return 'Invoice';
    case 'resume': return 'Resume';
    case 'letter': return 'Letter';
    case 'flyer': return 'Flyer';
    default: return 'Untitled Document';
  }
};

// Function to extract potential event date from text
export const extractEventDate = (text: string): Date | null => {
  // Common date formats to check for
  const datePatterns = [
    // MM/DD/YYYY or DD/MM/YYYY
    /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b/g,
    // Month DD, YYYY
    /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[\.|\s]?\s+(\d{1,2})(?:st|nd|rd|th)?[,|\s]?\s*(\d{2,4})\b/gi,
    // DD Month YYYY
    /\b(\d{1,2})(?:st|nd|rd|th)?[\s|\,]+(?:of\s+)?(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[,|\s]?\s*(\d{2,4})\b/gi
  ];

  let match;
  let potentialDates = [];

  // Check each date pattern
  for (const pattern of datePatterns) {
    while ((match = pattern.exec(text)) !== null) {
      try {
        // Try to construct a date from the matched pattern
        let dateObj;
        if (pattern.source.startsWith('\\b(\\d{1,2})')) {
          // First pattern: MM/DD/YYYY or DD/MM/YYYY
          // We'll try both interpretations
          const part1 = parseInt(match[1]);
          const part2 = parseInt(match[2]);
          const year = match[3].length === 2 ? 2000 + parseInt(match[3]) : parseInt(match[3]);
          
          // Try as MM/DD/YYYY
          if (part1 <= 12) {
            dateObj = new Date(year, part1 - 1, part2);
            if (!isNaN(dateObj.getTime())) {
              potentialDates.push(dateObj);
            }
          }
          
          // Try as DD/MM/YYYY
          if (part2 <= 12) {
            dateObj = new Date(year, part2 - 1, part1);
            if (!isNaN(dateObj.getTime())) {
              potentialDates.push(dateObj);
            }
          }
        } else if (pattern.source.includes('January|February|March')) {
          // Month name patterns
          const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december", "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
          
          let month, day, year;
          
          if (pattern.source.startsWith('\\b(January|February')) {
            // Month DD, YYYY pattern
            const monthName = match[1].toLowerCase();
            month = monthNames.indexOf(monthName) % 12;
            day = parseInt(match[2]);
            year = parseInt(match[3]);
          } else {
            // DD Month YYYY pattern
            day = parseInt(match[1]);
            const monthName = match[2].toLowerCase();
            month = monthNames.indexOf(monthName) % 12;
            year = parseInt(match[3]);
          }
          
          // Handle short year format
          if (year < 100) {
            year += 2000;
          }
          
          dateObj = new Date(year, month, day);
          if (!isNaN(dateObj.getTime())) {
            potentialDates.push(dateObj);
          }
        }
      } catch (e) {
        console.error("Date parsing error:", e);
      }
    }
  }
  
  // Return the most likely date (usually the first future date)
  const now = new Date();
  
  // First look for future dates
  const futureDates = potentialDates.filter(date => date > now);
  if (futureDates.length > 0) {
    return futureDates[0];
  }
  
  // If no future dates, return the most recent date
  if (potentialDates.length > 0) {
    potentialDates.sort((a, b) => b.getTime() - a.getTime());
    return potentialDates[0];
  }
  
  return null;
};

// Function to extract location information from text
export const extractLocation = (text: string): string | null => {
  // Look for location indicators followed by potential place names
  const locationPatterns = [
    /(?:location|place|venue|address|at)[\s\:]+([A-Za-z0-9\s\.,'\-]+(?:Road|Street|Avenue|Lane|Blvd|Boulevard|Drive|Place|Plaza|Square|Building|Center|Centre|Room|Hall|Park|Restaurant|Cafe|Hotel|Resort|Mall))/i,
    /(?:held at|located at|taking place at)[\s\:]+([A-Za-z0-9\s\.,'\-]+)/i,
    /(?:at the)[\s]+([A-Za-z0-9\s\.,'\-]+(?:Road|Street|Avenue|Lane|Blvd|Boulevard|Drive|Place|Plaza|Square|Building|Center|Centre|Room|Hall|Park|Restaurant|Cafe|Hotel|Resort|Mall))/i
  ];
  
  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Clean up the location string
      let location = match[1].trim();
      
      // Limit length and remove trailing punctuation
      location = location.replace(/[.,;:]+$/, '');
      
      if (location.length > 100) {
        location = location.substring(0, 97) + '...';
      }
      
      return location;
    }
  }
  
  return null;
};

// Function to detect the most likely language of text
export const detectLanguage = (text: string): string => {
  // This is a simple implementation. In a production environment,
  // you would want to use a more robust language detection library
  
  // Common words in different languages
  const languageMarkers = {
    english: ['the', 'and', 'to', 'of', 'a', 'in', 'that', 'is', 'for', 'on', 'with'],
    spanish: ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'por', 'con'],
    french: ['le', 'la', 'de', 'et', 'à', 'en', 'un', 'être', 'que', 'pour', 'dans'],
    german: ['der', 'die', 'das', 'und', 'zu', 'in', 'den', 'von', 'für', 'nicht', 'mit']
  };
  
  // Convert text to lowercase and split into words
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  
  // Count occurrences of marker words for each language
  const scores = {
    english: 0,
    spanish: 0,
    french: 0,
    german: 0
  };
  
  for (const word of words) {
    for (const [language, markers] of Object.entries(languageMarkers)) {
      if (markers.includes(word)) {
        scores[language]++;
      }
    }
  }
  
  // Find the language with the highest score
  let maxScore = 0;
  let detectedLanguage = 'english'; // Default to English
  
  for (const [language, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedLanguage = language;
    }
  }
  
  return detectedLanguage;
};

// Export the main image analysis function
export const analyzeImage = async (imageData: string, fileName?: string): Promise<AnalysisResult> => {
  // Determine file type
  const fileType = getFileType(imageData, fileName);
  
  // Extract text if possible (would use OCR in a real implementation)
  const extractedText = await mockExtractText(imageData);
  
  // Determine document type based on extracted text
  const docType = analyzeText(extractedText);
  
  // Map document type to category
  const category = mapDocumentTypeToCategory(docType);
  
  // Generate tags based on document type
  const tags = generateTagsFromDocumentType(docType);
  
  // Suggest a title based on content
  const title = suggestTitle(extractedText, docType);
  
  // Extract date if available
  const eventDate = extractEventDate(extractedText);
  
  // Extract location if available
  const location = extractLocation(extractedText);
  
  // Create metadata object
  const metadata: Record<string, any> = {};
  if (eventDate) metadata.date = eventDate.toISOString().split('T')[0];
  if (location) metadata.location = location;
  
  // Detect language
  metadata.language = detectLanguage(extractedText);
  
  return {
    title,
    category,
    tags,
    description: extractedText.substring(0, 150),
    date: eventDate ? eventDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    extractedText,
    metadata
  };
};

export const getFileType = (
  fileData: string, 
  fileName?: string
): 'image' | 'pdf' | 'document' | 'unknown' => {
  // Check file data signature
  if (fileData.startsWith('data:image/')) {
    return 'image';
  } else if (fileData.startsWith('data:application/pdf')) {
    return 'pdf';
  } else if (
    fileData.startsWith('data:application/msword') || 
    fileData.startsWith('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document') ||
    fileData.startsWith('data:text/plain')
  ) {
    return 'document';
  }
  
  // Check file extension if available
  if (fileName) {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) {
      return 'image';
    } else if (extension === 'pdf') {
      return 'pdf';
    } else if (['doc', 'docx', 'txt', 'rtf'].includes(extension || '')) {
      return 'document';
    }
  }
  
  return 'unknown';
};

// Mock function to extract text - in a real app this would use OCR services
const mockExtractText = async (imageData: string): Promise<string> => {
  // Simple mock based on image hash to return different texts for testing
  const hash = Array.from(imageData.substring(0, 100)).reduce(
    (h, c) => Math.imul(31, h) + c.charCodeAt(0) | 0, 0
  );
  
  // Sample texts for different document types
  const sampleTexts = [
    "Team Meeting\nDate: May 15, 2025\nTime: 10:00 AM\nLocation: Conference Room A\n\nAgenda:\n1. Project updates\n2. Budget review\n3. Q&A",
    "Chocolate Chip Cookies Recipe\n\nIngredients:\n- 2 1/4 cups flour\n- 1 tsp baking soda\n- 1 cup butter\n- 3/4 cup sugar\n- 3/4 cup brown sugar\n- 2 eggs\n- 2 cups chocolate chips\n\nBake at 375°F for 10-12 minutes.",
    "Summer Outfit Ideas\n\n- Light blue linen shirt with white shorts\n- Floral sundress with sandals\n- White t-shirt with navy chino shorts\n- Striped tee with denim shorts",
    "Paris Travel Itinerary\nDay 1: Eiffel Tower & Louvre\nDay 2: Notre Dame & Seine Cruise\nDay 3: Versailles\nHotel: Grand Paris Hotel\nFlight: AA123 on June 15th",
    "Full Body Workout\n\n1. Squats - 3 sets x 12 reps\n2. Push-ups - 3 sets x 10 reps\n3. Lunges - 3 sets x 10 per leg\n4. Plank - 3 x 60 seconds"
  ];
  
  // Delay to simulate processing time
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return sampleTexts[Math.abs(hash) % sampleTexts.length];
};
