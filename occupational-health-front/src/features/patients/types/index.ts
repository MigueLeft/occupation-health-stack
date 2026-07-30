export interface Company {
  id: string;
  name: string;
  address: string;
  rif: string;
  contact: string;
}

export interface Position {
  id: string;
  name: string;
  description: string | null;
  companyId: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface Patient {
  cedula: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  sex: string | null;
  bloodType: string | null;
  dominantHand: string | null;
  usesGlasses: boolean | null;
  companyId: string | null;
  positionId: string | null;
  emergencyContact: EmergencyContact | null;
  company: Company | null;
  position: Position | null;
  allergies: { id: string; name: string }[];
  diseases: { id: string; name: string }[];
  // Fecha de egreso. Si no es null, el paciente es un ex-empleado.
  terminatedAt: string | null;
}

export interface CreatePatientPayload {
  cedula: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  sex?: string;
  companyId: string;
  positionId: string;
  emergencyContact?: Partial<EmergencyContact>;
  bloodType?: string;
  dominantHand?: string;
  usesGlasses?: boolean;
  allergyIds?: string[];
  diseaseIds?: string[];
}

export type UpdatePatientPayload = Partial<CreatePatientPayload>;
