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
    onSuccess: ({ patient }, { cedula: previousCedula }) => {
      queryClient.invalidateQueries({ queryKey: PATIENTS_KEY });
      queryClient.invalidateQueries({ queryKey: ['patient', previousCedula] });
      queryClient.invalidateQueries({ queryKey: ['patient', patient.cedula] });
      queryClient.invalidateQueries({ queryKey: ['patient-disabilities', previousCedula] });
      queryClient.invalidateQueries({ queryKey: ['patient-disabilities', patient.cedula] });
      // La cédula es la FK usada por requests/consultas — si cambia, esos
      // datos quedan apuntando a la cédula anterior hasta refrescarlos.
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
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
    onError: () => {
      toast.error('Error al eliminar el paciente');
    },
  });
}

export function useReactivatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cedula: string) => patientsService.reactivate(cedula),
    onSuccess: ({ patient }) => {
      queryClient.invalidateQueries({ queryKey: PATIENTS_KEY });
      queryClient.invalidateQueries({ queryKey: ['patient', patient.cedula] });
      toast.success(`"${patient.firstName} ${patient.lastName}" fue reactivado como empleado activo.`);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message ?? 'Error al reactivar el paciente');
    },
  });
}

export function useBackfillExEmployees() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => patientsService.backfillExEmployees(),
    onSuccess: ({ updated }) => {
      queryClient.invalidateQueries({ queryKey: PATIENTS_KEY });
      toast.success(
        updated > 0
          ? `${updated} paciente(s) movido(s) a ex-empleados.`
          : 'No se encontraron pacientes con egresos pendientes por migrar.',
      );
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message ?? 'Error al generar ex-empleados');
    },
  });
}
