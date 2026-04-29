import { useAuth } from './useAuth';
import { useRoles } from '@/features/roles-permissions/hooks/useRoles';
import type { Action } from '@/features/roles-permissions/types';

export function usePermissions() {
  const { user } = useAuth();
  const { data: roles = [] } = useRoles();

  const userRoleId = (user as unknown as { roleId?: string } | null)?.roleId ?? null;
  const currentRole = roles.find((r) => r.id === userRoleId);

  const can = (module: string, action: string): boolean => {
    if (!currentRole?.permissions) return false;
    const modulePerms = currentRole.permissions[module];
    if (!modulePerms) return false;
    return modulePerms[action as Action] === true;
  };

  return { can, permissions: currentRole?.permissions ?? {}, hasRole: !!currentRole };
}
