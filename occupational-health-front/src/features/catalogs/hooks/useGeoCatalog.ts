import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { geoCatalogService } from '../services/geo-catalog.service';

export function useGeoCatalog(type?: string) {
  return useQuery({
    queryKey: ['geo-catalog', type ?? 'all'],
    queryFn: () => geoCatalogService.getAll(type),
  });
}

export function useCreateGeoLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; type: string }) =>
      geoCatalogService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['geo-catalog'] });
      toast.success('Ubicación geográfica creada exitosamente.');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Error al crear la ubicación.');
    },
  });
}

export function useUpdateGeoLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string } }) =>
      geoCatalogService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['geo-catalog'] });
      toast.success('Ubicación actualizada exitosamente.');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Error al actualizar la ubicación.');
    },
  });
}

export function useDeleteGeoLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => geoCatalogService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['geo-catalog'] });
      toast.success('Ubicación eliminada exitosamente.');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Error al eliminar la ubicación.');
    },
  });
}
