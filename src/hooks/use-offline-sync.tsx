/**
 * Hook to handle synchronization of offline requests when the app comes back online
 */
import { useState, useEffect, useCallback } from 'react';
import { 
  getOfflineRequests,
  removeOfflineRequest,
  setupConnectivityListeners,
  isOnline
} from '@/utils/offline-storage';
import { api } from '@/utils/api-client';
import { logger } from '@/utils/logger';
import { useToast } from './use-toast';

interface UseOfflineSyncOptions {
  autoSync?: boolean;
  maxRetries?: number;
  onSyncComplete?: (results: SyncResult) => void;
  notifyUser?: boolean;
}

interface SyncResult {
  successful: number;
  failed: number;
  remaining: number;
}

export function useOfflineSync(options: UseOfflineSyncOptions = {}) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const { toast } = useToast();
  
  const {
    autoSync = true,
    maxRetries = 3,
    onSyncComplete,
    notifyUser = true
  } = options;

  // Update the pending requests count
  const updatePendingCount = useCallback(() => {
    const requests = getOfflineRequests();
    setPendingRequestsCount(requests.length);
    return requests.length;
  }, []);

  // Sync a single request
  const syncRequest = useCallback(async (request: any) => {
    try {
      // Skip if too many retries
      if (request.retryCount >= maxRetries) {
        logger.warn(`[OfflineSync] Request ${request.id} exceeded max retries, removing`);
        removeOfflineRequest(request.id);
        return { success: false, removed: true };
      }

      // Process the request based on method
      const method = request.method.toLowerCase();
      
      // Handle sensitive data
      let data = request.data;
      if (request.sensitive && typeof data === 'string') {
        // Decrypt here if needed - we'll assume this is handled by the api client
      }
      
      // Make the API call using our api client
      if (api[method]) {
        await api[method](request.url, data);
        // If successful, remove from queue
        removeOfflineRequest(request.id);
        return { success: true, removed: true };
      } else {
        logger.error(`[OfflineSync] Unknown method ${request.method}`);
        return { success: false, removed: false };
      }
    } catch (error) {
      logger.error(`[OfflineSync] Failed to sync request ${request.id}:`, error);
      // Keep in queue but increment retry count
      // Note: This would need to modify the stored request with the increased retry count
      return { success: false, removed: false };
    }
  }, [maxRetries]);

  // Sync all pending requests
  const syncOfflineRequests = useCallback(async () => {
    if (isSyncing || !isOnline()) return;
    
    setIsSyncing(true);
    const requests = getOfflineRequests();
    
    if (requests.length === 0) {
      setIsSyncing(false);
      return { successful: 0, failed: 0, remaining: 0 };
    }
    
    logger.info(`[OfflineSync] Starting sync of ${requests.length} offline requests`);
    
    let successful = 0;
    let failed = 0;
    
    // Process each request
    for (const request of requests) {
      const result = await syncRequest(request);
      if (result.success) {
        successful++;
      } else {
        failed++;
      }
    }
    
    // Get remaining count
    const remaining = updatePendingCount();
    
    const result = { successful, failed, remaining };
    setLastSyncResult(result);
    setIsSyncing(false);
    
    // Notify completion
    if (onSyncComplete) {
      onSyncComplete(result);
    }
    
    // Show toast notification
    if (notifyUser && (successful > 0 || failed > 0)) {
      toast({
        title: "Offline Data Synchronized",
        description: `${successful} items synced, ${failed} failed`,
        variant: successful > 0 && failed === 0 ? "default" : "destructive",
      });
    }
    
    logger.info(`[OfflineSync] Sync completed: ${successful} successful, ${failed} failed, ${remaining} remaining`);
    
    return result;
  }, [isSyncing, syncRequest, updatePendingCount, onSyncComplete, notifyUser, toast]);

  // Set up listeners for online/offline events
  useEffect(() => {
    updatePendingCount();
    
    const cleanup = setupConnectivityListeners(
      // When coming online
      () => {
        if (autoSync) {
          syncOfflineRequests();
        }
      },
      // When going offline
      undefined
    );
    
    return cleanup;
  }, [updatePendingCount, autoSync, syncOfflineRequests]);

  return {
    isSyncing,
    pendingRequestsCount,
    lastSyncResult,
    syncOfflineRequests,
    isOnline: isOnline()
  };
}

export default useOfflineSync;
