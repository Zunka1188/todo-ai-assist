
import { DocumentResult, DocumentType, DetectionOptions } from './types';

/**
 * Document Classifier Module
 * Handles classification and analysis of document types from images
 */
export class DocumentClassifier {
  /**
   * Detect and classify documents from an image
   */
  static async classifyDocument(
    imageData: string,
    options: DetectionOptions = {}
  ): Promise<DocumentResult | null> {
    try {
      console.log('Classifying document type from image...');
      
      // This is a mock implementation - in a real app, this would use
      // OCR and document analysis tools or APIs
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, randomly detect a document or return null (higher detection rate now)
      const detected = Math.random() > 0.1;
      if (!detected) return null;
      
      // If there's a preferred document type in options, use that
      let documentType: DocumentType;
      if (options.preferredType === 'document' && options.language) {
        documentType = options.language as DocumentType;
      } else {
        documentType = this.getMockDocumentType();
      }
      
      // Extract mock text and metadata based on document type
      const { extractedText, metadata } = this.generateMockDocumentData(documentType);
      
      return {
        type: 'document',
        documentType,
        extractedText: options.enableOCR !== false ? extractedText : undefined,
        metadata,
        confidence: 0.75 + Math.random() * 0.2,
        timestamp: new Date().toISOString(),
        rawImageData: options.includeRawImage ? imageData : undefined
      };
    } catch (error) {
      console.error('Document classification error:', error);
      return null;
    }
  }
  
  /**
   * Get a random document type for mock data - now expanded with more categories
   */
  private static getMockDocumentType(): DocumentType {
    const types: DocumentType[] = [
      // Original types
      'invitation', 'receipt', 'invoice', 'resume', 'flyer', 'letter', 'document',
      // Expanded types to match our new categories
      'outfit', 'clothing', 'fashion', 'recipe', 'food', 'travel', 'destination',
      'fitness', 'workout', 'exercise', 'event', 'party'
    ];
    return types[Math.floor(Math.random() * types.length)];
  }
  
  /**
   * Generate mock document data based on type
   */
  private static generateMockDocumentData(documentType: DocumentType): { 
    extractedText: string; 
    metadata: Record<string, any>; 
  } {
    switch (documentType) {
      case 'invitation':
        return {
          extractedText: `You're Invited!\n\nJohn & Sarah's Wedding\nSaturday, June 15, 2025\n3:00 PM\n\nThe Grand Venue\n123 Celebration Dr.\nNew York, NY 10001\n\nRSVP by May 1st\ncontact@example.com`,
          metadata: {
            eventType: 'Wedding',
            hosts: ['John', 'Sarah'],
            date: '2025-06-15',
            time: '15:00',
            location: 'The Grand Venue, 123 Celebration Dr., New York, NY 10001',
            rsvpDeadline: '2025-05-01',
            contactEmail: 'contact@example.com'
          }
        };
        
      case 'receipt':
        return {
          extractedText: `GROCERY STORE\n123 Market St.\nCity, State 12345\n\nDATE: 04/03/2025\nTIME: 14:35\n\nApples      $4.99\nBread       $3.50\nMilk        $2.99\n\nSubtotal    $11.48\nTax (8%)     $0.92\n\nTOTAL       $12.40\n\nTHANK YOU FOR SHOPPING!`,
          metadata: {
            vendor: 'Grocery Store',
            date: '2025-04-03',
            time: '14:35',
            items: [
              { name: 'Apples', price: 4.99 },
              { name: 'Bread', price: 3.50 },
              { name: 'Milk', price: 2.99 }
            ],
            subtotal: 11.48,
            tax: 0.92,
            total: 12.40
          }
        };
        
      case 'invoice':
        return {
          extractedText: `INVOICE\nInvoice #: INV-2025-04-123\nDate: April 3, 2025\n\nFrom: ABC Services Inc.\nTo: XYZ Corporation\n\nServices Rendered:\nConsulting (10 hrs)    $1,500.00\nMaterials              $350.00\n\nTotal Due: $1,850.00\n\nPayment due within 30 days.`,
          metadata: {
            invoiceNumber: 'INV-2025-04-123',
            date: '2025-04-03',
            vendor: 'ABC Services Inc.',
            client: 'XYZ Corporation',
            items: [
              { description: 'Consulting (10 hrs)', amount: 1500.00 },
              { description: 'Materials', amount: 350.00 }
            ],
            total: 1850.00,
            paymentTerms: '30 days'
          }
        };

      case 'outfit':
      case 'clothing':
      case 'fashion':
        return {
          extractedText: `Summer Collection 2025\n\nWhite linen shirt\nBeige tailored shorts\nStraw hat\nLeather sandals\n\nPerfect for beach vacations and summer outings.`,
          metadata: {
            category: 'style',
            season: 'Summer',
            items: [
              'White linen shirt',
              'Beige tailored shorts',
              'Straw hat',
              'Leather sandals'
            ],
            occasion: 'Beach, Casual',
            imageObjects: ['clothing', 'fashion', 'summer wear']
          }
        };

      case 'recipe':
      case 'food':
        return {
          extractedText: `Classic Chocolate Chip Cookies\n\nIngredients:\n2 1/4 cups all-purpose flour\n1 tsp baking soda\n1 tsp salt\n1 cup butter, softened\n3/4 cup granulated sugar\n3/4 cup packed brown sugar\n2 large eggs\n2 tsp vanilla extract\n2 cups chocolate chips\n\nInstructions:\n1. Preheat oven to 375°F\n2. Mix flour, baking soda, and salt\n3. Cream butter and sugars\n4. Add eggs and vanilla\n5. Gradually add flour mixture\n6. Stir in chocolate chips\n7. Drop by rounded tablespoons onto baking sheets\n8. Bake 9-11 minutes until golden brown`,
          metadata: {
            category: 'recipes',
            type: 'Dessert',
            prepTime: '15 minutes',
            cookTime: '10 minutes',
            servings: 24,
            items: [
              'all-purpose flour', 
              'baking soda',
              'salt',
              'butter',
              'granulated sugar',
              'brown sugar',
              'eggs',
              'vanilla extract',
              'chocolate chips'
            ],
            imageObjects: ['food', 'baking', 'cookies', 'dessert']
          }
        };

      case 'travel':
      case 'destination':
        return {
          extractedText: `Travel Itinerary\n\nJapan Adventure - October 2025\n\nDay 1-3: Tokyo\n- Tokyo Tower\n- Shibuya Crossing\n- Meiji Shrine\n\nDay 4-6: Kyoto\n- Kinkaku-ji (Golden Pavilion)\n- Fushimi Inari Shrine\n- Arashiyama Bamboo Grove\n\nDay 7-8: Osaka\n- Osaka Castle\n- Dotonbori\n- Universal Studios Japan\n\nAccommodations:\nTokyo: Park Hotel Tokyo\nKyoto: Ryokan Yoshida-Sanso\nOsaka: Hotel Nikko Osaka`,
          metadata: {
            category: 'travel',
            destination: 'Japan',
            dates: '2025-10-01 to 2025-10-08',
            cities: ['Tokyo', 'Kyoto', 'Osaka'],
            attractions: [
              'Tokyo Tower',
              'Shibuya Crossing',
              'Meiji Shrine',
              'Kinkaku-ji',
              'Fushimi Inari Shrine',
              'Arashiyama Bamboo Grove',
              'Osaka Castle',
              'Dotonbori',
              'Universal Studios Japan'
            ],
            imageObjects: ['landscape', 'destination', 'travel', 'landmark']
          }
        };

      case 'fitness':
      case 'workout':
      case 'exercise':
        return {
          extractedText: `Weekly Workout Plan\n\nMonday: Upper Body\n- Bench press: 3 sets x 10 reps\n- Pull-ups: 3 sets x 8 reps\n- Shoulder press: 3 sets x 12 reps\n- Bicep curls: 3 sets x 15 reps\n\nTuesday: Lower Body\n- Squats: 4 sets x 10 reps\n- Deadlifts: 3 sets x 8 reps\n- Lunges: 3 sets x 12 reps per leg\n- Calf raises: 3 sets x 20 reps\n\nWednesday: Rest day\n\nThursday: HIIT\n- 30 min high intensity interval training\n\nFriday: Full Body\n- Circuit training: 3 rounds\n\nSaturday/Sunday: Active recovery\n- Walking, swimming, or light yoga`,
          metadata: {
            category: 'fitness',
            type: 'Weekly Plan',
            workoutDays: 4,
            restDays: 3,
            focus: ['Strength', 'Endurance', 'Recovery'],
            equipment: ['Dumbbells', 'Barbell', 'Bodyweight'],
            imageObjects: ['gym', 'workout', 'fitness', 'exercise equipment']
          }
        };

      case 'event':
      case 'party':
      case 'flyer':
        return {
          extractedText: `SUMMER MUSIC FESTIVAL\n\nJuly 15-17, 2025\nRiverside Park\nGates open at 12pm daily\n\nFEATURING:\n- The Sound Waves\n- Electric Dreams\n- Lunar Echo\n- Rhythm Republic\n- And 20+ more artists!\n\nFood trucks, art installations, and games\n\nTickets: $89 single-day / $199 weekend pass\nVIP packages available\n\nGet tickets at www.summerfest.example.com`,
          metadata: {
            category: 'events',
            eventType: 'Festival',
            title: 'Summer Music Festival',
            date: '2025-07-15',
            endDate: '2025-07-17',
            location: 'Riverside Park',
            performers: [
              'The Sound Waves',
              'Electric Dreams',
              'Lunar Echo',
              'Rhythm Republic'
            ],
            ticketPrice: {
              singleDay: 89,
              weekend: 199
            },
            imageObjects: ['event', 'festival', 'concert', 'crowd']
          }
        };
        
      default:
        return {
          extractedText: `Document content extracted via OCR would appear here. This is placeholder text to simulate the extraction of content from a ${documentType}.`,
          metadata: {
            type: documentType,
            pageCount: Math.floor(Math.random() * 10) + 1,
            dateDetected: new Date().toISOString().split('T')[0],
            estimatedWordCount: Math.floor(Math.random() * 500) + 100,
            category: 'other'
          }
        };
    }
  }
}
