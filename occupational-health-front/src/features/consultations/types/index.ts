import type { EvaluationReason, RequestStatus } from '@/features/requests/types';

export const CONSULTATION_TYPES = ['Medica', 'Psicologica', 'Medica/Psicologica'] as const;
export type ConsultationType = (typeof CONSULTATION_TYPES)[number];

export const CONSULTATION_TYPE_LABELS: Record<ConsultationType, string> = {
  Medica: 'Médica',
  Psicologica: 'Psicológica',
  'Medica/Psicologica': 'Médica/Psicológica',
};

export const CONSULTATION_STATUSES = ['Pendiente', 'En Proceso', 'Finalizada'] as const;
export type ConsultationStatus = (typeof CONSULTATION_STATUSES)[number];

export const CONSULTATION_RESULTS = ['Apto', 'No Apto', 'Apto Condicionado'] as const;
export type ConsultationResult = (typeof CONSULTATION_RESULTS)[number];

export const PSYCHOLOGICAL_RESULTS = ['Completada', 'En Espera', 'Incompleta'] as const;
export type PsychologicalResult = (typeof PSYCHOLOGICAL_RESULTS)[number];

export type ConsultationResultUnion = ConsultationResult | PsychologicalResult;

export interface Recommendations {
  suggestedPPE?: string;
  medicalAdequacyMeasures?: string;
  psychologicalAdequacyMeasures?: string;
}

export interface Observations {
  medica?: string;
  psicologica?: string;
}

export interface Consultation {
  id: string;
  requestId: string;
  status: ConsultationStatus;
  type: ConsultationType;
  currentTreatment?: string | null;
  interviewConducted?: boolean | null;
  consultationResult?: ConsultationResult | null;
  psychologicalResult?: PsychologicalResult | null;
  diagnosisDescription?: string | null;
  recommendations?: Recommendations | null;
  observations?: Observations | null;
  systemAttendedById?: string | null;
  medicalAttendedById?: string | null;
  psychologicalAttendedById?: string | null;
}

export interface ConsultationWithDetails extends Consultation {
  patientName: string;
  patientId: string;
  requestDate: string;
  evaluationReason: EvaluationReason;
  requestStatus: RequestStatus;
}

export interface CreateConsultationPayload {
  requestId: string;
  type: string;
  currentTreatment?: string;
  interviewConducted?: boolean;
  consultationResult?: string;
  psychologicalResult?: string;
  diagnosisDescription?: string;
  recommendations?: Recommendations;
  observations?: Observations;
  systemAttendedById?: string;
  medicalAttendedById?: string;
  psychologicalAttendedById?: string;
}

export type UpdateConsultationPayload = Omit<CreateConsultationPayload, 'requestId' | 'type'> & {
  status?: ConsultationStatus;
  type?: ConsultationType;
};
