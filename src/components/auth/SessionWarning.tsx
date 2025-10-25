import { useEffect } from 'react';
import { useSecurity } from '@/hooks/useSecurity';
import { useAuth } from '@/contexts/AuthContext';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export const SessionWarning = () => {
  const { showSessionWarning, dismissSessionWarning, extendSession } = useSecurity();
  const { signOut } = useAuth();

  const handleExtendSession = async () => {
    const success = await extendSession();
    if (success) {
      toast.success('Sessão estendida com sucesso!');
    } else {
      toast.error('Falha ao estender a sessão. Faça login novamente.');
      signOut();
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <AlertDialog open={showSessionWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sessão Expirando</AlertDialogTitle>
          <AlertDialogDescription>
            Sua sessão está prestes a expirar. Para continuar trabalhando, estenda sua sessão ou faça logout para salvar seu trabalho.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={dismissSessionWarning}>
            Ignorar
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleExtendSession}>
            Estender Sessão
          </AlertDialogAction>
          <AlertDialogAction 
            variant="destructive" 
            onClick={handleSignOut}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Fazer Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};