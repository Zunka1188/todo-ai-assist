import React from 'react';
import { useModelUpdates } from '@/utils/detectionEngine/hooks/useModelUpdates';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Database, 
  BarChart, 
  ThumbsUp, 
  ThumbsDown, 
  Check, 
  X, 
  AlertTriangle,
  ArrowUp 
} from 'lucide-react';

interface AIModelTrainingProps {
  className?: string;
}

const AIModelTraining: React.FC<AIModelTrainingProps> = ({ className }) => {
  const { status, addFeedback } = useModelUpdates();
  const [selectedTab, setSelectedTab] = React.useState('feedback');
  const [feedbackItems, setFeedbackItems] = React.useState([
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

  const handleFeedbackToggle = (id: number, newValue: boolean) => {
    setFeedbackItems(items => 
      items.map(item => item.id === id ? { ...item, correct: newValue } : item)
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" /> 
          AI Model Training & Performance
        </CardTitle>
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
          
          <TabsContent value="feedback" className="pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Recent Detections</h3>
                <span className="text-xs text-muted-foreground">
                  Your feedback helps improve our models
                </span>
              </div>
              
              <ScrollArea className="h-[240px] rounded-md border">
                <div className="p-4 space-y-3">
                  {feedbackItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium capitalize">{item.type} Detection</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant={item.correct ? "default" : "outline"}
                          className="h-8 px-2"
                          onClick={() => handleFeedbackToggle(item.id, true)}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Correct
                        </Button>
                        <Button 
                          size="sm" 
                          variant={!item.correct ? "default" : "outline"}
                          className="h-8 px-2"
                          onClick={() => handleFeedbackToggle(item.id, false)}
                        >
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          Incorrect
                        </Button>
                      </div>
                    </div>
                  ))}

                  {feedbackItems.length === 0 && (
                    <div className="py-8 text-center text-muted-foreground">
                      <Database className="h-10 w-10 mx-auto opacity-20 mb-2" />
                      <p>No recent detections to review</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
          
          <TabsContent value="metrics" className="pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="border rounded-lg p-3">
                  <div className="text-muted-foreground text-xs mb-2">Overall Accuracy</div>
                  <div className="flex items-end gap-2">
                    <div className="text-2xl font-bold">{(metrics.overall.accuracy * 100).toFixed(1)}%</div>
                    <div className="text-xs text-green-600 flex items-center">
                      <ArrowUp className="h-3 w-3 mr-0.5" /> 2.5%
                    </div>
                  </div>
                  <Progress className="mt-2 h-1" value={metrics.overall.accuracy * 100} />
                </div>
                
                <div className="border rounded-lg p-3">
                  <div className="text-muted-foreground text-xs mb-2">Precision</div>
                  <div className="flex items-end gap-2">
                    <div className="text-2xl font-bold">{(metrics.overall.precision * 100).toFixed(1)}%</div>
                    <div className="text-xs text-green-600 flex items-center">
                      <ArrowUp className="h-3 w-3 mr-0.5" /> 1.8%
                    </div>
                  </div>
                  <Progress className="mt-2 h-1" value={metrics.overall.precision * 100} />
                </div>
              </div>
              
              <div className="border rounded-md p-3">
                <h4 className="font-medium text-sm mb-3">Model Performance</h4>
                <div className="space-y-3">
                  {Object.entries(metrics.byModel).map(([model, data]) => (
                    <div key={model} className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className="capitalize">{model}</span>
                        <span className="font-medium flex items-center">
                          {(data.accuracy * 100).toFixed(1)}%
                          <span className="text-xs text-green-600 ml-1">
                            +{(data.improvement * 100).toFixed(1)}%
                          </span>
                        </span>
                      </div>
                      <Progress value={data.accuracy * 100} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Recent Improvements</h4>
                <ul className="space-y-1 text-sm">
                  {recentImprovements.map((improvement, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-4 w-4 text-green-600 mr-1 mt-0.5 flex-shrink-0" />
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Data used only to improve detection accuracy
        </div>
        <Button variant="outline" size="sm">Manage AI Settings</Button>
      </CardFooter>
    </Card>
  );
};

export default AIModelTraining;
