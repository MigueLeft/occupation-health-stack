import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { backupService } from '../services/backup.service';

export function useBackupExport() {
  return useMutation({
    mutationFn: backupService.export,
    onSuccess: () => toast.success('Respaldo descargado exitosamente.'),
    onError: () => toast.error('Error al generar el respaldo.'),
  });
}
