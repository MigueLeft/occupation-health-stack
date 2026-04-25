export type Action = 'view' | 'create' | 'edit' | 'delete';
export type ModulePermissions = Partial<Record<Action, boolean>>;
export type PermissionsMatrix = Record<string, ModulePermissions>;

export interface SystemModule {
  key: string;
  label: string;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  isVisible: boolean;
  permissions: PermissionsMatrix;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export const ACTIONS: { key: Action; label: string }[] = [
  { key: 'view', label: 'Ver' },
  { key: 'create', label: 'Crear' },
  { key: 'edit', label: 'Editar' },
  { key: 'delete', label: 'Eliminar' },
];
