// Tipos para los formularios de autenticación
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

// Roles disponibles en el sistema
export type UserRole = 'admin' | 'user';
