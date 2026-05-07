export interface PositionRisk {
  id: string;
  name: string;
  type: string;
}

export interface Position {
  id: string;
  name: string;
  description: string | null;
  companyId: string;
  employeeCount?: number;
  risks?: PositionRisk[];
}

export interface Company {
  id: string;
  name: string;
  address: string;
  rif: string;
  contact: string;
  email?: string | null;
  logo?: string | null;
  stateId?: string | null;
  cityId?: string | null;
  municipalityId?: string | null;
  parishId?: string | null;
  stateName?: string | null;
  cityName?: string | null;
  municipalityName?: string | null;
  parishName?: string | null;
}

export interface CompanyWithPositions extends Company {
  positions: Position[];
}

export interface CreateCompanyPayload {
  name: string;
  address: string;
  rif: string;
  contact: string;
  email?: string;
  logo?: string;
  stateId?: string;
  cityId?: string;
  municipalityId?: string;
  parishId?: string;
}

export type UpdateCompanyPayload = Partial<CreateCompanyPayload>;

export interface CreatePositionPayload {
  name: string;
  description?: string;
  companyId: string;
}

export interface UpdatePositionPayload {
  name?: string;
  description?: string;
}
