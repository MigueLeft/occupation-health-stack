import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestsService } from '../services/requests.service';
import { patientsService } from '@/features/patients/services/patients.service';
import { CONSULTATIONS_KEY } from '@/features/consultations/hooks/useConsultations';
import type { AppRequestWithPatient, CreateRequestPayload, UpdateRequestPayload } from '../types';

export const REQUESTS_KEY = ['requests'] as const;
const PATIENTS_KEY = ['patients'] as const;

export function useRequests() {
  const requestsQuery = useQuery({
    queryKey: REQUESTS_KEY,
    queryFn: () => requestsService.getAll(),
  });

  const patientsQuery = useQuery({
    queryKey: PATIENTS_KEY,
    queryFn: () => patientsService.getAll(),
  });

  const data: AppRequestWithPatient[] | undefined =
    requestsQuery.data && patientsQuery.data
      ? requestsQuery.data.requests.map((req) => {
          const patient = patientsQuery.data.patients.find((p) => p.cedula === req.patientId);
          return {
            ...req,
            patientName: patient ? `${patient.firstName} ${patient.lastName}` : req.patientId,
          };
        })
      : undefined;

  return {
    data,
    isLoading: requestsQuery.isLoading || patientsQuery.isLoading,
    error: requestsQuery.error ?? patientsQuery.error,
  };
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRequestPayload) => requestsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUESTS_KEY });
      queryClient.invalidateQueries({ queryKey: CONSULTATIONS_KEY });
      toast.success('Solicitud creada exitosamente.');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message ?? 'Error al crear la solicitud');
    },
  });
}

export function useUpdateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRequestPayload }) =>
      requestsService.update(id, payload),
    onSuccess: (_, { payload }) => {
      queryClient.invalidateQueries({ queryKey: REQUESTS_KEY });
      if (payload.status === 'No asistio') {
        queryClient.invalidateQueries({ queryKey: CONSULTATIONS_KEY });
      }
      toast.success('Solicitud actualizada.');
    },
    onError: () => {
      toast.error('Error al actualizar la solicitud');
    },
  });
}

export function useDeleteRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => requestsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUESTS_KEY });
      toast.success('Solicitud eliminada.');
    },
    onError: () => {
      toast.error('Error al eliminar la solicitud');
    },
  });
}
