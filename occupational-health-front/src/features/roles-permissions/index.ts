export { RoleCard } from './components/RoleCard';
export { PermissionsMatrix } from './components/PermissionsMatrix';
export { CreateRoleModal } from './components/CreateRoleModal';
export { RenameRoleModal } from './components/RenameRoleModal';
export { useRoles, useModules, useCreateRole, useUpdateRole, useUpdatePermissions, useDeleteRole } from './hooks/useRoles';
export { useMyRole } from './hooks/useMyRole';
export type { Role, PermissionsMatrix as PermMatrix, SystemModule, Action, ACTIONS } from './types';
