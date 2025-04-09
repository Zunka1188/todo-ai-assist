
import React, { useState, useRef, useEffect } from 'react';
import { Camera, RotateCw, CheckCircle, Edit, Scale, XCircle, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

export interface RecognizedProduce {
  name: string;
  confidence: number;
  price: number | null;
  weightGrams: number | null;
  nutritionData?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  imageUrl?: string;
}

const ProduceScanner: React.FC = () => {
  const { toast } = useToast();
  const { isMobile } = useIsMobile();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [recognizedItem, setRecognizedItem] = useState<RecognizedProduce | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Simulated items for demo purposes
  const mockItems = [
    {
      name: "Organic Apple",
      confidence: 0.98,
      price: 1.99,
      weightGrams: 185,
      nutritionData: {
        calories: 95,
        protein: 0.5,
        carbs: 25,
        fat: 0.3
      }
    },
    {
      name: "Banana",
      confidence: 0.95,
      price: 0.69,
      weightGrams: 120,
      nutritionData: {
        calories: 105,
        protein: 1.1,
        carbs: 27,
        fat: 0.4
      }
    },
    {
      name: "Avocado",
      confidence: 0.92,
      price: 2.49,
      weightGrams: 200,
      nutritionData: {
        calories: 240,
        protein: 3,
        carbs: 12,
        fat: 22
      }
    }
  ];
  
  // Mock function to simulate recognition
  const simulateRecognition = () => {
    setIsScanning(true);
    // Simulate processing delay
    setTimeout(() => {
      const randomItem = mockItems[Math.floor(Math.random() * mockItems.length)];
      setRecognizedItem(randomItem);
      setWeight(randomItem.weightGrams);
      setIsScanning(false);
      
      toast({
        title: "Item Recognized",
        description: `${randomItem.name} (${Math.round(randomItem.confidence * 100)}% confidence)`,
      });
    }, 2000);
  };
  
  // Reset the recognition state
  const handleReset = () => {
    setRecognizedItem(null);
    setWeight(null);
    setIsEditing(false);
  };
  
  // Start editing the recognized item
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  // Save the edited item
  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Changes Saved",
      description: "Item details have been updated."
    });
  };
  
  return (
    <div className="flex flex-col w-full max-w-md mx-auto gap-4">
      <Card className="p-4">
        <h2 className="text-xl font-bold mb-4">Produce Recognition Scanner</h2>
        
        {!recognizedItem ? (
          <div className="flex flex-col items-center">
            <div className="relative w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden mb-4">
              {/* This would be replaced with actual camera feed */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="h-12 w-12 text-gray-400" />
                {isScanning && (
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                    <RotateCw className="h-8 w-8 text-white animate-spin" />
                  </div>
                )}
              </div>
              <video 
                ref={videoRef} 
                className="w-full h-full object-cover" 
                autoPlay 
                playsInline 
                muted 
              />
            </div>
            
            <Button 
              onClick={simulateRecognition} 
              disabled={isScanning}
              className="w-full"
            >
              {isScanning ? 'Scanning...' : 'Scan Produce'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">
                {recognizedItem.name}
                <span className="ml-2 text-sm text-gray-500">
                  ({Math.round(recognizedItem.confidence * 100)}%)
                </span>
              </h3>
              <Button variant="outline" size="icon" onClick={handleReset}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="border rounded p-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Scale className="h-4 w-4 mr-1" />
                  Weight
                </div>
                <div className="text-lg font-medium">
                  {weight ? `${weight}g` : 'N/A'}
                </div>
              </div>
              
              <div className="border rounded p-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Tag className="h-4 w-4 mr-1" />
                  Price
                </div>
                <div className="text-lg font-medium">
                  ${recognizedItem.price?.toFixed(2)}
                </div>
              </div>
            </div>
            
            <div className="border rounded p-2">
              <h4 className="text-sm font-medium mb-1">Nutrition (per 100g)</h4>
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div>
                  <div className="text-gray-500">Calories</div>
                  <div>{recognizedItem.nutritionData?.calories}</div>
                </div>
                <div>
                  <div className="text-gray-500">Protein</div>
                  <div>{recognizedItem.nutritionData?.protein}g</div>
                </div>
                <div>
                  <div className="text-gray-500">Carbs</div>
                  <div>{recognizedItem.nutritionData?.carbs}g</div>
                </div>
                <div>
                  <div className="text-gray-500">Fat</div>
                  <div>{recognizedItem.nutritionData?.fat}g</div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {isEditing ? (
                <Button onClick={handleSave} className="flex-1">
                  Save Changes
                </Button>
              ) : (
                <>
                  <Button onClick={handleEdit} variant="outline" className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Override
                  </Button>
                  <Button className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProduceScanner;
