
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Database } from 'lucide-react';

interface FeedbackItem {
  id: number;
  type: string;
  timestamp: string;
  correct: boolean;
}

interface UserFeedbackPanelProps {
  feedbackItems: FeedbackItem[];
  handleFeedbackToggle: (id: number, newValue: boolean) => void;
}

const UserFeedbackPanel: React.FC<UserFeedbackPanelProps> = ({
  feedbackItems,
  handleFeedbackToggle
}) => {
  return (
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
  );
};

export default UserFeedbackPanel;
