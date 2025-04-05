
import { DocumentType } from '@/utils/detectionEngine/types';
import { NavigateFunction } from 'react-router-dom';

// Define a type for the scan mode
export type CategoryOption = 'invitation' | 'receipt' | 'product' | 'document' | 'unknown' | 'general';

/**
 * Generate mock extracted text based on document type
 */
export const generateMockExtractedText = (documentType: string | null): string => {
  switch (documentType) {
    case 'invitation':
      return `TEAM OFFSITE MEETING\nDate: May 15, 2025\nTime: 10:00 AM - 4:00 PM\nLocation: Conference Room A, Building 2\n\nOrganizer: Sarah Johnson\nsarah.j@company.com\n\nQuarterly team meeting. Bring your presentation materials.`;
    case 'receipt':
      return `GREEN GROCERS\n123 Main Street\nCity, State 12345\n\nDate: 04/03/2025\nTime: 14:35\n\nApples      $4.99\nBread       $3.50\nMilk        $2.99\n\nSubtotal    $11.48\nTax (8%)     $0.92\n\nTOTAL       $12.40\n\nTHANK YOU FOR SHOPPING!`;
    case 'product':
      return `Organic Avocados\n2 count package\n\nPrice: $5.99\nCategory: Groceries\n\nFresh organic avocados, perfect for guacamole.\n\nNutrition Facts:\nServing Size: 1 avocado\nCalories: 240\nTotal Fat: 22g`;
    case 'document':
      return `MEETING MINUTES\n\nDate: April 10, 2025\nSubject: Product Launch Planning\n\nAttendees:\n- John Smith (Chair)\n- Jane Doe\n- Alex Johnson\n\nDiscussion Items:\n1. Marketing strategy for Q2\n2. Budget allocation\n3. Timeline for upcoming product launch`;
    default:
      return `TEXT DETECTION\nThis is a sample of detected text\nThe AI system would extract\nall visible text from the image\nand format it appropriately.`;
  }
};

/**
 * Generate mock detected objects based on document type
 */
export const generateDetectedObjects = (documentType: string | null) => {
  const objects = [];
  
  switch (documentType) {
    case 'product':
      objects.push(
        { name: "Product", confidence: 0.96 },
        { name: "Packaging", confidence: 0.92 },
        { name: "Brand logo", confidence: 0.88 }
      );
      break;
    
    case 'receipt':
      objects.push(
        { name: "Receipt", confidence: 0.97 },
        { name: "Document", confidence: 0.88 },
        { name: "Printed text", confidence: 0.95 }
      );
      break;
    
    case 'invitation':
      objects.push(
        { name: "Document", confidence: 0.92 },
        { name: "Calendar", confidence: 0.84 },
        { name: "Event", confidence: 0.96 }
      );
      break;
    
    case 'document':
      objects.push(
        { name: "Document", confidence: 0.98 },
        { name: "Paper", confidence: 0.93 },
        { name: "Text", confidence: 0.97 }
      );
      break;
    
    default:
      objects.push(
        { name: "Image", confidence: 0.92 },
        { name: "Object", confidence: 0.78 }
      );
  }
  
  return objects;
};

/**
 * Generate type specific mock data
 */
export const generateTypeSpecificMockData = (documentType: string | null) => {
  switch (documentType) {
    case 'invitation':
      return {
        title: "Team Offsite Meeting",
        date: "2025-05-15",
        time: "10:00 AM",
        location: "Conference Room A, Building 2",
        organizer: "Sarah Johnson",
        notes: "Quarterly team meeting. Bring your presentation materials."
      };
    
    case 'receipt':
      return {
        store: "Green Grocers",
        date: "2025-04-03",
        total: "$12.40",
        category: "Groceries",
        items: [
          { name: "Apples", price: "$4.99" },
          { name: "Bread", price: "$3.50" },
          { name: "Milk", price: "$2.99" }
        ]
      };
    
    case 'product':
      return {
        name: "Organic Avocados",
        price: "$5.99",
        category: "Groceries",
        brand: "Nature's Best",
        store: "Green Grocers",
        description: "Fresh organic avocados, perfect for guacamole."
      };
    
    case 'document':
      return {
        title: "Meeting Minutes",
        date: "2025-04-10",
        type: "Work",
        content: "Discussion about upcoming product launch and marketing strategy.",
        author: "John Smith"
      };
    
    default:
      return {
        title: "Detected Item",
        description: "This is a general detected item.",
        tags: ["detected", "item"]
      };
  }
};

/**
 * Navigate based on form data
 */
export const navigateBasedOnFormData = (formData: any, navigate: NavigateFunction) => {
  if (formData.addToShoppingList) {
    navigate('/shopping');
  } else if (formData.addToCalendar) {
    navigate('/calendar');
  } else if (formData.saveToSpending) {
    navigate('/spending');
  } else if (formData.saveToDocuments) {
    navigate('/documents');
  } else {
    switch (formData.itemType) {
      case 'invitation':
        navigate('/calendar');
        break;
      case 'receipt':
        navigate('/spending');
        break;
      case 'product':
        navigate('/shopping');
        break;
      case 'document':
        navigate('/documents');
        break;
      default:
        navigate('/');
        break;
    }
  }
};
