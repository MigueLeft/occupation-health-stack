import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import { backupService } from '../services/backup.service';

type ApiError = { response?: { data?: { message?: string } } };

export function useBackupRestore() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: backupService.restore,
    onSuccess: async () => {
      queryClient.clear();
      await authClient.signOut();
      toast.success('Base de datos restaurada. Inicia sesión nuevamente.');
      navigate({ to: '/login' });
    },
    onError: (e: ApiError) =>
      toast.error(
        e.response?.data?.message ??
          'Error al restaurar la base de datos. Verifica que el archivo sea válido.',
      ),
  });
}
