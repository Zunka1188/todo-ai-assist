
import React, { useState, useEffect } from 'react';
import { Scale, RefreshCw, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ScaleIntegrationProps {
  onWeightChange: (weight: number | null) => void;
}

const ScaleIntegration: React.FC<ScaleIntegrationProps> = ({ onWeightChange }) => {
  const { toast } = useToast();
  const [connected, setConnected] = useState(false);
  const [weight, setWeight] = useState<number | null>(null);
  const [isStable, setIsStable] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  
  // Simulate connection to scale
  const connectToScale = () => {
    setConnected(false);
    toast({
      title: "Connecting to Scale",
      description: "Attempting to connect to the weighing scale..."
    });
    
    // Simulate connection delay
    setTimeout(() => {
      setConnected(true);
      simulateWeightReading();
      toast({
        title: "Scale Connected",
        description: "Successfully connected to the weighing scale."
      });
    }, 1500);
  };
  
  // Simulate reading weight from the scale
  const simulateWeightReading = () => {
    // Clear any existing interval
    const intervalId = setInterval(() => {
      // Generate a random weight with some variation
      const baseWeight = 150; // 150g base weight
      const variation = Math.random() * 10 - 5; // +/- 5g variation
      const newWeight = Math.round(baseWeight + variation);
      
      // Randomly determine if the weight is stable
      const newIsStable = Math.random() > 0.3; // 70% chance of being stable
      
      setWeight(newWeight);
      setIsStable(newIsStable);
      
      // Pass the weight to the parent component if stable
      if (newIsStable) {
        onWeightChange(newWeight);
      }
    }, 800);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  };
  
  // Simulate calibrating the scale
  const calibrateScale = () => {
    setIsCalibrating(true);
    toast({
      title: "Calibrating Scale",
      description: "Please remove all items from the scale."
    });
    
    // Simulate calibration process
    setTimeout(() => {
      setIsCalibrating(false);
      toast({
        title: "Calibration Complete",
        description: "Scale has been successfully calibrated."
      });
    }, 3000);
  };
  
  // Disconnect from scale
  const disconnectFromScale = () => {
    setConnected(false);
    setWeight(null);
    setIsStable(false);
    onWeightChange(null);
    toast({
      title: "Scale Disconnected",
      description: "Connection to the scale has been terminated."
    });
  };
  
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Scale Integration</h3>
        <Scale className="h-5 w-5 text-gray-500" />
      </div>
      
      {!connected ? (
        <Button onClick={connectToScale} className="w-full">
          Connect to Scale
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-center p-4 border rounded-md">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {weight !== null ? `${weight}g` : '--'}
              </div>
              <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                {isStable ? (
                  <>Stable</>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3" />
                    Unstable
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={calibrateScale} 
              disabled={isCalibrating}
              className="flex-1"
            >
              {isCalibrating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Calibrating...
                </>
              ) : (
                <>Calibrate</>
              )}
            </Button>
            
            <Button 
              variant="destructive" 
              onClick={disconnectFromScale}
              className="flex-1"
            >
              Disconnect
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ScaleIntegration;
