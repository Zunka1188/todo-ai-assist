
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Check, CheckCircle, AlertCircle, DollarSign, Percent } from 'lucide-react';
import { RecognizedProduce } from './ProduceScanner';

interface RecognitionResultsProps {
  item: RecognizedProduce;
  onEdit: () => void;
  onConfirm: () => void;
}

const RecognitionResults: React.FC<RecognitionResultsProps> = ({ 
  item, 
  onEdit, 
  onConfirm 
}) => {
  // Helper function to get confidence level display
  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.9) return { color: 'bg-green-100 text-green-800', text: 'High' };
    if (confidence >= 0.7) return { color: 'bg-yellow-100 text-yellow-800', text: 'Medium' };
    return { color: 'bg-red-100 text-red-800', text: 'Low' };
  };
  
  const confidenceLevel = getConfidenceLevel(item.confidence);
  
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">{item.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className={`${confidenceLevel.color}`}>
              <Percent className="h-3 w-3 mr-1" />
              {(item.confidence * 100).toFixed(0)}% - {confidenceLevel.text} Confidence
            </Badge>
          </div>
        </div>
        
        {item.price && (
          <div className="text-xl font-bold flex items-center">
            <DollarSign className="h-4 w-4" />
            {item.price.toFixed(2)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Weight Information */}
        <div className="border rounded p-3">
          <h4 className="text-sm font-medium mb-2 text-gray-500">Weight Information</h4>
          <div className="flex justify-between">
            <span>Measured Weight</span>
            <span className="font-bold">{item.weightGrams}g</span>
          </div>
          <div className="flex justify-between">
            <span>Price per kg</span>
            <span className="font-bold">
              ${item.price && item.weightGrams ? ((item.price / item.weightGrams) * 1000).toFixed(2) : 'N/A'}
            </span>
          </div>
        </div>

        {/* Nutrition Information */}
        {item.nutritionData && (
          <div className="border rounded p-3">
            <h4 className="text-sm font-medium mb-2 text-gray-500">Nutrition (per 100g)</h4>
            <div className="grid grid-cols-2 gap-y-1">
              <span>Calories</span>
              <span className="font-bold">{item.nutritionData.calories}</span>
              <span>Protein</span>
              <span className="font-bold">{item.nutritionData.protein}g</span>
              <span>Carbohydrates</span>
              <span className="font-bold">{item.nutritionData.carbs}g</span>
              <span>Fat</span>
              <span className="font-bold">{item.nutritionData.fat}g</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={onEdit} 
          className="flex-1"
        >
          <Edit className="h-4 w-4 mr-2" />
          Override
        </Button>
        <Button 
          onClick={onConfirm} 
          className="flex-1"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Confirm
        </Button>
      </div>
    </Card>
  );
};

export default RecognitionResults;
