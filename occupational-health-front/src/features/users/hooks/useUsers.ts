import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usersService } from '../services/users.service';
import { ROLES_KEY } from '@/features/roles-permissions/hooks/useRoles';
import type { CreateUserPayload, UpdateUserPayload } from '../types';

export const USERS_KEY = ['users'] as const;

export function useUsers() {
  return useQuery({
    queryKey: USERS_KEY,
    queryFn: () => usersService.getAll(),
    select: (data) => data.users,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersService.create(payload),
    onSuccess: ({ user }) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      queryClient.invalidateQueries({ queryKey: ROLES_KEY });
      toast.success(`Usuario "${user.name}" creado exitosamente`);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message ?? 'Error al crear el usuario');
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      usersService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      queryClient.invalidateQueries({ queryKey: ROLES_KEY });
      toast.success('Usuario actualizado correctamente');
    },
    onError: () => {
      toast.error('Error al actualizar el usuario');
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      toast.success('Usuario eliminado correctamente');
    },
    onError: () => {
      toast.error('Error al eliminar el usuario');
    },
  });
}
