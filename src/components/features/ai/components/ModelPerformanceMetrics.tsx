
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { ArrowUp, Check } from 'lucide-react';

interface ModelMetrics {
  overall: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  byModel: {
    [key: string]: {
      accuracy: number;
      improvement: number;
    };
  };
}

interface ModelPerformanceMetricsProps {
  metrics: ModelMetrics;
  recentImprovements: string[];
}

const ModelPerformanceMetrics: React.FC<ModelPerformanceMetricsProps> = ({
  metrics,
  recentImprovements
}) => {
  return (
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
  );
};

export default ModelPerformanceMetrics;
