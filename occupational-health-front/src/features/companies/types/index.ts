export interface Position {
  id: string;
  name: string;
  description: string | null;
  companyId: string;
}

export interface Company {
  id: string;
  name: string;
  address: string;
  rif: string;
  contact: string;
}

export interface CompanyWithPositions extends Company {
  positions: Position[];
}

export interface CreateCompanyPayload {
  name: string;
  address: string;
  rif: string;
  contact: string;
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
