
// Enhanced AI analysis for various file types including images and documents
// In a production app, this would connect to real AI services for OCR, document parsing, etc.

export interface AnalysisResult {
  title?: string;
  category?: string;
  tags?: string[];
  description?: string;
  date?: string;
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
    } else if (['doc', 'docx', 'txt', 'rtf'].includes(extension || '')) {
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
    return mockPdfAnalysis(hash, extractedText);
  } else if (fileType === 'document') {
    extractedText = generateMockDocumentText();
    return mockDocumentAnalysis(hash, extractedText);
  } else {
    // Default image analysis
    const categories = ['style', 'recipes', 'travel', 'fitness', 'other'];
    const randomCategory = categories[Math.abs(hash) % categories.length];
    return getMockResultForCategory(randomCategory);
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

function mockPdfAnalysis(hash: number, text: string): AnalysisResult {
  const titles = [
    'Quarterly Financial Report',
    'Q1 2025 Financial Results',
    'First Quarter Report',
    'Company Financial Statement'
  ];
  
  return {
    title: titles[Math.abs(hash) % titles.length],
    category: 'work',
    tags: ['financial', 'quarterly', 'report', 'business'],
    description: 'Financial performance report for the first quarter of fiscal year 2025.',
    date: '2025-03-31',
    extractedText: text,
    metadata: {
      pageCount: Math.floor(Math.random() * 10) + 5,
      author: 'Finance Department',
      company: 'Example Corporation'
    }
  };
}

function mockDocumentAnalysis(hash: number, text: string): AnalysisResult {
  const titles = [
    'Meeting Minutes - Website Redesign',
    'Website Project Meeting Notes',
    'Team Meeting - Design Project',
    'Project Discussion Notes'
  ];
  
  return {
    title: titles[Math.abs(hash) % titles.length],
    category: 'work',
    tags: ['meeting', 'minutes', 'project', 'website'],
    description: 'Minutes from the website redesign project team meeting.',
    date: '2025-04-15',
    extractedText: text,
    metadata: {
      participants: ['John Smith', 'Sarah Johnson', 'Michael Wong'],
      project: 'Website Redesign'
    }
  };
}

function getMockResultForCategory(category: string): AnalysisResult {
  const mockResults: Record<string, AnalysisResult> = {
    'style': {
      title: 'Fashion Design Sketch',
      category: 'style',
      tags: ['fashion', 'design', 'clothing'],
      description: 'A modern fashion design sketch showing seasonal outfit concept.',
      date: new Date().toISOString().split('T')[0]
    },
    'recipes': {
      title: 'Homemade Pasta Recipe',
      category: 'recipes',
      tags: ['cooking', 'italian', 'dinner'],
      description: 'Fresh pasta recipe with simple ingredients.',
      date: new Date().toISOString().split('T')[0]
    },
    'travel': {
      title: 'Vacation Destination',
      category: 'travel',
      tags: ['vacation', 'sightseeing', 'landmarks'],
      description: 'Beautiful travel destination for next vacation planning.',
      date: new Date().toISOString().split('T')[0]
    },
    'fitness': {
      title: 'Workout Plan',
      category: 'fitness',
      tags: ['exercise', 'health', 'workout'],
      description: 'Weekly fitness routine focusing on core strength.',
      date: new Date().toISOString().split('T')[0]
    },
    'other': {
      title: 'General Document',
      category: 'other',
      tags: ['document', 'general', 'misc'],
      description: 'General purpose document or image.',
      date: new Date().toISOString().split('T')[0]
    }
  };
  
  return mockResults[category];
}
