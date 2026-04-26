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
  birthDate: string;
  email: string;
  bloodType: string | null;
  dominantHand: string | null;
  usesGlasses: boolean | null;
  companyId: string;
  positionId: string;
  emergencyContact: EmergencyContact;
  company: Company | null;
  position: Position | null;
  allergies: { id: string; name: string }[];
  diseases: { id: string; name: string }[];
}

export interface CreatePatientPayload {
  cedula: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  companyId: string;
  positionId: string;
  emergencyContact: EmergencyContact;
  // bloodType, dominantHand, usesGlasses se cargan desde la historia clínica
  bloodType?: string;
  dominantHand?: string;
  usesGlasses?: boolean;
  allergyIds?: string[];
  diseaseIds?: string[];
}

export type UpdatePatientPayload = Partial<CreatePatientPayload>;
