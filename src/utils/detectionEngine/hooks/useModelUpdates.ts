
import { useState, useEffect, useCallback } from 'react';
import { ModelManager, modelManager, ModelVersion, ModelUpdateOptions } from '../ModelManager';
import { useToast } from '@/components/ui/use-toast';

interface ModelUpdateStatus {
  updating: boolean;
  progress: number;
  lastChecked: Record<string, Date | null>;
  updatesAvailable: Record<string, boolean>;
  activeModels: Record<string, ModelVersion | null>;
}

/**
 * Hook for managing AI model updates
 */
export const useModelUpdates = () => {
  const { toast } = useToast();
  const [status, setStatus] = useState<ModelUpdateStatus>({
    updating: false,
    progress: 0,
    lastChecked: {
      'barcode': null,
      'product': null,
      'document': null,
      'context': null
    },
    updatesAvailable: {
      'barcode': false,
      'product': false,
      'document': false,
      'context': false
    },
    activeModels: {
      'barcode': null,
      'product': null,
      'document': null,
      'context': null
    }
  });

  // Load current active models on mount
  useEffect(() => {
    const activeModels: Record<string, ModelVersion | null> = {
      'barcode': modelManager.getActiveModel('barcode'),
      'product': modelManager.getActiveModel('product'),
      'document': modelManager.getActiveModel('document'),
      'context': modelManager.getActiveModel('context')
    };
    
    setStatus(prev => ({
      ...prev,
      activeModels
    }));
  }, []);

  // Check for available updates
  const checkUpdates = useCallback(async () => {
    try {
      const updateResults = await modelManager.checkForUpdates();
      
      setStatus(prev => ({
        ...prev,
        lastChecked: {
          'barcode': new Date(),
          'product': new Date(),
          'document': new Date(),
          'context': new Date()
        },
        updatesAvailable: updateResults
      }));

      // Notify user if updates are available
      const hasUpdates = Object.values(updateResults).some(Boolean);
      if (hasUpdates) {
        toast({
          title: "Model Updates Available",
          description: "New AI model versions are available for download.",
        });
      }
      
      return updateResults;
    } catch (error) {
      console.error("Error checking for model updates:", error);
      toast({
        title: "Update Check Failed",
        description: "Could not check for model updates. Please try again later.",
        variant: "destructive"
      });
      return {};
    }
  }, [toast]);

  // Update a specific model
  const updateModel = useCallback(async (
    modelType: string,
    options: ModelUpdateOptions = {}
  ) => {
    try {
      setStatus(prev => ({ ...prev, updating: true }));
      
      const onProgress = (progress: number) => {
        setStatus(prev => ({ ...prev, progress }));
      };
      
      const updatedModel = await modelManager.updateModel(modelType, {
        ...options,
        onProgress
      });
      
      if (updatedModel) {
        setStatus(prev => ({
          ...prev,
          activeModels: {
            ...prev.activeModels,
            [modelType]: updatedModel
          },
          updatesAvailable: {
            ...prev.updatesAvailable,
            [modelType]: false
          }
        }));
        
        toast({
          title: "Model Updated",
          description: `${modelType.charAt(0).toUpperCase() + modelType.slice(1)} model updated to version ${updatedModel.version}`,
        });
        
        return updatedModel;
      } else {
        toast({
          title: "Update Failed",
          description: `Could not update the ${modelType} model.`,
          variant: "destructive"
        });
        return null;
      }
    } catch (error) {
      console.error(`Error updating ${modelType} model:`, error);
      toast({
        title: "Update Error",
        description: `Failed to update the ${modelType} model: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      return null;
    } finally {
      setStatus(prev => ({ ...prev, updating: false, progress: 0 }));
    }
  }, [toast]);

  // Rollback to a previous version
  const rollbackModel = useCallback((modelType: string, versionId: string) => {
    try {
      const success = modelManager.rollbackModel(modelType, versionId);
      
      if (success) {
        const activeModel = modelManager.getActiveModel(modelType);
        setStatus(prev => ({
          ...prev,
          activeModels: {
            ...prev.activeModels,
            [modelType]: activeModel
          }
        }));
        
        toast({
          title: "Model Rolled Back",
          description: `${modelType.charAt(0).toUpperCase() + modelType.slice(1)} model rolled back to ${activeModel?.version}`,
        });
        
        return true;
      } else {
        toast({
          title: "Rollback Failed",
          description: `Could not rollback the ${modelType} model.`,
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error(`Error rolling back ${modelType} model:`, error);
      toast({
        title: "Rollback Error",
        description: `Failed to rollback the ${modelType} model.`,
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  // Add feedback for model improvement
  const addFeedback = useCallback((
    modelType: string, 
    detectionResult: any, 
    isAccurate: boolean, 
    userCorrection?: any
  ) => {
    try {
      modelManager.addUserFeedback(modelType, detectionResult, isAccurate, userCorrection);
      
      toast({
        title: "Feedback Received",
        description: "Thank you for helping improve our detection system!",
      });
      
      return true;
    } catch (error) {
      console.error("Error adding feedback:", error);
      return false;
    }
  }, [toast]);

  // Get all versions of a specific model
  const getModelVersions = useCallback((modelType: string) => {
    return modelManager.getAllModelVersions(modelType);
  }, []);

  return {
    status,
    checkUpdates,
    updateModel,
    rollbackModel,
    addFeedback,
    getModelVersions
  };
};
