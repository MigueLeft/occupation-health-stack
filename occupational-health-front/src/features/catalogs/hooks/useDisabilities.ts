import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { disabilitiesService } from '../services/disabilities.service';

const KEY = ['disabilities'] as const;

export function useDisabilities() {
  return useQuery({ queryKey: KEY, queryFn: disabilitiesService.getAll, select: (d) => d.disabilities });
}

export function useCreateDisability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: disabilitiesService.create,
    onSuccess: ({ disability }) => { qc.invalidateQueries({ queryKey: KEY }); toast.success(`Discapacidad "${disability.name}" agregada.`); },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message ?? 'Error al crear la discapacidad'),
  });
}

export function useUpdateDisability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name: string } }) =>
      disabilitiesService.update(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success('Discapacidad actualizada.'); },
    onError: () => toast.error('Error al actualizar la discapacidad'),
  });
}

export function useDeleteDisability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: disabilitiesService.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success('Discapacidad eliminada.'); },
    onError: () => toast.error('Error al eliminar la discapacidad'),
  });
}
