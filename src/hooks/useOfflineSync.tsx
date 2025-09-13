import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface OfflineAction {
  id: string;
  type: 'feedback' | 'rating' | 'survey';
  data: any;
  timestamp: number;
  retryCount: number;
}

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Load pending actions from localStorage
    const stored = localStorage.getItem('offline-actions');
    if (stored) {
      setPendingActions(JSON.parse(stored));
    }

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Auto-sync when coming back online
    if (isOnline && pendingActions.length > 0) {
      syncPendingActions();
    }
  }, [isOnline, pendingActions.length]);

  const addOfflineAction = (action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>) => {
    const newAction: OfflineAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retryCount: 0
    };

    const updatedActions = [...pendingActions, newAction];
    setPendingActions(updatedActions);
    localStorage.setItem('offline-actions', JSON.stringify(updatedActions));

    return newAction.id;
  };

  const syncPendingActions = async () => {
    if (!isOnline || pendingActions.length === 0 || isSyncing) return;

    setIsSyncing(true);

    try {
      const successful: string[] = [];
      const failed: OfflineAction[] = [];

      for (const action of pendingActions) {
        try {
          await processOfflineAction(action);
          successful.push(action.id);
        } catch (error) {
          console.error('Failed to sync action:', action.id, error);
          if (action.retryCount < 3) {
            failed.push({ ...action, retryCount: action.retryCount + 1 });
          }
        }
      }

      // Update pending actions
      const remainingActions = failed;
      setPendingActions(remainingActions);
      localStorage.setItem('offline-actions', JSON.stringify(remainingActions));

      // Invalidate relevant queries to refresh data
      if (successful.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['feedback'] });
        queryClient.invalidateQueries({ queryKey: ['analytics'] });
      }

    } finally {
      setIsSyncing(false);
    }
  };

  const processOfflineAction = async (action: OfflineAction) => {
    // Simulate API calls based on action type
    switch (action.type) {
      case 'feedback':
        // await submitFeedback(action.data);
        await new Promise(resolve => setTimeout(resolve, 500));
        break;
      case 'rating':
        // await submitRating(action.data);
        await new Promise(resolve => setTimeout(resolve, 300));
        break;
      case 'survey':
        // await submitSurvey(action.data);
        await new Promise(resolve => setTimeout(resolve, 800));
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  };

  const clearPendingActions = () => {
    setPendingActions([]);
    localStorage.removeItem('offline-actions');
  };

  return {
    isOnline,
    pendingActions,
    isSyncing,
    addOfflineAction,
    syncPendingActions,
    clearPendingActions,
    pendingCount: pendingActions.length
  };
};