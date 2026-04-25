import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { allergiesService } from '../services/allergies.service';

const KEY = ['allergies'] as const;

export function useAllergies() {
  return useQuery({ queryKey: KEY, queryFn: allergiesService.getAll, select: (d) => d.allergies });
}

export function useCreateAllergy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: allergiesService.create,
    onSuccess: ({ allergy }) => { qc.invalidateQueries({ queryKey: KEY }); toast.success(`Alergia "${allergy.name}" agregada.`); },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message ?? 'Error al crear la alergia'),
  });
}

export function useUpdateAllergy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name: string } }) =>
      allergiesService.update(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success('Alergia actualizada.'); },
    onError: () => toast.error('Error al actualizar la alergia'),
  });
}

export function useDeleteAllergy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: allergiesService.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success('Alergia eliminada.'); },
    onError: () => toast.error('Error al eliminar la alergia'),
  });
}
