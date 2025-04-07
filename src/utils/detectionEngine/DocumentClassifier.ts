/**
 * DocumentClassifier
 * Analyzes images/documents and classifies them into appropriate categories
 */
export class DocumentClassifier {
  /**
   * Classify a document based on image analysis
   */
  static async classifyDocument(
    imageData: string, 
    options: DetectionOptions = {}
  ): Promise<DocumentResult | null> {
    try {
      console.log('Classifying document...');
      
      // Extract text from image using OCR if enabled
      let extractedText = '';
      if (options.enableOCR !== false) {
        extractedText = await DocumentClassifier.performOCR(imageData);
        console.log('OCR text extracted:', extractedText.substring(0, 100) + '...');
      }
      
      // Analyze visual elements in the image
      const visualFeatures = await DocumentClassifier.detectVisualFeatures(imageData);
      console.log('Visual features detected:', visualFeatures);
      
      // Determine document type based on both text and visual features
      const documentType = DocumentClassifier.determineDocumentType(extractedText, visualFeatures);
      console.log('Document type determined:', documentType);
      
      // Calculate confidence level
      const confidence = DocumentClassifier.calculateConfidence(documentType, extractedText, visualFeatures);
      
      // Collect metadata
      const metadata = DocumentClassifier.extractMetadata(extractedText, documentType);
      
      // Create result
      const result: DocumentResult = {
        type: 'document',
        documentType,
        confidence,
        timestamp: new Date().toISOString(),
        extractedText: options.includeRawImage ? extractedText : undefined,
        rawImageData: options.includeRawImage ? imageData : undefined,
        metadata
      };
      
      return result;
    } catch (error) {
      console.error('Document classification error:', error);
      return null;
    }
  }
  
  /**
   * Perform OCR on image to extract text content
   * This is a mock implementation - in a real app this would call a proper OCR service
   */
  private static async performOCR(imageData: string): Promise<string> {
    // In a real implementation, this would call a proper OCR service
    // For demo purposes, we'll return a sample text based on image hash
    
    // Create a simple hash of the image data to use for demo text selection
    const hash = Array.from(imageData).reduce((h, c) => {
      return Math.imul(31, h) + c.charCodeAt(0) | 0;
    }, 0);
    
    // Sample texts for different document types
    const sampleTexts = [
      // Recipe samples
      "Classic Apple Pie Recipe\n\nIngredients:\n- 2 pie crusts\n- 6 cups thinly sliced apples\n- 3/4 cup sugar\n- 2 tbsp flour\n- 3/4 tsp cinnamon\n\nInstructions:\n1. Preheat oven to 425°F\n2. Mix ingredients\n3. Pour into pie crust\n4. Bake for 40 minutes",
      
      // Outfit samples
      "Summer Outfit Idea\n\nLight blue linen shirt\nWhite chino shorts\nBrown leather sandals\nStraw hat (optional)\n\nPerfect for beach days or casual summer parties!",
      
      // Event invitation
      "You're Invited!\n\nJoin us to celebrate Mark's 30th Birthday\nSaturday, June 15th, 2023\n8:00 PM\nAt The Rooftop Lounge\n123 Party Street\nPlease RSVP by June 1st",
      
      // Fitness workout
      "Full Body Workout\n\n1. Squats - 3 sets x 12 reps\n2. Push-ups - 3 sets x 10 reps\n3. Lunges - 3 sets x 10 reps per leg\n4. Plank - 3 sets x 45 seconds\n\nRest 60 seconds between sets\nComplete 3 times per week",
      
      // Travel itinerary
      "Paris Trip Itinerary\n\nDay 1: Eiffel Tower & Louvre Museum\nDay 2: Notre Dame & Seine River Cruise\nDay 3: Versailles Day Trip\n\nHotel: Grand Paris Hotel\nAddress: 123 Champs-Élysées\nCheck-in: 3pm, June 10th",
      
      // Resume document
      "PROFESSIONAL RESUME\n\nJohn Smith\nSoftware Developer\n\nEXPERIENCE\nSenior Developer - Tech Corp (2018-Present)\nJunior Developer - Startup Inc (2015-2018)\n\nEDUCATION\nB.S. Computer Science, University of Technology",
      
      // Invoice
      "INVOICE #12345\nDate: March 15, 2023\n\nTO: Client Company Inc.\n\nDescription: Website Development Services\nAmount: $2,500.00\nDue Date: April 15, 2023\n\nPayment Methods: Bank Transfer, Credit Card",
    ];
    
    // Select a sample text based on image hash
    const selectedText = sampleTexts[Math.abs(hash) % sampleTexts.length];
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return selectedText;
  }
  
  /**
   * Detect visual features in the image
   * This is a mock implementation
   */
  private static async detectVisualFeatures(imageData: string): Promise<string[]> {
    // In a real implementation, this would use computer vision APIs or ML models
    // For demo purposes, we'll return random features
    
    const allFeatures = [
      // Food & Recipe related
      'plate', 'food', 'kitchen', 'ingredients', 'cooking',
      
      // Clothing & Style related
      'clothing', 'outfit', 'fashion', 'shirt', 'dress', 'shoes',
      
      // Travel related
      'landscape', 'beach', 'mountain', 'city', 'landmark', 'hotel',
      
      // Fitness related
      'gym', 'exercise', 'workout', 'fitness', 'weights', 'running',
      
      // Event related
      'party', 'celebration', 'invitation', 'event', 'wedding', 'birthday',
      
      // Document related
      'text', 'document', 'form', 'table', 'chart', 'signature',
    ];
    
    // Create a simple hash of the image data
    const hash = Array.from(imageData).reduce((h, c) => {
      return Math.imul(31, h) + c.charCodeAt(0) | 0;
    }, 0);
    
    // Determine number of features to return (2-5)
    const numFeatures = 2 + (Math.abs(hash) % 4);
    
    // Select features based on hash
    const selectedFeatures: string[] = [];
    let seedValue = Math.abs(hash);
    
    for (let i = 0; i < numFeatures; i++) {
      // Use a different seed for each selection
      seedValue = (seedValue * 9301 + 49297) % 233280;
      const index = seedValue % allFeatures.length;
      
      // Avoid duplicates
      if (!selectedFeatures.includes(allFeatures[index])) {
        selectedFeatures.push(allFeatures[index]);
      }
    }
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return selectedFeatures;
  }
  
  /**
   * Determine document type based on text content and visual features
   */
  private static determineDocumentType(text: string, visualFeatures: string[]): DocumentType {
    const lowerText = text.toLowerCase();
    
    // Check text content for specific keywords
    
    // Recipe indicators
    if (lowerText.includes('recipe') || 
        lowerText.includes('ingredients') || 
        lowerText.includes('instructions') || 
        lowerText.includes('bake') || 
        lowerText.includes('cook') ||
        visualFeatures.some(f => ['food', 'plate', 'ingredients', 'kitchen'].includes(f))) {
      return 'recipe';
    }
    
    // Outfit/clothing indicators
    if (lowerText.includes('outfit') || 
        lowerText.includes('wear') || 
        lowerText.includes('fashion') ||
        visualFeatures.some(f => ['clothing', 'outfit', 'fashion', 'dress', 'shirt', 'shoes'].includes(f))) {
      return 'clothing';
    }
    
    // Travel indicators
    if (lowerText.includes('trip') || 
        lowerText.includes('travel') || 
        lowerText.includes('vacation') ||
        lowerText.includes('itinerary') || 
        lowerText.includes('hotel') ||
        visualFeatures.some(f => ['landscape', 'beach', 'mountain', 'city', 'landmark', 'hotel'].includes(f))) {
      return 'travel';
    }
    
    // Fitness indicators
    if (lowerText.includes('workout') || 
        lowerText.includes('exercise') || 
        lowerText.includes('fitness') ||
        lowerText.includes('gym') ||
        visualFeatures.some(f => ['gym', 'exercise', 'workout', 'fitness', 'weights', 'running'].includes(f))) {
      return 'fitness';
    }
    
    // Event indicators
    if (lowerText.includes('invited') || 
        lowerText.includes('invitation') || 
        lowerText.includes('celebration') ||
        lowerText.includes('party') ||
        lowerText.includes('rsvp') ||
        visualFeatures.some(f => ['party', 'celebration', 'invitation', 'event', 'wedding', 'birthday'].includes(f))) {
      return 'event';
    }
    
    // Document type indicators
    if (lowerText.includes('resume') || 
        lowerText.includes('cv') || 
        lowerText.includes('invoice') ||
        lowerText.includes('receipt')) {
      
      if (lowerText.includes('invoice')) return 'invoice';
      if (lowerText.includes('receipt')) return 'receipt';
      if (lowerText.includes('resume') || lowerText.includes('cv')) return 'resume';
    }
    
    // Check if it looks like a formal letter
    if ((lowerText.includes('dear') && lowerText.includes('sincerely')) ||
        (lowerText.includes('dear') && lowerText.includes('regards')) ||
        (lowerText.includes('to whom it may concern'))) {
      return 'letter';
    }
    
    // If no specific type matches, but it contains substantial text, classify as general document
    if (text.length > 100) {
      return 'document';
    }
    
    // Default to document for anything else
    return 'document';
  }
  
  /**
   * Calculate confidence level for document classification
   */
  private static calculateConfidence(documentType: DocumentType, text: string, visualFeatures: string[]): number {
    let confidence = 0.7; // Base confidence
    
    // Adjust based on text length
    if (text.length > 200) confidence += 0.05;
    if (text.length > 500) confidence += 0.05;
    
    // Adjust based on visual features
    const relevantFeatures = {
      'recipe': ['food', 'plate', 'ingredients', 'kitchen', 'cooking'],
      'clothing': ['clothing', 'outfit', 'fashion', 'dress', 'shirt', 'shoes'],
      'travel': ['landscape', 'beach', 'mountain', 'city', 'landmark', 'hotel'],
      'fitness': ['gym', 'exercise', 'workout', 'fitness', 'weights', 'running'],
      'event': ['party', 'celebration', 'invitation', 'event', 'wedding', 'birthday'],
      'document': ['text', 'document', 'form', 'table', 'chart', 'signature'],
      'invoice': ['invoice', 'table', 'form', 'total', 'amount', 'document'],
      'receipt': ['receipt', 'total', 'amount', 'document', 'table'],
      'resume': ['document', 'text', 'form', 'resume', 'cv'],
      'letter': ['document', 'text', 'letter'],
      'party': ['party', 'celebration', 'event'],
      'invitation': ['invitation', 'event', 'celebration']
    };
    
    // Count how many relevant features for this document type are present
    const typeFeatures = relevantFeatures[documentType] || [];
    const matchingFeatures = visualFeatures.filter(f => typeFeatures.includes(f));
    
    // Increase confidence based on matching features (up to 0.2 additional confidence)
    confidence += Math.min(0.2, matchingFeatures.length * 0.05);
    
    // Ensure confidence is in valid range [0-1]
    return Math.min(0.98, Math.max(0.5, confidence));
  }
  
  /**
   * Extract metadata from document text
   */
  private static extractMetadata(text: string, documentType: DocumentType): Record<string, any> {
    const metadata: Record<string, any> = {};
    const lowerText = text.toLowerCase();
    
    // Extract based on document type
    switch(documentType) {
      case 'recipe':
        metadata.ingredients = DocumentClassifier.extractIngredients(text);
        metadata.cookTime = DocumentClassifier.extractCookingTime(text);
        metadata.servings = DocumentClassifier.extractServings(text);
        break;
        
      case 'clothing':
      case 'outfit':
      case 'fashion':
        metadata.items = DocumentClassifier.extractClothingItems(text);
        metadata.occasion = DocumentClassifier.extractOccasion(text);
        metadata.season = DocumentClassifier.extractSeason(text);
        break;
        
      case 'travel':
      case 'destination':
        metadata.location = DocumentClassifier.extractTravelLocation(text);
        metadata.dates = DocumentClassifier.extractDateRange(text);
        metadata.activities = DocumentClassifier.extractActivities(text);
        break;
        
      case 'fitness':
      case 'workout':
      case 'exercise':
        metadata.exercises = DocumentClassifier.extractExercises(text);
        metadata.duration = DocumentClassifier.extractDuration(text);
        metadata.intensity = DocumentClassifier.extractIntensity(text);
        break;
        
      case 'event':
      case 'party':
      case 'invitation':
        metadata.eventType = DocumentClassifier.extractEventType(text);
        metadata.date = DocumentClassifier.extractDate(text);
        metadata.location = DocumentClassifier.extractLocation(text);
        metadata.host = DocumentClassifier.extractHost(text);
        break;
        
      case 'invoice':
      case 'receipt':
        metadata.total = DocumentClassifier.extractAmount(text);
        metadata.date = DocumentClassifier.extractDate(text);
        metadata.vendor = DocumentClassifier.extractVendor(text);
        metadata.items = DocumentClassifier.extractLineItems(text);
        break;
        
      case 'resume':
        metadata.name = DocumentClassifier.extractName(text);
        metadata.skills = DocumentClassifier.extractSkills(text);
        metadata.experience = DocumentClassifier.extractYearsExperience(text);
        break;
    }
    
    return metadata;
  }
  
  // Various extraction helper methods - these would use more sophisticated
  // NLP techniques in a real implementation
  
  private static extractIngredients(text: string): string[] {
    const ingredients: string[] = [];
    const lines = text.split('\n');
    
    // Look for ingredient section
    let inIngredientsSection = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if we're entering an ingredients section
      if (trimmedLine.toLowerCase().includes('ingredient')) {
        inIngredientsSection = true;
        continue;
      }
      
      // Check if we're leaving the ingredients section
      if (inIngredientsSection && 
          (trimmedLine.toLowerCase().includes('instruction') || 
           trimmedLine.toLowerCase().includes('direction') ||
           trimmedLine.toLowerCase().includes('method'))) {
        inIngredientsSection = false;
        continue;
      }
      
      // If in ingredients section and line starts with a bullet or number
      if (inIngredientsSection && 
          (trimmedLine.match(/^[\-\*\•]/) || 
           trimmedLine.match(/^\d+[\.\)]/) ||
           trimmedLine.match(/^[a-zA-Z\d][\.\)]/) ||
           trimmedLine.includes(' - '))) {
        ingredients.push(trimmedLine.replace(/^[\-\*\•\d\.\)\s]+/, '').trim());
      }
    }
    
    return ingredients.slice(0, 10); // Limit to top 10
  }
  
  private static extractCookingTime(text: string): string | null {
    const lowerText = text.toLowerCase();
    
    // Look for cooking or baking time
    const timeRegex = /\b(\d+)[\s-]*(min|minute|hour|hr|h|m)\w*\b/i;
    const cookRegex = /\b(?:cook|bake|prep|preparation|total|time)\w*[\s\:]*(\d+)[\s-]*(min|minute|hour|hr|h|m)\w*\b/i;
    
    // First try to find cooking specific time
    const cookMatch = lowerText.match(cookRegex);
    if (cookMatch) {
      return `${cookMatch[1]} ${cookMatch[2]}`;
    }
    
    // If no specific cook time, look for any time
    const timeMatch = lowerText.match(timeRegex);
    if (timeMatch) {
      return `${timeMatch[1]} ${timeMatch[2]}`;
    }
    
    return null;
  }
  
  private static extractServings(text: string): number | null {
    const lowerText = text.toLowerCase();
    
    // Look for servings information
    const servingsRegex = /\b(?:serv\w*|yield|portion|make)[\s\:]*(\d+)\b/i;
    const match = lowerText.match(servingsRegex);
    
    if (match) {
      return parseInt(match[1]);
    }
    
    return null;
  }
  
  private static extractClothingItems(text: string): string[] {
    const clothingItems = ['shirt', 'pants', 'dress', 'skirt', 'jacket', 'coat', 'sweater',
                        'jeans', 'shorts', 'shoes', 'boots', 'sandals', 'heels', 'hat',
                        'scarf', 'gloves', 'socks', 'belt', 'tie', 'suit', 'blazer',
                        'blouse', 't-shirt', 'tee', 'top'];
    
    const result: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      for (const item of clothingItems) {
        if (lowerLine.includes(item) && !result.includes(line.trim())) {
          result.push(line.trim());
          break;
        }
      }
    }
    
    return result;
  }
  
  private static extractOccasion(text: string): string | null {
    const lowerText = text.toLowerCase();
    
    const occasions = ['casual', 'formal', 'business', 'party', 'wedding', 'date', 
                      'interview', 'work', 'beach', 'office', 'outdoor', 'workout'];
    
    for (const occasion of occasions) {
      if (lowerText.includes(occasion)) {
        return occasion;
      }
    }
    
    return null;
  }
  
  private static extractSeason(text: string): string | null {
    const lowerText = text.toLowerCase();
    
    const seasons = ['spring', 'summer', 'fall', 'autumn', 'winter'];
    
    for (const season of seasons) {
      if (lowerText.includes(season)) {
        return season;
      }
    }
    
    return null;
  }
  
  private static extractTravelLocation(text: string): string | null {
    // Extract location information from travel text
    const locationRegex = /\b(?:in|to|at|visit|destination|going to|staying in)[\s\:]*([A-Z][a-zA-Z\s]{2,}(?:City|Beach|Island|Mountain|Park|Resort|Hotel))\b/;
    
    const match = text.match(locationRegex);
    if (match) {
      return match[1];
    }
    
    return null;
  }
  
  private static extractDateRange(text: string): { start: string | null, end: string | null } {
    const dateRegex = /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b/g;
    const matches = [...text.matchAll(dateRegex)];
    
    if (matches.length >= 2) {
      return {
        start: matches[0][0],
        end: matches[1][0]
      };
    } else if (matches.length === 1) {
      return {
        start: matches[0][0],
        end: null
      };
    }
    
    return {
      start: null,
      end: null
    };
  }
  
  private static extractActivities(text: string): string[] {
    const activityIndicators = ['visit', 'tour', 'explore', 'see', 'experience', 'swim',
                             'hike', 'relax', 'enjoy', 'discover', 'adventure'];
    
    const activities: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      for (const indicator of activityIndicators) {
        if (lowerLine.includes(indicator)) {
          activities.push(line.trim());
          break;
        }
      }
    }
    
    return activities.slice(0, 5); // Limit to top 5
  }
  
  private static extractExercises(text: string): string[] {
    const exerciseKeywords = ['push', 'pull', 'squat', 'lunge', 'press', 'curl', 'raise',
                           'crunch', 'plank', 'row', 'deadlift', 'bench', 'jump',
                           'run', 'jog', 'sprint', 'walk', 'burpee', 'mountain'];
    
    const exercises: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Check for exercise patterns like "10 push-ups" or "Squats - 3 sets"
      for (const keyword of exerciseKeywords) {
        if (lowerLine.includes(keyword)) {
          exercises.push(line.trim());
          break;
        }
      }
      
      // Check for numbered exercises
      if (line.match(/^\d+[\.\)]/) && lowerLine.length < 100) {
        exercises.push(line.trim());
      }
    }
    
    return exercises.slice(0, 10); // Limit to top 10
  }
  
  private static extractDuration(text: string): string | null {
    const lowerText = text.toLowerCase();
    
    // Look for duration indicators
    const durationRegex = /\b(\d+)[\s-]*(min|minute|hour|hr|h|m)\w*\b/i;
    const match = lowerText.match(durationRegex);
    
    if (match) {
      return `${match[1]} ${match[2]}`;
    }
    
    return null;
  }
  
  private static extractIntensity(text: string): string | null {
    const lowerText = text.toLowerCase();
    
    const intensities = ['beginner', 'intermediate', 'advanced', 'high intensity', 
                       'low intensity', 'moderate', 'easy', 'hard', 'challenging'];
    
    for (const intensity of intensities) {
      if (lowerText.includes(intensity)) {
        return intensity;
      }
    }
    
    return null;
  }
  
  private static extractEventType(text: string): string | null {
    const lowerText = text.toLowerCase();
    
    const eventTypes = ['wedding', 'birthday', 'anniversary', 'graduation',
                      'baby shower', 'bridal shower', 'retirement', 'farewell',
                      'housewarming', 'holiday', 'party', 'dinner', 'lunch',
                      'meeting', 'conference', 'seminar', 'webinar'];
    
    for (const eventType of eventTypes) {
      if (lowerText.includes(eventType)) {
        return eventType;
      }
    }
    
    return null;
  }
  
  private static extractDate(text: string): string | null {
    const dateRegex = /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b/;
    const match = text.match(dateRegex);
    
    if (match) {
      return match[0];
    }
    
    const dateWords = /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[\.|\s]?\s+(\d{1,2})(?:st|nd|rd|th)?[,|\s]?\s*(\d{2,4})\b/i;
    const matchWords = text.match(dateWords);
    
    if (matchWords) {
      return matchWords[0];
    }
    
    return null;
  }
  
  private static extractLocation(text: string): string | null {
    // Look for location indicators
    const locationRegex = /\b(?:at|location|venue|place|address)[\s\:]+([A-Za-z0-9\s\.,'\-]+(?:Road|Street|Avenue|Lane|Blvd|Boulevard|Drive|Place|Plaza|Square|Building|Center|Centre|Room|Hall|Park))\b/i;
    
    const match = text.match(locationRegex);
    if (match) {
      return match[1].trim();
    }
    
    return null;
  }
  
  private static extractHost(text: string): string | null {
    // Look for host information
    const hostRegex = /\b(?:hosted by|host|organizer|from)[\s\:]+([A-Za-z\s\.]+)\b/i;
    
    const match = text.match(hostRegex);
    if (match) {
      return match[1].trim();
    }
    
    return null;
  }
  
  private static extractAmount(text: string): string | null {
    // Look for total amount indicators
    const amountRegex = /\b(?:total|amount|sum|balance|due|payable|cost|price)[\s\:]*[\$\€\£]?(\d+(?:\.\d{2})?)\b/i;
    
    const match = text.match(amountRegex);
    if (match) {
      return match[1];
    }
    
    // Look for currency symbols with numbers
    const currencyRegex = /[\$\€\£](\d+(?:\.\d{2})?)\b/;
    const currencyMatch = text.match(currencyRegex);
    
    if (currencyMatch) {
      return currencyMatch[1];
    }
    
    return null;
  }
  
  private static extractVendor(text: string): string | null {
    // Look for vendor/business name
    const vendorRegex = /\b(?:from|vendor|seller|merchant|business|company|store)[\s\:]+([A-Za-z\s\.]+)\b/i;
    
    const match = text.match(vendorRegex);
    if (match) {
      return match[1].trim();
    }
    
    return null;
  }
  
  private static extractLineItems(text: string): string[] {
    const items: string[] = [];
    const lines = text.split('\n');
    
    // Look for lines that might be invoice items
    // Usually contains product name with price
    const itemPattern = /(.{3,30})\s+[\$\€\£]?(\d+(?:\.\d{2})?)\b/;
    
    for (const line of lines) {
      const match = line.match(itemPattern);
      if (match) {
        items.push(line.trim());
      }
    }
    
    return items.slice(0, 10); // Limit to top 10
  }
  
  private static extractName(text: string): string | null {
    const lines = text.split('\n');
    
    // Usually the name appears at the top of a resume
    for (const line of lines.slice(0, 5)) {
      const trimmedLine = line.trim();
      
      // Look for a line that might be a name (2-3 words, capitalized)
      if (trimmedLine.match(/^[A-Z][a-zA-Z]+(\s+[A-Z][a-zA-Z]+){1,2}$/) && 
          !trimmedLine.toLowerCase().includes('resume') && 
          !trimmedLine.toLowerCase().includes('cv')) {
        return trimmedLine;
      }
    }
    
    return null;
  }
  
  private static extractSkills(text: string): string[] {
    const skills: string[] = [];
    const lowerText = text.toLowerCase();
    
    // Check if there's a skills section
    const skillsIdx = lowerText.indexOf('skills');
    
    if (skillsIdx !== -1) {
      // Get text after "skills"
      const skillsText = text.substring(skillsIdx);
      const lines = skillsText.split('\n');
      
      // Get the first few lines after "skills"
      for (let i = 1; i < Math.min(lines.length, 10); i++) {
        const line = lines[i].trim();
        
        // Stop if we hit another section
        if (line.toLowerCase().match(/^(education|experience|work|projects|references)/)) {
          break;
        }
        
        // Add non-empty lines as skills
        if (line && line.length > 2) {
          skills.push(line);
        }
      }
    }
    
    return skills;
  }
  
  private static extractYearsExperience(text: string): number | null {
    const lowerText = text.toLowerCase();
    
    // Look for years of experience
    const expRegex = /(\d+)[\s-]*(year|yr)s?\s+(?:of\s+)?experience/i;
    const match = lowerText.match(expRegex);
    
    if (match) {
      return parseInt(match[1]);
    }
    
    return null;
  }
}
