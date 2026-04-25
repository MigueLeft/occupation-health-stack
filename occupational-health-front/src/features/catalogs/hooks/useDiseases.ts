import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { diseasesService } from '../services/diseases.service';

const KEY = ['diseases'] as const;

export function useDiseases() {
  return useQuery({ queryKey: KEY, queryFn: diseasesService.getAll, select: (d) => d.diseases });
}

export function useCreateDisease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: diseasesService.create,
    onSuccess: ({ disease }) => { qc.invalidateQueries({ queryKey: KEY }); toast.success(`Enfermedad "${disease.name}" agregada.`); },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e.response?.data?.message ?? 'Error al crear la enfermedad'),
  });
}

export function useUpdateDisease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; isChronic?: boolean } }) =>
      diseasesService.update(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success('Enfermedad actualizada.'); },
    onError: () => toast.error('Error al actualizar la enfermedad'),
  });
}

export function useDeleteDisease() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: diseasesService.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success('Enfermedad eliminada.'); },
    onError: () => toast.error('Error al eliminar la enfermedad'),
  });
}
