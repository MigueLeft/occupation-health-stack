import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Stack,
  Typography,
  Avatar,
  Box,
} from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateUser } from '../hooks/useUsers';
import { useRoles } from '@/features/roles-permissions';
import type { AppUser } from '../types';

const schema = z.object({
  roleId: z.string().uuid('El rol es obligatorio'),
});

type FormData = z.infer<typeof schema>;

function getAvatarColor(name: string): string {
  const colors = ['#7B68EE', '#6495ED', '#9370DB', '#8FBC8F', '#F4A460'];
  return colors[name.charCodeAt(0) % colors.length];
}

interface EditUserModalProps {
  open: boolean;
  user: AppUser | null;
  onClose: () => void;
}

export function EditUserModal({ open, user, onClose }: EditUserModalProps) {
  const { mutate: updateUser, isPending } = useUpdateUser();
  const { data: roles = [] } = useRoles();

  const { control, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { roleId: '' },
  });

  useEffect(() => {
    if (user && open) reset({ roleId: user.roleId ?? '' });
  }, [user, open, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: FormData) => {
    if (!user) return;
    updateUser(
      { id: user.id, payload: { roleId: data.roleId } },
      { onSuccess: () => handleClose() },
    );
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}
      >
        Editar Usuario
        <IconButton size="small" onClick={handleClose}>
          <CloseOutlined fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2.5}>
            {/* User info preview */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
              <Avatar sx={{ bgcolor: getAvatarColor(user.name), width: 40, height: 40 }}>
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>{user.name}</Typography>
                <Typography variant="body2" color="text.secondary">{user.email}</Typography>
              </Box>
            </Box>

            <Controller
              name="roleId"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth error={!!error}>
                  <InputLabel>Rol</InputLabel>
                  <Select {...field} label="Rol" value={field.value ?? ''}>
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {error && <FormHelperText>{error.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={handleClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
