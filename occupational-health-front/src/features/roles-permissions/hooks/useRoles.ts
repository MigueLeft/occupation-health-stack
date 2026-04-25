import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { rolesService } from '../services/roles.service';
import type { PermissionsMatrix } from '../types';

export const ROLES_KEY = ['roles'] as const;
export const MODULES_KEY = ['roles', 'modules'] as const;

export function useRoles() {
  return useQuery({
    queryKey: ROLES_KEY,
    queryFn: () => rolesService.getAll(),
  });
}

export function useModules() {
  return useQuery({
    queryKey: MODULES_KEY,
    queryFn: () => rolesService.getModules(),
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      rolesService.create(payload),
    onSuccess: ({ role }) => {
      queryClient.invalidateQueries({ queryKey: ROLES_KEY });
      toast.success(`Rol "${role.name}" creado correctamente`);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message ?? 'Error al crear el rol');
    },
  });
}

export function useUpdatePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: PermissionsMatrix }) =>
      rolesService.updatePermissions(id, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_KEY });
      toast.success('Permisos actualizados correctamente');
    },
    onError: () => {
      toast.error('Error al actualizar los permisos');
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rolesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_KEY });
      toast.success('Rol eliminado correctamente');
    },
    onError: () => {
      toast.error('Error al eliminar el rol');
    },
  });
}
