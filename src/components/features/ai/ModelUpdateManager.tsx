import React, { useState, useEffect } from 'react';
import { useModelUpdates, ModelVersionInfo } from '@/utils/detectionEngine/hooks/useModelUpdates';
import { cn } from '@/lib/utils';
import { ModelType } from '@/utils/detectionEngine/types/ModelType';
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import { Progress } from '@/components/ui/progress';
import { ArrowUp, ArrowDown, RotateCcw, CheckCircle, AlertTriangle, Clock, RotateCw } from 'lucide-react';
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';

interface ModelUpdateManagerProps {
  minimal?: boolean;
  className?: string;
}

const ModelUpdateManager: React.FC<ModelUpdateManagerProps> = ({
  minimal = false,
  className
}) => {
  const { status, checkForUpdates, updateModel, rollbackModel, getModelVersions } = useModelUpdates();
  const [selectedModel, setSelectedModel] = useState<ModelType | null>(null);
  const [availableVersions, setAvailableVersions] = useState<ModelVersionInfo[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [showRollbackDialog, setShowRollbackDialog] = useState(false);
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();
  
  const hasUpdates = Object.values(status.updatesAvailable).some(Boolean);
  const modelTypes: ModelType[] = ["barcode", "product", "document", "contextual"];
  const modelNames: Record<ModelType, string> = {
    "barcode": "Barcode Scanner",
    "product": "Product Recognition",
    "document": "Document Classification",
    "contextual": "Contextual Analysis"
  };
  
  const modelDescriptions: Record<ModelType, string> = {
    "barcode": "Scans and identifies various barcode formats including QR codes, UPC, EAN, etc.",
    "product": "Identifies products, brands, and packaging from images",
    "document": "Classifies document types and extracts structured data",
    "contextual": "Analyzes contextual information from images and screenshots"
  };
  
  useEffect(() => {
    const init = async () => {
      await checkForUpdates();
    };
    init();
  }, []);
  
  const handleCheckUpdates = async () => {
    setIsChecking(true);
    await checkForUpdates();
    setIsChecking(false);
  };
  
  const handleUpdateModel = async (modelType: ModelType) => {
    if (status.updating) return;
    
    toast({
      title: "Updating Model",
      description: `Starting update for ${modelNames[modelType]}...`,
    });
    
    const success = await updateModel(modelType);
    
    if (success) {
      toast({
        title: "Update Complete",
        description: `Successfully updated ${modelNames[modelType]}.`,
      });
    } else {
      toast({
        title: "Update Failed",
        description: `Failed to update ${modelNames[modelType]}. Please try again.`,
        variant: "destructive",
      });
    }
  };
  
  const openRollbackDialog = async (modelType: ModelType) => {
    setSelectedModel(modelType);
    
    try {
      const versions = await getModelVersions(modelType);
      setAvailableVersions(versions);
      if (versions.length > 0) {
        setSelectedVersion(versions[0].version);
      }
      setShowRollbackDialog(true);
    } catch (error) {
      toast({
        title: "Error Fetching Versions",
        description: "Failed to load version history.",
        variant: "destructive",
      });
    }
  };
  
  const openVersionInfoDialog = async (modelType: ModelType) => {
    setSelectedModel(modelType);
    
    try {
      const versions = await getModelVersions(modelType);
      setAvailableVersions(versions);
      setShowVersionDialog(true);
    } catch (error) {
      toast({
        title: "Error Fetching Versions",
        description: "Failed to load version history.",
        variant: "destructive",
      });
    }
  };
  
  const handleRollback = async () => {
    if (!selectedModel || !selectedVersion) return;
    
    toast({
      title: "Rolling Back Model",
      description: `Rolling back ${modelNames[selectedModel]} to v${selectedVersion}...`,
    });
    
    const success = await rollbackModel(selectedModel, selectedVersion);
    
    if (success) {
      toast({
        title: "Rollback Complete",
        description: `Successfully rolled back ${modelNames[selectedModel]} to v${selectedVersion}.`,
      });
      setShowRollbackDialog(false);
    } else {
      toast({
        title: "Rollback Failed",
        description: `Failed to roll back ${modelNames[selectedModel]}. Please try again.`,
        variant: "destructive",
      });
    }
  };
  
  if (minimal) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">AI Model Status</h3>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleCheckUpdates}
            disabled={isChecking || status.updating}
          >
            {isChecking ? (
              <RotateCw className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RotateCw className="h-4 w-4 mr-1" />
            )}
            Check Updates
          </Button>
        </div>
        
        {hasUpdates && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-md p-3">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Updates available for {Object.entries(status.updatesAvailable).filter(([_, available]) => available).length} models
              </p>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {modelTypes.map((modelType) => (
            <div key={modelType} className="flex items-center justify-between border rounded-md p-2">
              <div>
                <p className="font-medium">{modelNames[modelType]}</p>
                <p className="text-xs text-muted-foreground">v{status.activeModels[modelType]}</p>
              </div>
              <div>
                {status.updatesAvailable[modelType] ? (
                  <Button 
                    size="sm" 
                    onClick={() => handleUpdateModel(modelType)}
                    disabled={status.updating}
                  >
                    {status.updating && selectedModel === modelType ? (
                      <RotateCw className="h-3.5 w-3.5 mr-1 animate-spin" />
                    ) : (
                      <ArrowUp className="h-3.5 w-3.5 mr-1" />
                    )}
                    Update
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => openRollbackDialog(modelType)}
                    disabled={status.updating}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    Rollback
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {status.updating && (
          <div className="pt-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Updating model...</span>
              <span className="font-medium">{status.progress}%</span>
            </div>
            <Progress value={status.progress} className="h-2" />
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">AI Models</h2>
          <p className="text-muted-foreground">Manage AI detection models and updates</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleCheckUpdates}
            disabled={isChecking || status.updating}
            className="gap-2"
          >
            {isChecking ? (
              <RotateCw className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCw className="h-4 w-4" />
            )}
            Check for Updates
          </Button>
          
          {status.lastChecked && (
            <div className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Last checked: {new Date(status.lastChecked).toLocaleString()}
            </div>
          )}
        </div>
      </div>
      
      {hasUpdates && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-300">
                Updates available
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                {Object.entries(status.updatesAvailable).filter(([_, available]) => available).length} model updates are available to install
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Barcode Scanner Model */}
        <Card className={cn(status.updatesAvailable["barcode"] && "border-amber-200 dark:border-amber-700")}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                Barcode Scanner
                {status.updatesAvailable["barcode"] && (
                  <span className="ml-2 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-xs px-2 py-0.5 rounded-full">
                    Update
                  </span>
                )}
              </CardTitle>
              <p className="text-sm font-mono text-muted-foreground">v{status.activeModels["barcode"]}</p>
            </div>
            <CardDescription>
              {modelDescriptions["barcode"]}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Status:</span>
                <span className={cn(
                  "flex items-center text-sm font-medium",
                  status.updatesAvailable["barcode"] ? "text-amber-600" : "text-green-600"
                )}>
                  {status.updatesAvailable["barcode"] ? (
                    <>
                      <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                      Update available
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      Up to date
                    </>
                  )}
                </span>
              </div>
              
              {status.updating && selectedModel === "barcode" && (
                <div className="pt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Updating model...</span>
                    <span className="font-medium">{status.progress}%</span>
                  </div>
                  <Progress value={status.progress} className="h-2" />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => openVersionInfoDialog("barcode")}
              disabled={status.updating}
            >
              Version History
            </Button>
            
            {status.updatesAvailable["barcode"] ? (
              <Button 
                size="sm" 
                onClick={() => handleUpdateModel("barcode")}
                disabled={status.updating}
              >
                {status.updating && selectedModel === "barcode" ? (
                  <RotateCw className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4 mr-1" />
                )}
                Update
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openRollbackDialog("barcode")}
                disabled={status.updating}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Rollback
              </Button>
            )}
          </CardFooter>
        </Card>
        
        {/* Product Recognition Model */}
        <Card className={cn(status.updatesAvailable["product"] && "border-amber-200 dark:border-amber-700")}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                Product Recognition
                {status.updatesAvailable["product"] && (
                  <span className="ml-2 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-xs px-2 py-0.5 rounded-full">
                    Update
                  </span>
                )}
              </CardTitle>
              <p className="text-sm font-mono text-muted-foreground">v{status.activeModels["product"]}</p>
            </div>
            <CardDescription>
              {modelDescriptions["product"]}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Status:</span>
                <span className={cn(
                  "flex items-center text-sm font-medium",
                  status.updatesAvailable["product"] ? "text-amber-600" : "text-green-600"
                )}>
                  {status.updatesAvailable["product"] ? (
                    <>
                      <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                      Update available
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      Up to date
                    </>
                  )}
                </span>
              </div>
              
              {status.updating && selectedModel === "product" && (
                <div className="pt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Updating model...</span>
                    <span className="font-medium">{status.progress}%</span>
                  </div>
                  <Progress value={status.progress} className="h-2" />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => openVersionInfoDialog("product")}
              disabled={status.updating}
            >
              Version History
            </Button>
            
            {status.updatesAvailable["product"] ? (
              <Button 
                size="sm" 
                onClick={() => handleUpdateModel("product")}
                disabled={status.updating}
              >
                {status.updating && selectedModel === "product" ? (
                  <RotateCw className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4 mr-1" />
                )}
                Update
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openRollbackDialog("product")}
                disabled={status.updating}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Rollback
              </Button>
            )}
          </CardFooter>
        </Card>
        
        {/* Document Classification Model */}
        <Card className={cn(status.updatesAvailable["document"] && "border-amber-200 dark:border-amber-700")}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                Document Classification
                {status.updatesAvailable["document"] && (
                  <span className="ml-2 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-xs px-2 py-0.5 rounded-full">
                    Update
                  </span>
                )}
              </CardTitle>
              <p className="text-sm font-mono text-muted-foreground">v{status.activeModels["document"]}</p>
            </div>
            <CardDescription>
              {modelDescriptions["document"]}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Status:</span>
                <span className={cn(
                  "flex items-center text-sm font-medium",
                  status.updatesAvailable["document"] ? "text-amber-600" : "text-green-600"
                )}>
                  {status.updatesAvailable["document"] ? (
                    <>
                      <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                      Update available
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      Up to date
                    </>
                  )}
                </span>
              </div>
              
              {status.updating && selectedModel === "document" && (
                <div className="pt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Updating model...</span>
                    <span className="font-medium">{status.progress}%</span>
                  </div>
                  <Progress value={status.progress} className="h-2" />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => openVersionInfoDialog("document")}
              disabled={status.updating}
            >
              Version History
            </Button>
            
            {status.updatesAvailable["document"] ? (
              <Button 
                size="sm" 
                onClick={() => handleUpdateModel("document")}
                disabled={status.updating}
              >
                {status.updating && selectedModel === "document" ? (
                  <RotateCw className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4 mr-1" />
                )}
                Update
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openRollbackDialog("document")}
                disabled={status.updating}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Rollback
              </Button>
            )}
          </CardFooter>
        </Card>
        
        {/* Contextual Analysis Model */}
        <Card className={cn(status.updatesAvailable["contextual"] && "border-amber-200 dark:border-amber-700")}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                Contextual Analysis
                {status.updatesAvailable["contextual"] && (
                  <span className="ml-2 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-xs px-2 py-0.5 rounded-full">
                    Update
                  </span>
                )}
              </CardTitle>
              <p className="text-sm font-mono text-muted-foreground">v{status.activeModels["contextual"]}</p>
            </div>
            <CardDescription>
              {modelDescriptions["contextual"]}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Status:</span>
                <span className={cn(
                  "flex items-center text-sm font-medium",
                  status.updatesAvailable["contextual"] ? "text-amber-600" : "text-green-600"
                )}>
                  {status.updatesAvailable["contextual"] ? (
                    <>
                      <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                      Update available
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      Up to date
                    </>
                  )}
                </span>
              </div>
              
              {status.updating && selectedModel === "contextual" && (
                <div className="pt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Updating model...</span>
                    <span className="font-medium">{status.progress}%</span>
                  </div>
                  <Progress value={status.progress} className="h-2" />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => openVersionInfoDialog("contextual")}
              disabled={status.updating}
            >
              Version History
            </Button>
            
            {status.updatesAvailable["contextual"] ? (
              <Button 
                size="sm" 
                onClick={() => handleUpdateModel("contextual")}
                disabled={status.updating}
              >
                {status.updating && selectedModel === "contextual" ? (
                  <RotateCw className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4 mr-1" />
                )}
                Update
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openRollbackDialog("contextual")}
                disabled={status.updating}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Rollback
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
      
      {/* Rollback Dialog */}
      <Dialog open={showRollbackDialog} onOpenChange={setShowRollbackDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rollback Model</DialogTitle>
            <DialogDescription>
              Rolling back to an earlier version may affect recognition accuracy.
            </DialogDescription>
          </DialogHeader>
          
          {selectedModel && (
            <div className="py-4">
              <p className="font-medium">{modelNames[selectedModel]}</p>
              <p className="text-sm text-muted-foreground mb-4">
                Current version: v{status.activeModels[selectedModel]}
              </p>
              
              <div className="space-y-2">
                <Label className="text-sm">Select Version</Label>
                {availableVersions.length > 0 ? (
                  <Select defaultValue={availableVersions[0]?.version} onValueChange={setSelectedVersion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select version" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVersions.map((ver) => (
                        <SelectItem key={ver.version} value={ver.version}>
                          v{ver.version} ({new Date(ver.publishedAt).toLocaleDateString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground">No version history available</p>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="button" 
              onClick={handleRollback}
              disabled={!selectedVersion || !selectedModel || status.updating}
            >
              {status.updating ? (
                <RotateCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-1" />
              )}
              Rollback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Version Info Dialog */}
      <Dialog open={showVersionDialog} onOpenChange={setShowVersionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <DialogDescription>
              {selectedModel && `History of ${modelNames[selectedModel]} model versions`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-2 max-h-[400px] overflow-y-auto">
            <Accordion type="single" collapsible>
              {availableVersions.map((ver, index) => (
                <AccordionItem key={ver.version} value={ver.version}>
                  <AccordionTrigger className="text-sm hover:no-underline hover:bg-accent hover:text-accent-foreground px-3 py-1.5 rounded-md -mx-3">
                    <div className="flex items-center justify-between w-full mr-2">
                      <div className="font-medium">v{ver.version}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(ver.publishedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-1 px-1">
                    <div className="space-y-2">
                      <p className="text-sm">{ver.description}</p>
                      
                      {ver.changelog && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground uppercase mt-2 mb-1">Changelog</div>
                          <p className="text-sm whitespace-pre-wrap text-muted-foreground">{ver.changelog}</p>
                        </div>
                      )}
                      
                      {ver.metrics && (
                        <div>
                          <div className="text-xs font-medium text-muted-foreground uppercase mt-2 mb-1">Performance Metrics</div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {ver.metrics.accuracy !== undefined && (
                              <div>Accuracy: {(ver.metrics.accuracy * 100).toFixed(1)}%</div>
                            )}
                            {ver.metrics.precision !== undefined && (
                              <div>Precision: {(ver.metrics.precision * 100).toFixed(1)}%</div>
                            )}
                            {ver.metrics.recall !== undefined && (
                              <div>Recall: {(ver.metrics.recall * 100).toFixed(1)}%</div>
                            )}
                            {ver.metrics.f1Score !== undefined && (
                              <div>F1 Score: {(ver.metrics.f1Score * 100).toFixed(1)}%</div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {status.activeModels[selectedModel as ModelType] === ver.version && (
                        <div className="flex items-center text-green-600 text-xs font-medium mt-1">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Current version
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            {availableVersions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                No version history available
              </p>
            )}
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModelUpdateManager;
