
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Image, AlertCircle } from 'lucide-react';

const ScreenshotDetection: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const { toast } = useToast();

  const toggleDetection = (checked: boolean) => {
    setIsEnabled(checked);
    
    if (checked) {
      toast({
        title: "Screenshot Detection Enabled",
        description: "The app will now detect and process new screenshots automatically",
      });
    } else {
      toast({
        title: "Screenshot Detection Disabled",
        description: "Automatic screenshot processing turned off",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border border-dashed border-todo-purple/30 rounded-xl">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Image className="h-8 w-8 text-todo-purple" />
            <div>
              <h3 className="font-medium">Screenshot Detection</h3>
              <p className="text-sm text-muted-foreground">
                Automatically detect and process new screenshots
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="screenshot-detection" 
              checked={isEnabled}
              onCheckedChange={toggleDetection}
            />
            <Label htmlFor="screenshot-detection">
              {isEnabled ? "Enabled" : "Disabled"}
            </Label>
          </div>
          
          {isEnabled && (
            <div className="flex items-start gap-2 p-3 bg-todo-purple/5 rounded-lg">
              <AlertCircle className="h-5 w-5 text-todo-purple shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                The app will suggest actions when new screenshots are detected. 
                This may require permission to access your photos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScreenshotDetection;
