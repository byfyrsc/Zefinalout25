import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { feedbackService } from '@/lib/supabase-services'; // Import feedbackService
import { SubmitResponseRequest } from '@/types/feedback'; // Import SubmitResponseRequest
import { toast } from 'sonner'; // Import sonner for notifications

interface OfflineAction {
  id: string;
  type: 'feedback' | 'rating' | 'survey'; // 'survey' type will now hold SubmitResponseRequest
  data: SubmitResponseRequest; // Data will be a SubmitResponseRequest for feedback/survey
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
      toast.success('Você está online novamente!', { description: 'Tentando sincronizar dados pendentes.' });
      syncPendingActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Você está offline.', { description: 'Os dados serão sincronizados automaticamente quando a conexão for restaurada.' });
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
    
    if (!isOnline) {
      toast.info('Feedback salvo offline.', { description: 'Será enviado quando você estiver online.' });
    }

    return newAction.id;
  };

  const syncPendingActions = async () => {
    if (!isOnline || pendingActions.length === 0 || isSyncing) return;

    setIsSyncing(true);
    toast.loading('Sincronizando dados pendentes...', { id: 'offline-sync' });

    try {
      const successful: string[] = [];
      const failed: OfflineAction[] = [];

      for (const action of pendingActions) {
        try {
          await processOfflineAction(action);
          successful.push(action.id);
        } catch (error) {
          console.error('Failed to sync action:', action.id, error);
          if (action.retryCount < 3) { // Retry up to 3 times
            failed.push({ ...action, retryCount: action.retryCount + 1 });
          } else {
            toast.error(`Falha ao sincronizar feedback: ${action.id}`, { description: 'Tentativas esgotadas.' });
          }
        }
      }

      // Update pending actions
      const remainingActions = failed;
      setPendingActions(remainingActions);
      localStorage.setItem('offline-actions', JSON.stringify(remainingActions));

      // Invalidate relevant queries to refresh data
      if (successful.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
        queryClient.invalidateQueries({ queryKey: ['analytics'] });
        queryClient.invalidateQueries({ queryKey: ['surveys'] });
        toast.success(`${successful.length} feedback(s) sincronizado(s)!`, { id: 'offline-sync' });
      } else {
        toast.dismiss('offline-sync');
      }

    } finally {
      setIsSyncing(false);
      if (pendingActions.length === 0) {
        toast.dismiss('offline-sync');
      }
    }
  };

  const processOfflineAction = async (action: OfflineAction) => {
    switch (action.type) {
      case 'feedback':
      case 'survey': // Assuming 'survey' type also uses SubmitResponseRequest
        await feedbackService.submitResponse(action.data);
        break;
      case 'rating':
        // Implement rating submission if needed, or merge into feedback/survey
        // For now, we'll assume ratings are part of a feedback/survey submission
        console.warn('Rating action type not fully implemented for direct submission.');
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  };

  const clearPendingActions = () => {
    setPendingActions([]);
    localStorage.removeItem('offline-actions');
    toast.info('Ações pendentes limpas.');
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