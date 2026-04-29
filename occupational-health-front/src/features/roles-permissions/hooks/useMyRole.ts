import { useQuery } from '@tanstack/react-query';
import { rolesService } from '../services/roles.service';
import type { Role } from '../types';

export function useMyRole(roleId: string | null | undefined) {
  return useQuery<Role>({
    queryKey: ['my-role', roleId],
    queryFn: () => rolesService.getOne(roleId!),
    enabled: !!roleId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
