
import React, { useState, useEffect } from 'react';
import { useModelUpdates } from '@/utils/detectionEngine/hooks/useModelUpdates';
import { ModelVersion } from '@/utils/detectionEngine/ModelManager';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowDownToLine, Check, RefreshCw, History, 
  AlertCircle, ArrowRight, BarChart, BrainCircuit
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ModelCardProps {
  modelType: string;
  modelLabel: string;
  activeModel: ModelVersion | null;
  updateAvailable: boolean;
  lastChecked: Date | null;
  onUpdate: () => void;
  onViewVersions: () => void;
  isUpdating: boolean;
  updateProgress: number;
}

const ModelCard: React.FC<ModelCardProps> = ({
  modelType,
  modelLabel,
  activeModel,
  updateAvailable,
  lastChecked,
  onUpdate,
  onViewVersions,
  isUpdating,
  updateProgress
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{modelLabel}</CardTitle>
            <CardDescription>
              {activeModel 
                ? `Current version: ${activeModel.version}` 
                : "Not initialized"}
            </CardDescription>
          </div>
          
          {updateAvailable && !isUpdating && (
            <Badge variant="default" className="bg-primary">Update Available</Badge>
          )}
          
          {isUpdating && (
            <Badge variant="outline" className="border-primary text-primary">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Updating...
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {isUpdating ? (
          <div className="space-y-2">
            <Progress value={updateProgress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              Downloading and installing update...
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium flex items-center">
                {activeModel ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1 text-green-600" />
                    <span>Active</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3.5 w-3.5 mr-1 text-amber-600" />
                    <span>Not initialized</span>
                  </>
                )}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last checked:</span>
              <span>{lastChecked ? new Date(lastChecked).toLocaleString() : "Never"}</span>
            </div>
            
            {activeModel && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Accuracy:</span>
                <span className="font-medium">
                  {(activeModel.metrics.accuracy * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-3 pb-3 bg-muted/20">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onViewVersions}
          disabled={isUpdating}
        >
          <History className="h-4 w-4 mr-2" />
          History
        </Button>
        
        <Button 
          variant={updateAvailable ? "default" : "outline"} 
          size="sm"
          onClick={onUpdate}
          disabled={isUpdating}
        >
          {updateAvailable ? (
            <>
              <ArrowDownToLine className="h-4 w-4 mr-2" />
              Update
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Check for Updates
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

interface ModelUpdateManagerProps {
  onClose?: () => void;
}

const ModelUpdateManager: React.FC<ModelUpdateManagerProps> = ({ onClose }) => {
  const { 
    status, 
    checkUpdates, 
    updateModel,
    rollbackModel,
    getModelVersions
  } = useModelUpdates();
  
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [modelVersions, setModelVersions] = useState<ModelVersion[]>([]);
  
  useEffect(() => {
    // Check for updates on mount
    checkUpdates();
  }, [checkUpdates]);
  
  const handleUpdate = async (modelType: string) => {
    if (status.updatesAvailable[modelType]) {
      // Update the model
      await updateModel(modelType);
    } else {
      // Just check for updates
      const updates = await checkUpdates();
      
      // If update was found, update immediately
      if (updates[modelType]) {
        await updateModel(modelType);
      }
    }
  };
  
  const handleViewVersions = (modelType: string) => {
    setSelectedModel(modelType);
    setModelVersions(getModelVersions(modelType));
  };
  
  const handleCloseVersions = () => {
    setSelectedModel(null);
  };
  
  const handleRollback = async (versionId: string) => {
    if (!selectedModel) return;
    
    await rollbackModel(selectedModel, versionId);
    setModelVersions(getModelVersions(selectedModel));
  };
  
  const modelTypeMapping: Record<string, string> = {
    'barcode': 'Barcode Scanner',
    'product': 'Product Recognition',
    'document': 'Document Classification',
    'context': 'Context Analysis'
  };
  
  if (selectedModel) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium flex items-center">
            <History className="mr-2 h-5 w-5" />
            {modelTypeMapping[selectedModel]} Version History
          </h3>
          <Button variant="ghost" size="sm" onClick={handleCloseVersions}>
            Back to Updates
          </Button>
        </div>
        
        <ScrollArea className="h-[400px] rounded-md border">
          <div className="p-4 space-y-4">
            {modelVersions.map((version, index) => (
              <Card 
                key={version.id} 
                className={cn(
                  "relative overflow-hidden",
                  version.isActive && "border-primary"
                )}
              >
                {version.isActive && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                )}
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center text-base">
                        {version.version}
                        {version.isActive && (
                          <Badge variant="default" className="ml-2 bg-primary text-xs">
                            Current
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {new Date(version.timestamp).toLocaleString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Accuracy:</span>
                      <span className="font-medium">
                        {(version.metrics.accuracy * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Test samples:</span>
                      <span>{version.metrics.testSamples.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Confidence threshold:</span>
                      <span>{(version.metrics.confidenceThreshold * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </CardContent>
                
                {!version.isActive && (
                  <CardFooter className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleRollback(version.id)}
                    >
                      Rollback to this version
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
            
            {modelVersions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No version history available
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold flex items-center">
          <BrainCircuit className="h-6 w-6 mr-2 text-primary" />
          AI Models
        </h2>
        <p className="text-muted-foreground">
          Manage and update the AI models used for detection and recognition
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <ModelCard
          modelType="barcode"
          modelLabel="Barcode Scanner"
          activeModel={status.activeModels['barcode']}
          updateAvailable={status.updatesAvailable['barcode']}
          lastChecked={status.lastChecked['barcode']}
          onUpdate={() => handleUpdate('barcode')}
          onViewVersions={() => handleViewVersions('barcode')}
          isUpdating={status.updating && status.progress > 0}
          updateProgress={status.progress}
        />
        
        <ModelCard
          modelType="product"
          modelLabel="Product Recognition"
          activeModel={status.activeModels['product']}
          updateAvailable={status.updatesAvailable['product']}
          lastChecked={status.lastChecked['product']}
          onUpdate={() => handleUpdate('product')}
          onViewVersions={() => handleViewVersions('product')}
          isUpdating={status.updating && status.progress > 0}
          updateProgress={status.progress}
        />
        
        <ModelCard
          modelType="document"
          modelLabel="Document Classification"
          activeModel={status.activeModels['document']}
          updateAvailable={status.updatesAvailable['document']}
          lastChecked={status.lastChecked['document']}
          onUpdate={() => handleUpdate('document')}
          onViewVersions={() => handleViewVersions('document')}
          isUpdating={status.updating && status.progress > 0}
          updateProgress={status.progress}
        />
        
        <ModelCard
          modelType="context"
          modelLabel="Context Analysis"
          activeModel={status.activeModels['context']}
          updateAvailable={status.updatesAvailable['context']}
          lastChecked={status.lastChecked['context']}
          onUpdate={() => handleUpdate('context')}
          onViewVersions={() => handleViewVersions('context')}
          isUpdating={status.updating && status.progress > 0}
          updateProgress={status.progress}
        />
      </div>
      
      <Separator />
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="performance">
          <AccordionTrigger>
            <div className="flex items-center">
              <BarChart className="h-4 w-4 mr-2" />
              Performance Metrics
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                Model performance is monitored continuously based on user feedback
                and detection accuracy.
              </p>
              
              <div className="space-y-2">
                {Object.entries(status.activeModels).map(([type, model]) => {
                  if (!model) return null;
                  
                  return (
                    <div key={type} className="flex items-center justify-between text-sm">
                      <span>{modelTypeMapping[type]}:</span>
                      <div className="flex items-center">
                        <span className="font-medium mr-1">
                          {(model.metrics.accuracy * 100).toFixed(1)}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          (based on {model.metrics.testSamples.toLocaleString()} samples)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <Button variant="outline" size="sm" className="w-full">
                View Detailed Analytics
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="flex justify-end">
        <Button variant="default" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
};

export default ModelUpdateManager;
