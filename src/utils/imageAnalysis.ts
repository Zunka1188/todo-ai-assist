// Enhanced AI analysis for various file types including images and documents
// In a production app, this would connect to real AI services for OCR, document parsing, etc.

import { DocumentCategory } from '@/components/features/documents/types';

export interface AnalysisResult {
  title?: string;
  category?: DocumentCategory;
  tags?: string[];
  description?: string;
  date?: string;
  price?: string;
  metadata?: Record<string, any>;
  extractedText?: string;
}

// Get file type from content or extension
export const getFileType = (fileData: string, fileName?: string): 'image' | 'pdf' | 'document' | 'unknown' => {
  if (fileData.startsWith('data:image/')) {
    return 'image';
  } else if (fileData.startsWith('data:application/pdf')) {
    return 'pdf';
  } else if (fileName) {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension || '')) {
      return 'image';
    } else if (extension === 'pdf') {
      return 'pdf';
    } else if (['doc', 'docx', 'txt', 'rtf', 'xlsx', 'xls', 'pptx', 'ppt', 'csv'].includes(extension || '')) {
      return 'document';
    }
  }
  return 'unknown';
};

export const analyzeImage = async (fileData: string, fileName?: string): Promise<AnalysisResult> => {
  console.log('Analyzing file...', fileName || 'unnamed file', fileData.slice(0, 50) + '...');
  
  // Identify file type
  const fileType = getFileType(fileData, fileName);
  
  // Simulate analysis delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate a pseudo-random hash for consistent mock results based on file content
  const hash = fileData.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  let extractedText: string | undefined = undefined;
  
  // Simulate file type specific analysis
  if (fileType === 'pdf') {
    extractedText = generateMockPdfText();
    return mockPdfAnalysis(hash, extractedText, fileName);
  } else if (fileType === 'document') {
    extractedText = generateMockDocumentText();
    return mockDocumentAnalysis(hash, extractedText, fileName);
  } else {
    // Default image analysis - improved to better match our categories
    const categories: DocumentCategory[] = ['style', 'recipes', 'travel', 'fitness', 'events', 'other'];
    const randomIndex = Math.abs(hash) % categories.length;
    const randomCategory = categories[randomIndex];
    return getMockResultForCategory(randomCategory, fileName);
  }
};

function generateMockPdfText(): string {
  return `QUARTERLY REPORT
FISCAL YEAR 2025 - Q1

Company: Example Corporation
Date: March 31, 2025
Prepared By: Financial Department

EXECUTIVE SUMMARY
The first quarter of fiscal year 2025 showed strong performance across all business units. Revenue increased by 12% compared to the same period last year, with particularly strong growth in our software services division.

KEY FINANCIAL INDICATORS
Revenue: $24.5M (+12% YoY)
Operating Income: $5.2M (+8% YoY)
Net Profit: $3.8M (+15% YoY)
EPS: $0.42 (vs $0.37 Q1 FY2024)

SEGMENT PERFORMANCE
Software Services: $12.3M (+18%)
Hardware Solutions: $8.1M (+6%)
Consulting: $4.1M (+9%)`;
}

function generateMockDocumentText(): string {
  return `Meeting Minutes
Project: Website Redesign
Date: April 15, 2025
Attendees: John Smith, Sarah Johnson, Michael Wong

Agenda Items:
1. Review of current design mockups
2. Timeline discussion
3. Budget approval
4. Assignment of tasks

Decisions:
- Approved new color scheme and typography
- Extended timeline by two weeks
- Budget increased by 15% to accommodate additional features
- Next meeting scheduled for April 29, 2025

Action Items:
- John: Finalize wireframes (Due: April 22)
- Sarah: Begin frontend implementation (Due: May 5)
- Michael: Prepare content migration plan (Due: April 29)`;
}

function mockPdfAnalysis(hash: number, text: string, fileName?: string): AnalysisResult {
  // Based on the hash, determine a category for the PDF
  const categoryMap: DocumentCategory[] = ['other', 'events', 'work', 'other', 'travel', 'style', 'recipes'];
  const categoryIndex = Math.abs(hash) % categoryMap.length;
  const category = categoryMap[categoryIndex];
  
  const titles = fileName ? 
    [fileName.replace(/\.[^/.]+$/, "")] : 
    [
      'Quarterly Financial Report',
      'Q1 2025 Financial Results',
      'First Quarter Report',
      'Company Financial Statement'
    ];
  
  const titleIndex = fileName ? 0 : (Math.abs(hash) % titles.length);
  
  let tags: string[];
  let description: string;
  
  switch (category) {
    case 'events':
      tags = ['event', 'schedule', 'planning', 'calendar'];
      description = 'Event planning document with schedule and details.';
      break;
    case 'travel':
      tags = ['itinerary', 'travel', 'destination', 'planning'];
      description = 'Travel itinerary with destination details and schedule.';
      break;
    case 'style':
      tags = ['fashion', 'catalog', 'lookbook', 'style'];
      description = 'Fashion catalog with style inspirations and product details.';
      break;
    case 'recipes':
      tags = ['recipes', 'cooking', 'food', 'ingredients'];
      description = 'Collection of recipes and cooking instructions.';
      break;
    case 'fitness':
      tags = ['workout', 'fitness', 'exercise', 'health'];
      description = 'Fitness plan with workout routines and health information.';
      break;
    default:
      tags = ['financial', 'quarterly', 'report', 'business'];
      description = 'Financial performance report for the first quarter of fiscal year 2025.';
  }
  
  // Add the category itself as a tag
  if (!tags.includes(category)) {
    tags.push(category);
  }
  
  return {
    title: titles[titleIndex],
    category: category,
    tags: tags,
    description: description,
    date: '2025-03-31',
    price: '0.00',
    extractedText: text,
    metadata: {
      pageCount: Math.floor(Math.random() * 10) + 5,
      author: 'Finance Department',
      company: 'Example Corporation',
      fileType: 'pdf'
    }
  };
}

function mockDocumentAnalysis(hash: number, text: string, fileName?: string): AnalysisResult {
  // For documents, use filename if available
  const titles = fileName ? 
    [fileName.replace(/\.[^/.]+$/, "")] : 
    [
      'Meeting Minutes - Website Redesign',
      'Website Project Meeting Notes',
      'Team Meeting - Design Project',
      'Project Discussion Notes'
    ];
  
  const titleIndex = fileName ? 0 : (Math.abs(hash) % titles.length);
  
  // For documents, analyze the file extension to determine more relevant category
  let category: DocumentCategory = 'other';
  let tags: string[] = ['document', 'files'];
  
  if (fileName) {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['xlsx', 'xls', 'csv'].includes(extension || '')) {
      category = 'other';
      tags = ['spreadsheet', 'data', 'files', 'financial'];
    } else if (['pptx', 'ppt'].includes(extension || '')) {
      category = 'events';
      tags = ['presentation', 'slides', 'meeting', 'event'];
    } else if (['docx', 'doc'].includes(extension || '')) {
      // For Word docs, pick a random category
      const wordCategories: DocumentCategory[] = ['other', 'events', 'style', 'recipes', 'travel', 'fitness'];
      category = wordCategories[Math.abs(hash) % wordCategories.length];
      
      // Add tags based on the chosen category
      switch (category) {
        case 'events': tags = ['event', 'planning', 'document', 'meeting']; break;
        case 'style': tags = ['style', 'fashion', 'document', 'design']; break;
        case 'recipes': tags = ['recipe', 'cooking', 'document', 'instructions']; break;
        case 'travel': tags = ['travel', 'itinerary', 'document', 'destination']; break;
        case 'fitness': tags = ['fitness', 'workout', 'document', 'health']; break;
        default: tags = ['document', 'notes', 'files', 'business'];
      }
    }
  }
  
  return {
    title: titles[titleIndex],
    category: category,
    tags: tags,
    description: 'Document with extracted content and metadata.',
    date: '2025-04-15',
    price: '0.00',
    extractedText: text,
    metadata: {
      participants: ['John Smith', 'Sarah Johnson', 'Michael Wong'],
      project: 'Website Redesign',
      fileType: fileName ? fileName.split('.').pop()?.toLowerCase() : 'document'
    }
  };
}

function getMockResultForCategory(category: DocumentCategory, fileName?: string): AnalysisResult {
  // Use filename as title if available
  const fileTitle = fileName ? fileName.replace(/\.[^/.]+$/, "") : undefined;
  
  const mockResults: Record<DocumentCategory, AnalysisResult> = {
    'style': {
      title: fileTitle || 'Fashion Design Sketch',
      category: 'style',
      tags: ['fashion', 'design', 'clothing', 'outfit', 'style'],
      description: 'A modern fashion design sketch showing seasonal outfit concept.',
      date: new Date().toISOString().split('T')[0],
      price: '59.99',
      metadata: {
        styleType: 'Casual',
        season: 'Summer',
        colors: ['Blue', 'White', 'Beige'],
        occasion: 'Everyday',
        imageObjects: ['clothing', 'fashion', 'apparel']
      }
    },
    'recipes': {
      title: fileTitle || 'Homemade Pasta Recipe',
      category: 'recipes',
      tags: ['cooking', 'italian', 'dinner', 'pasta', 'recipe', 'food'],
      description: 'Fresh pasta recipe with simple ingredients.',
      date: new Date().toISOString().split('T')[0],
      price: '12.50',
      metadata: {
        mealType: 'Dinner',
        cuisine: 'Italian',
        prepTime: '30 minutes',
        cookTime: '10 minutes',
        servings: 4,
        ingredients: ['Flour', 'Eggs', 'Salt', 'Olive oil'],
        imageObjects: ['food', 'pasta', 'cooking', 'meal']
      }
    },
    'travel': {
      title: fileTitle || 'Vacation Destination',
      category: 'travel',
      tags: ['vacation', 'sightseeing', 'landmarks', 'destination', 'travel'],
      description: 'Beautiful travel destination for next vacation planning.',
      date: new Date().toISOString().split('T')[0],
      price: '899.00',
      metadata: {
        location: 'Coastal Resort',
        region: 'Mediterranean',
        bestSeason: 'Summer',
        activities: ['Beach', 'Hiking', 'Water Sports', 'Cultural Tours'],
        imageObjects: ['beach', 'ocean', 'resort', 'vacation']
      }
    },
    'fitness': {
      title: fileTitle || 'Weekly Workout Plan',
      category: 'fitness',
      tags: ['exercise', 'health', 'workout', 'fitness', 'routine'],
      description: 'Weekly fitness routine focusing on core strength.',
      date: new Date().toISOString().split('T')[0],
      price: '29.99',
      metadata: {
        workoutType: 'Strength Training',
        difficulty: 'Intermediate',
        duration: '45 minutes',
        equipment: ['Dumbbells', 'Resistance Bands', 'Mat'],
        targetAreas: ['Core', 'Arms', 'Legs'],
        imageObjects: ['gym', 'workout', 'fitness', 'exercise']
      }
    },
    'events': {
      title: fileTitle || 'Weekend Festival',
      category: 'events',
      tags: ['festival', 'concert', 'weekend', 'music', 'event'],
      description: 'Weekend music and arts festival with multiple stages and food vendors.',
      date: new Date().toISOString().split('T')[0],
      price: '75.00',
      metadata: {
        eventType: 'Festival',
        date: '2025-06-21',
        location: 'City Park',
        performers: ['Band A', 'Band B', 'Band C'],
        activities: ['Live Music', 'Art Exhibits', 'Food Trucks'],
        imageObjects: ['festival', 'concert', 'crowd', 'stage']
      }
    },
    'other': {
      title: fileTitle || 'General Document',
      category: 'other',
      tags: ['document', 'general', 'misc', 'information'],
      description: 'General purpose document or image.',
      date: new Date().toISOString().split('T')[0],
      price: '0.00',
      metadata: {
        type: 'Miscellaneous',
        fileFormat: fileName ? fileName.split('.').pop() : 'unknown',
        createdWith: 'Unknown Application',
        imageObjects: ['document', 'text', 'photo']
      }
    },
    'files': {
      title: fileTitle || 'Document File',
      category: 'files',
      tags: ['document', 'file', 'data'],
      description: 'Document file with various content and formats.',
      date: new Date().toISOString().split('T')[0],
      price: '0.00',
      metadata: {
        fileType: fileName ? fileName.split('.').pop() : 'unknown',
        fileSize: '2.4MB',
        pages: Math.floor(Math.random() * 15) + 1,
        imageObjects: ['file', 'document', 'data']
      }
    }
  };
  
  return mockResults[category];
}
