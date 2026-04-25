import { useQuery } from '@tanstack/react-query';
import { patientsService } from '../services/patients.service';

export function usePatient(cedula: string) {
  return useQuery({
    queryKey: ['patient', cedula],
    queryFn: () => patientsService.getOne(cedula),
    select: (data) => data.patient,
    enabled: !!cedula,
  });
}
