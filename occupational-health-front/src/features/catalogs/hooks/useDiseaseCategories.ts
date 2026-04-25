import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { diseaseCategoriesService } from '../services/disease-categories.service';

const KEY = ['disease-categories'] as const;

export function useDiseaseCategories() {
  return useQuery({ queryKey: KEY, queryFn: () => diseaseCategoriesService.getAll(), select: (d) => d.diseaseCategories });
}

export function useCreateDiseaseCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => diseaseCategoriesService.create(name),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success('Categoría creada.'); },
    onError: () => toast.error('Error al crear la categoría'),
  });
}

export function useUpdateDiseaseCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => diseaseCategoriesService.update(id, name),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success('Categoría actualizada.'); },
    onError: () => toast.error('Error al actualizar la categoría'),
  });
}

export function useDeleteDiseaseCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => diseaseCategoriesService.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEY }); toast.success('Categoría eliminada.'); },
    onError: () => toast.error('Error al eliminar la categoría'),
  });
}
