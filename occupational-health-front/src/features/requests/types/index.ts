export const EVALUATION_REASONS = [
  'Pre-empleo',
  'Egreso',
  'Pre/Post-vacacional',
  'Periodica',
  'Consulta',
  'Post-reposo',
] as const;

export type EvaluationReason = (typeof EVALUATION_REASONS)[number];

export const EVALUATION_REASON_LABELS: Record<EvaluationReason, string> = {
  'Pre-empleo': 'Pre-empleo',
  'Egreso': 'Egreso',
  'Pre/Post-vacacional': 'Pre/Post-vacacional',
  'Periodica': 'Periódica',
  'Consulta': 'Consulta',
  'Post-reposo': 'Post-reposo',
};

export const REQUEST_STATUSES = [
  'Pendiente',
  'En Proceso',
  'Finalizada',
  'No asistio',
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  'Pendiente': 'Pendiente',
  'En Proceso': 'En Proceso',
  'Finalizada': 'Finalizada',
  'No asistio': 'No asistió',
};

export const CONSULTATION_TYPES = [
  'Medica',
  'Psicologica',
  'Medica/Psicologica',
] as const;

export type ConsultationType = (typeof CONSULTATION_TYPES)[number];

export const CONSULTATION_TYPE_LABELS: Record<ConsultationType, string> = {
  'Medica': 'Médica',
  'Psicologica': 'Psicológica',
  'Medica/Psicologica': 'Médica/Psicológica',
};

export interface AppRequest {
  id: string;
  requestDate: string;
  evaluationReason: EvaluationReason;
  status: RequestStatus;
  patientId: string;
  scheduledConsultationType?: ConsultationType | null;
  performedConsultationType?: ConsultationType | null;
}

export interface AppRequestWithPatient extends AppRequest {
  patientName: string;
}

export interface CreateRequestPayload {
  requestDate?: string;
  evaluationReason: string;
  patientId: string;
  scheduledConsultationType?: string;
}

export type UpdateRequestPayload = {
  requestDate?: string;
  evaluationReason?: string;
  status?: string;
  scheduledConsultationType?: string;
  performedConsultationType?: string;
  patientId?: string;
};
