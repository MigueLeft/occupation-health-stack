export interface Exam {
  id: string;
  name: string;
  category: string;
}

export interface Risk {
  id: string;
  name: string;
  type: string;
}

export interface PsychometricTest {
  id: string;
  name: string;
}

export interface Disease {
  id: string;
  name: string;
  isChronic: boolean;
}

export interface Allergy {
  id: string;
  name: string;
}

export interface BodySystem {
  id: string;
  name: string;
}

export const EXAM_CATEGORIES = ['Laboratorio', 'Estudio de Imagenes', 'Pruebas Especiales'] as const;
export type ExamCategory = (typeof EXAM_CATEGORIES)[number];

export const RISK_TYPES = [
  'Fisico', 'Quimico', 'Biologico', 'Mecanico', 'Disergonomicos', 'Psicosocial',
] as const;
export type RiskType = (typeof RISK_TYPES)[number];
