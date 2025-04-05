
import { useState, useEffect, useCallback } from 'react';

export interface ModelStatus {
  barcode: {
    version: string;
    lastUpdated: string;
    status: 'up-to-date' | 'update-available' | 'updating';
  };
  product: {
    version: string;
    lastUpdated: string;
    status: 'up-to-date' | 'update-available' | 'updating';
  };
  document: {
    version: string;
    lastUpdated: string;
    status: 'up-to-date' | 'update-available' | 'updating';
  };
  contextual: {
    version: string;
    lastUpdated: string;
    status: 'up-to-date' | 'update-available' | 'updating';
  };
  updatesAvailable: {
    barcode: boolean;
    product: boolean;
    document: boolean;
    contextual: boolean;
  };
}

export const useModelUpdates = () => {
  const [status, setStatus] = useState<ModelStatus>({
    barcode: {
      version: '1.2.0',
      lastUpdated: '2025-03-15',
      status: 'up-to-date'
    },
    product: {
      version: '1.3.5',
      lastUpdated: '2025-03-28',
      status: 'update-available'
    },
    document: {
      version: '1.1.8',
      lastUpdated: '2025-03-10',
      status: 'up-to-date'
    },
    contextual: {
      version: '1.0.4',
      lastUpdated: '2025-02-20',
      status: 'update-available'
    },
    updatesAvailable: {
      barcode: false,
      product: true,
      document: false,
      contextual: true
    }
  });

  const checkForUpdates = useCallback(() => {
    // Simulated logic to check for model updates
    console.log("Checking for model updates...");
    
    // In a real implementation, this would make API calls to your model server
    // For now, we'll just use our mock data
    return Promise.resolve(status);
  }, [status]);

  const updateModel = useCallback((modelType: keyof Omit<ModelStatus, 'updatesAvailable'>) => {
    // Simulate updating a model
    console.log(`Updating ${modelType} model...`);
    
    setStatus(prevStatus => ({
      ...prevStatus,
      [modelType]: {
        ...prevStatus[modelType],
        status: 'updating' as const
      }
    }));

    // Simulate an update process
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setStatus(prevStatus => {
          const updatedModel = {
            ...prevStatus[modelType],
            version: incrementVersion(prevStatus[modelType].version),
            lastUpdated: new Date().toISOString().split('T')[0],
            status: 'up-to-date' as const
          };

          const updatesAvailable = {
            ...prevStatus.updatesAvailable,
            [modelType]: false
          };

          return {
            ...prevStatus,
            [modelType]: updatedModel,
            updatesAvailable
          };
        });
        
        resolve();
      }, 2000); // Simulate 2-second update process
    });
  }, []);

  // Helper to increment version number
  const incrementVersion = (version: string): string => {
    const parts = version.split('.');
    const lastPart = parseInt(parts[2]) + 1;
    return `${parts[0]}.${parts[1]}.${lastPart}`;
  };

  // Check for updates when component mounts
  useEffect(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  return {
    status,
    checkForUpdates,
    updateModel
  };
};
