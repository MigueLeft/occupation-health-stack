import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { bodySystemsService } from '../services/body-systems.service';

const KEY = ['body-systems'] as const;

export function useBodySystems() {
  return useQuery({ queryKey: KEY, queryFn: bodySystemsService.getAll, select: (d) => d.bodySystems });
}

export function useCreateBodySystem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bodySystemsService.create,
    onSuccess: ({ bodySystem }) => { qc.invalidateQueries({ queryKey: KEY }); toast.success(`Aparato/Sistema "${bodySystem.name}" agregado.`); },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message ?? 'Error al crear'),
  });
}

export function useUpdateBodySystem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name: string } }) =>
      bodySystemsService.update(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success('Aparato/Sistema actualizado.'); },
    onError: () => toast.error('Error al actualizar'),
  });
}

export function useDeleteBodySystem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bodySystemsService.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success('Aparato/Sistema eliminado.'); },
    onError: () => toast.error('Error al eliminar'),
  });
}
