
import React, { Suspense, lazy, useState } from 'react';
import { useModelUpdates } from '@/utils/detectionEngine/hooks/useModelUpdates';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Brain, 
  Database, 
  BarChart, 
  ThumbsUp, 
  ThumbsDown, 
  Check, 
  X, 
  AlertTriangle,
  ArrowUp,
  Loader2
} from 'lucide-react';
import AIModelTrainingErrorBoundary from './AIModelTrainingErrorBoundary';

interface AIModelTrainingProps {
  className?: string;
}

// Lazy-loaded components for code splitting
const ModelPerformanceMetrics = lazy(() => import('./components/ModelPerformanceMetrics'));
const UserFeedbackPanel = lazy(() => import('./components/UserFeedbackPanel'));

const AIModelTraining: React.FC<AIModelTrainingProps> = ({ className }) => {
  const { status, addFeedback } = useModelUpdates();
  const [selectedTab, setSelectedTab] = useState('feedback');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [feedbackItems, setFeedbackItems] = useState([
    { id: 1, type: 'product', timestamp: '2023-04-02T14:32:00Z', correct: true },
    { id: 2, type: 'document', timestamp: '2023-04-01T10:15:00Z', correct: false },
    { id: 3, type: 'barcode', timestamp: '2023-03-30T16:45:00Z', correct: true },
    { id: 4, type: 'receipt', timestamp: '2023-03-29T09:20:00Z', correct: false },
  ]);

  const metrics = {
    overall: {
      accuracy: 0.89,
      precision: 0.92,
      recall: 0.87,
      f1Score: 0.89,
    },
    byModel: {
      'barcode': { accuracy: 0.95, improvement: 0.02 },
      'product': { accuracy: 0.88, improvement: 0.03 },
      'document': { accuracy: 0.86, improvement: 0.01 },
      'contextual': { accuracy: 0.85, improvement: 0.04 },
    }
  };

  const recentImprovements = [
    'Enhanced product recognition for packaged goods (+4%)',
    'Improved text extraction from receipts (+2.5%)',
    'Better handling of low-light images (+3%)',
    'Reduced false positives for document classification (-1.8%)',
  ];

  // Simulate loading data with progress indicator
  const handleRefreshData = () => {
    setIsLoading(true);
    setProgress(0);
    
    // Simulate progress updates
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleFeedbackToggle = (id: number, newValue: boolean) => {
    setFeedbackItems(items => 
      items.map(item => item.id === id ? { ...item, correct: newValue } : item)
    );
  };

  // Loading fallback component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );

  return (
    <AIModelTrainingErrorBoundary>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" /> 
              <CardTitle>AI Model Training & Performance</CardTitle>
            </div>
            {isLoading && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm">{progress}%</span>
              </div>
            )}
          </div>
          <CardDescription>
            Monitor model performance and help improve detection by providing feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="feedback" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="feedback">User Feedback</TabsTrigger>
              <TabsTrigger value="metrics">Model Metrics</TabsTrigger>
            </TabsList>
            
            {isLoading ? (
              <div className="pt-4">
                <Progress value={progress} className="h-2 mb-4" />
                <LoadingSkeleton />
              </div>
            ) : (
              <>
                <TabsContent value="feedback" className="pt-4">
                  <Suspense fallback={<LoadingSkeleton />}>
                    <UserFeedbackPanel 
                      feedbackItems={feedbackItems}
                      handleFeedbackToggle={handleFeedbackToggle}
                    />
                  </Suspense>
                </TabsContent>
                
                <TabsContent value="metrics" className="pt-4">
                  <Suspense fallback={<LoadingSkeleton />}>
                    <ModelPerformanceMetrics 
                      metrics={metrics}
                      recentImprovements={recentImprovements}
                    />
                  </Suspense>
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-xs text-muted-foreground flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Data used only to improve detection accuracy
          </div>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshData}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Updating...
                </>
              ) : (
                'Refresh Data'
              )}
            </Button>
            <Button variant="outline" size="sm">Manage AI Settings</Button>
          </div>
        </CardFooter>
      </Card>
    </AIModelTrainingErrorBoundary>
  );
};

export default AIModelTraining;
