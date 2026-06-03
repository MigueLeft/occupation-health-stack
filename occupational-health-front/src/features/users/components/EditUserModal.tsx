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
  Avatar,
  TextField,
  FormControlLabel,
  Switch,
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
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.').max(100),
  email: z.string().email('Ingresa un correo válido.'),
  roleId: z.string().uuid('El rol es obligatorio'),
  banned: z.boolean(),
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

  const { control, handleSubmit, reset, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', roleId: '', banned: false },
  });

  const nameValue = watch('name');

  useEffect(() => {
    if (user && open) {
      reset({
        name: user.name ?? '',
        email: user.email ?? '',
        roleId: user.roleId ?? '',
        banned: user.banned ?? false,
      });
    }
  }, [user, open, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: FormData) => {
    if (!user) return;
    updateUser(
      { id: user.id, payload: data },
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
            <Avatar
              sx={{
                bgcolor: getAvatarColor(nameValue || user.name),
                width: 44,
                height: 44,
                alignSelf: 'flex-start',
                fontSize: '1.1rem',
              }}
            >
              {(nameValue || user.name).charAt(0).toUpperCase()}
            </Avatar>

            <Controller
              name="name"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label="Nombre completo"
                  size="small"
                  fullWidth
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label="Correo electrónico"
                  size="small"
                  fullWidth
                  type="email"
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />

            <Controller
              name="roleId"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormControl fullWidth size="small" error={!!error}>
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

            <Controller
              name="banned"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      color="error"
                    />
                  }
                  label="Usuario bloqueado"
                />
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
