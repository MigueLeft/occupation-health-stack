import { useAuth } from './useAuth';
import { useMyRole } from '@/features/roles-permissions/hooks/useMyRole';
import type { Action } from '@/features/roles-permissions/types';

export function usePermissions() {
  const { user, isPending: isAuthPending } = useAuth();
  const userRoleId = (user as unknown as { roleId?: string } | null)?.roleId ?? null;
  const { data: currentRole, isLoading: isRoleLoading } = useMyRole(userRoleId);

  const isLoading = isAuthPending || isRoleLoading;

  const can = (module: string, action: string): boolean => {
    if (!currentRole?.permissions) return false;
    const modulePerms = currentRole.permissions[module];
    if (!modulePerms) return false;
    return modulePerms[action as Action] === true;
  };

  return { can, isLoading, permissions: currentRole?.permissions ?? {}, hasRole: !!currentRole };
}
