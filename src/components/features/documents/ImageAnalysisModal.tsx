
import React, { useState } from 'react';
import { Loader2, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { analyzeImage, AnalysisResult } from '@/utils/imageAnalysis';

interface ImageAnalysisModalProps {
  imageData: string | null;
  isOpen: boolean;
  onAnalysisComplete: (result: AnalysisResult) => void;
  onClose: () => void;
}

const ImageAnalysisModal: React.FC<ImageAnalysisModalProps> = ({
  imageData,
  isOpen,
  onAnalysisComplete,
  onClose
}) => {
  const [progress, setProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  React.useEffect(() => {
    if (isOpen && imageData && !analyzing && !completed) {
      performAnalysis();
    }
    
    return () => {
      setProgress(0);
      setCompleted(false);
    };
  }, [isOpen, imageData]);
  
  const performAnalysis = async () => {
    if (!imageData) return;
    
    setAnalyzing(true);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    
    try {
      // Perform actual analysis
      const result = await analyzeImage(imageData);
      
      // Complete progress
      clearInterval(progressInterval);
      setProgress(100);
      setCompleted(true);
      
      // Pass results back
      setTimeout(() => {
        onAnalysisComplete(result);
      }, 500);
      
    } catch (error) {
      console.error("Error analyzing image:", error);
      clearInterval(progressInterval);
      // Still close the modal but without results
      onClose();
    } finally {
      setAnalyzing(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Analyzing Image</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          {!completed ? (
            <>
              <Loader2 className="h-10 w-10 text-todo-purple animate-spin" />
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                AI is analyzing your image to extract relevant information
              </p>
            </>
          ) : (
            <>
              <div className="bg-green-100 p-3 rounded-full">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-center font-medium">Analysis Complete</p>
              <p className="text-sm text-center text-muted-foreground">
                We've extracted information from your image
              </p>
            </>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button 
            variant="outline"
            onClick={onClose}
            disabled={analyzing && !completed}
          >
            {completed ? "Close" : "Cancel"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageAnalysisModal;
