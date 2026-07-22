import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/axios';
import { requestsService } from '@/features/requests/services/requests.service';
import { patientsService } from '@/features/patients/services/patients.service';
import { usePermissions } from '@/features/auth';
import { referralsService } from '../services/referrals.service';
import { consultationDisabilitiesService } from '../services/disabilities.service';
import type { Consultation, ConsultationWithDetails, RestPeriod, ConsultationReferral, ConsultationDisability } from '../types';
import type { PhysicalExam, ConsultationDiagnostic, ExamResult, PsychometricTestResult } from '../services/sub-entities.service';
import type { EvaluationReason, RequestStatus } from '@/features/requests/types';
import type { Patient } from '@/features/patients/types';
import type { PsychologicalIndicatorResult } from '@/features/psychological-indicators';

interface PositionRisk { id: string; name: string; type: string; }

interface FullConsultation extends ConsultationWithDetails {
  physicalExam: PhysicalExam | null;
  consultationDiagnostics: ConsultationDiagnostic[];
  examResults: ExamResult[];
  psychometricTests: PsychometricTestResult[];
  patientDiseases: { id: string; name: string }[];
  patient: Patient | null;
  positionRisks: PositionRisk[];
  restPeriod: RestPeriod | null;
  referrals: ConsultationReferral[];
  disabilities: ConsultationDisability[];
  psychologicalIndicatorResults: PsychologicalIndicatorResult[];
}

async function getConsultation(id: string): Promise<{ consultation: Consultation & { physicalExam: PhysicalExam | null; examResults: ExamResult[]; restPeriod: RestPeriod | null } }> {
  const { data } = await apiClient.get(`/consultations/${id}`);
  return data;
}

async function getConsultationDiagnostics(consultationId: string): Promise<ConsultationDiagnostic[]> {
  const { data } = await apiClient.get<{ consultationDiagnostics: ConsultationDiagnostic[] }>('/consultation-diagnostics', { params: { consultationId } });
  return data.consultationDiagnostics;
}

async function getPsychometricTests(consultationId: string): Promise<PsychometricTestResult[]> {
  const { data } = await apiClient.get<{ psychometricTests: PsychometricTestResult[] }>('/psychometric-tests', { params: { consultationId } });
  return data.psychometricTests;
}

async function getPositionRisks(positionId: string): Promise<PositionRisk[]> {
  const { data } = await apiClient.get<{ position: { risks: PositionRisk[] } }>(`/positions/${positionId}`);
  return (data.position.risks ?? []).sort((a, b) => a.type.localeCompare(b.type));
}

export function useAttendConsultation(consultationId: string) {
  const { can } = usePermissions();
  const hasRequestsPerm = can('requests', 'view');
  const hasPatientsPerm = can('patients', 'view');

  const consultationQ = useQuery({ queryKey: ['consultation', consultationId], queryFn: () => getConsultation(consultationId) });
  const requestsQ = useQuery({ queryKey: ['requests'], queryFn: () => requestsService.getAll(), enabled: hasRequestsPerm });
  const patientsQ = useQuery({ queryKey: ['patients'], queryFn: () => patientsService.getAll(), enabled: hasPatientsPerm });
  const diagnosticsQ = useQuery({ queryKey: ['consultation-diagnostics', consultationId], queryFn: () => getConsultationDiagnostics(consultationId) });
  const psychometricQ = useQuery({ queryKey: ['psychometric-tests', consultationId], queryFn: () => getPsychometricTests(consultationId) });
  const referralQ = useQuery({ queryKey: ['consultation-referral', consultationId], queryFn: () => referralsService.getByConsultation(consultationId) });
  const disabilitiesQ = useQuery({ queryKey: ['consultation-disability', consultationId], queryFn: () => consultationDisabilitiesService.getByConsultation(consultationId) });

  const patient = (() => {
    if (!consultationQ.data) return null;
    if (!requestsQ.data || !patientsQ.data) return null;
    const req = requestsQ.data.requests.find((r) => r.id === consultationQ.data!.consultation.requestId);
    return req ? patientsQ.data.patients.find((p) => p.cedula === req.patientId) : null;
  })();

  const positionRisksQ = useQuery({
    queryKey: ['position-risks', patient?.positionId],
    queryFn: () => getPositionRisks(patient!.positionId!),
    enabled: !!patient?.positionId,
  });

  const patientCedula = patient?.cedula ?? consultationQ.data?.consultation.patientId ?? null;

  const patientDisabilitiesQ = useQuery({
    queryKey: ['patient-disabilities', patientCedula],
    queryFn: () => consultationDisabilitiesService.getByPatient(patientCedula!),
    enabled: !!patientCedula,
  });

  const isLoading = consultationQ.isLoading || psychometricQ.isLoading || referralQ.isLoading || disabilitiesQ.isLoading;

  const data: FullConsultation | null = (() => {
    if (!consultationQ.data) return null;
    const c = consultationQ.data.consultation;
    const req = requestsQ.data?.requests.find((r) => r.id === c.requestId);
    const pat = req ? patientsQ.data?.patients.find((p) => p.cedula === req.patientId) : null;
    return {
      ...c,
      requestDate: req?.requestDate ?? c.requestDate ?? '',
      evaluationReason: (req?.evaluationReason ?? c.evaluationReason ?? '') as EvaluationReason,
      requestStatus: (req?.status ?? c.requestStatus ?? 'Pendiente') as RequestStatus,
      patientId: req?.patientId ?? c.patientId ?? '',
      patientName: pat ? `${pat.firstName} ${pat.lastName}` : (c.patientName ?? req?.patientId ?? ''),
      company: pat?.company?.name ?? c.companyName ?? '',
      position: pat?.position?.name ?? c.positionName ?? '',
      physicalExam: c.physicalExam ?? null,
      consultationDiagnostics: diagnosticsQ.data ?? [],
      examResults: c.examResults ?? [],
      psychometricTests: psychometricQ.data ?? [],
      patientDiseases: c.chronicDiseasesSnapshot ?? pat?.diseases ?? [],
      patient: pat ?? null,
      positionRisks: (c.status === 'Finalizada' && c.positionRisksSnapshot?.length)
        ? c.positionRisksSnapshot
        : positionRisksQ.data ?? [],
      restPeriod: c.restPeriod ?? null,
      referrals: referralQ.data ?? [],
      disabilities: disabilitiesQ.data ?? [],
      psychologicalIndicatorResults: (c as { psychologicalIndicatorResults?: PsychologicalIndicatorResult[] }).psychologicalIndicatorResults ?? [],
      companyName: pat?.company?.name ?? c.companyName ?? '',
      positionName: pat?.position?.name ?? c.positionName ?? '',
    };
  })();

  const refetchPatient = hasPatientsPerm ? patientsQ.refetch : () => Promise.resolve();

  return { data, isLoading, isReferralLoading: referralQ.isLoading, isDisabilitiesLoading: disabilitiesQ.isLoading, isPsychometricFetching: psychometricQ.isFetching, refetchPatient, patientDisabilities: patientDisabilitiesQ.data ?? [] };
}
