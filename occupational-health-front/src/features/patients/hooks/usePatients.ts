import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { patientsService } from '../services/patients.service';
import type { CreatePatientPayload, UpdatePatientPayload } from '../types';

export const PATIENTS_KEY = ['patients'] as const;

export function usePatients() {
  return useQuery({
    queryKey: PATIENTS_KEY,
    queryFn: () => patientsService.getAll(),
    select: (data) => data.patients,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePatientPayload) => patientsService.create(payload),
    onSuccess: ({ patient }) => {
      queryClient.invalidateQueries({ queryKey: PATIENTS_KEY });
      toast.success(`Paciente "${patient.firstName} ${patient.lastName}" registrado exitosamente.`);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message ?? 'Error al registrar el paciente');
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cedula, payload }: { cedula: string; payload: UpdatePatientPayload }) =>
      patientsService.update(cedula, payload),
    onSuccess: ({ patient }) => {
      queryClient.invalidateQueries({ queryKey: PATIENTS_KEY });
      queryClient.invalidateQueries({ queryKey: ['patient', patient.cedula] });
      toast.success(`Paciente "${patient.firstName} ${patient.lastName}" actualizado exitosamente.`);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message ?? 'Error al actualizar el paciente');
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cedula: string) => patientsService.remove(cedula),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENTS_KEY });
      toast.success('Paciente eliminado correctamente');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message ?? 'Error al eliminar el paciente');
    },
  });
}
