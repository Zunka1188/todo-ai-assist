
// Simple mock AI analysis for demo purposes
// In a production app, this would connect to a real AI service

export interface AnalysisResult {
  title?: string;
  category?: string;
  tags?: string[];
  description?: string;
  date?: string;
}

export const analyzeImage = async (imageData: string): Promise<AnalysisResult> => {
  console.log('Analyzing image...', imageData.slice(0, 50) + '...');
  
  // Simulate analysis delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // In a real app, this would call an AI service
  // For demo, we'll return random mock data based on image hash
  const hash = imageData.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const categories = ['Style', 'Recipes', 'Travel', 'Fitness', 'Other'];
  const randomCategory = categories[Math.abs(hash) % categories.length];
  
  const mockResults: Record<string, AnalysisResult> = {
    'Style': {
      title: 'Fashion Design Sketch',
      category: 'Style',
      tags: ['fashion', 'design', 'clothing'],
      description: 'A modern fashion design sketch showing seasonal outfit concept.',
      date: new Date().toISOString().split('T')[0]
    },
    'Recipes': {
      title: 'Homemade Pasta Recipe',
      category: 'Recipes',
      tags: ['cooking', 'italian', 'dinner'],
      description: 'Fresh pasta recipe with simple ingredients.',
      date: new Date().toISOString().split('T')[0]
    },
    'Travel': {
      title: 'Vacation Destination',
      category: 'Travel',
      tags: ['vacation', 'sightseeing', 'landmarks'],
      description: 'Beautiful travel destination for next vacation planning.',
      date: new Date().toISOString().split('T')[0]
    },
    'Fitness': {
      title: 'Workout Plan',
      category: 'Fitness',
      tags: ['exercise', 'health', 'workout'],
      description: 'Weekly fitness routine focusing on core strength.',
      date: new Date().toISOString().split('T')[0]
    },
    'Other': {
      title: 'General Document',
      category: 'Other',
      tags: ['document', 'general', 'misc'],
      description: 'General purpose document or image.',
      date: new Date().toISOString().split('T')[0]
    }
  };
  
  return mockResults[randomCategory];
};
