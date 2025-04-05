
import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Pencil, Check, X, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useModelUpdates } from '@/utils/detectionEngine/hooks/useModelUpdates';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

interface FeedbackComponentProps {
  detectionType: string;
  detectionLabel: string;
  detectionResult: any;
  onComplete?: () => void;
  minimal?: boolean;
  className?: string;
}

const FeedbackComponent: React.FC<FeedbackComponentProps> = ({
  detectionType,
  detectionLabel,
  detectionResult,
  onComplete,
  minimal = false,
  className
}) => {
  const { addFeedback } = useModelUpdates();
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'positive' | 'negative' | null>(null);
  const [correction, setCorrection] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleFeedback = async (isAccurate: boolean) => {
    if (minimal) {
      // For minimal mode, submit feedback immediately
      await addFeedback(detectionType, detectionResult, isAccurate);
      setFeedbackSubmitted(true);
      
      if (onComplete) {
        setTimeout(onComplete, 2000);
      }
    } else {
      // For full mode, show feedback form
      setFeedbackType(isAccurate ? 'positive' : 'negative');
      setShowFeedback(true);
    }
  };

  const handleSubmitFeedback = async () => {
    if (feedbackType === null) return;
    
    const isAccurate = feedbackType === 'positive';
    const userCorrection = feedbackType === 'negative' && correction ? correction : undefined;
    
    await addFeedback(detectionType, detectionResult, isAccurate, userCorrection);
    setFeedbackSubmitted(true);
    
    if (onComplete) {
      setTimeout(onComplete, 2000);
    }
  };

  if (minimal) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {!feedbackSubmitted ? (
          <>
            <span className="text-xs text-muted-foreground mr-1">Was this detection correct?</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={() => handleFeedback(true)}
                  >
                    <ThumbsUp className="h-3.5 w-3.5 text-green-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Yes, this is correct</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={() => handleFeedback(false)}
                  >
                    <ThumbsDown className="h-3.5 w-3.5 text-red-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>No, this is wrong</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        ) : (
          <div className="flex items-center text-xs text-green-600 font-medium">
            <Check className="h-3.5 w-3.5 mr-1" />
            Thank you for your feedback
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base flex items-center">
          <HelpCircle className="h-4 w-4 mr-2 text-primary" />
          Detection Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!showFeedback && !feedbackSubmitted ? (
          <div className="space-y-4">
            <p className="text-sm">
              Was <span className="font-medium">{detectionLabel}</span> detected correctly?
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline" 
                className="flex-1 border-green-300 hover:border-green-500 hover:bg-green-50"
                onClick={() => handleFeedback(true)}
              >
                <ThumbsUp className="h-4 w-4 mr-2 text-green-600" />
                Yes, it's correct
              </Button>
              <Button
                variant="outline" 
                className="flex-1 border-red-300 hover:border-red-500 hover:bg-red-50"
                onClick={() => handleFeedback(false)}
              >
                <ThumbsDown className="h-4 w-4 mr-2 text-red-600" />
                No, it's wrong
              </Button>
            </div>
          </div>
        ) : feedbackSubmitted ? (
          <div className="py-4 text-center">
            <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="font-medium text-green-600">Thank you for your feedback!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your input helps improve our detection system.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-2 rounded-full",
                feedbackType === 'positive' 
                  ? "bg-green-100" 
                  : feedbackType === 'negative' 
                    ? "bg-red-100" 
                    : "bg-gray-100"
              )}>
                {feedbackType === 'positive' ? (
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                ) : (
                  <ThumbsDown className="h-4 w-4 text-red-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {feedbackType === 'positive' 
                    ? 'Detection was correct' 
                    : 'Detection was incorrect'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {feedbackType === 'positive' 
                    ? 'Thanks for confirming!' 
                    : 'Please provide correction if possible'}
                </p>
              </div>
            </div>
            
            {feedbackType === 'negative' && (
              <div>
                <label className="text-sm font-medium">
                  What would be the correct detection?
                </label>
                <Textarea
                  value={correction}
                  onChange={(e) => setCorrection(e.target.value)}
                  placeholder="Provide details about what would be correct..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {showFeedback && !feedbackSubmitted && (
        <CardFooter className="flex justify-between border-t pt-3">
          <Button variant="ghost" onClick={() => setShowFeedback(false)}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button onClick={handleSubmitFeedback}>
            <Check className="h-4 w-4 mr-1" />
            Submit Feedback
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default FeedbackComponent;
