export interface AppUser {
  id: string;
  name: string;
  email: string;
  banned: boolean | null;
  createdAt: string;
  roleId: string | null;
  roleName: string | null;
  roleDescription: string | null;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  roleId?: string;
}

export interface UpdateUserPayload {
  roleId?: string;
  banned?: boolean;
}
