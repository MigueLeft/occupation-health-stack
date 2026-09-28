import { useQuery } from '@tanstack/react-query';
import { physicalExamService } from '../services/sub-entities.service';

export function useLatestPhysicalExam(patientId: string | undefined) {
  return useQuery({
    queryKey: ['latest-physical-exam', patientId],
    queryFn: () => physicalExamService.getLatestForPatient(patientId!),
    enabled: !!patientId,
  });
}
