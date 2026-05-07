import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { medicalSpecialtiesService } from '../services/medical-specialties.service';

const KEY = ['medical-specialties'] as const;

export function useMedicalSpecialties() {
  return useQuery({
    queryKey: KEY,
    queryFn: medicalSpecialtiesService.getAll,
    select: (d) => d.medicalSpecialties,
  });
}

export function useCreateMedicalSpecialty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: medicalSpecialtiesService.create,
    onSuccess: ({ medicalSpecialty }) => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success(`Especialidad "${medicalSpecialty.name}" agregada.`);
    },
    onError: (e: { response?: { data?: { message?: string } } }) =>
      toast.error(e.response?.data?.message ?? 'Error al crear la especialidad'),
  });
}

export function useUpdateMedicalSpecialty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string } }) =>
      medicalSpecialtiesService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Especialidad actualizada.');
    },
    onError: () => toast.error('Error al actualizar la especialidad'),
  });
}

export function useDeleteMedicalSpecialty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: medicalSpecialtiesService.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Especialidad eliminada.');
    },
    onError: () => toast.error('Error al eliminar la especialidad'),
  });
}
