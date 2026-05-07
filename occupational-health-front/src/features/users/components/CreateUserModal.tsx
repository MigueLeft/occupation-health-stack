import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  TextField,
  InputAdornment,
} from '@mui/material';
import { CloseOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateUser } from '../hooks/useUsers';
import { useRoles } from '@/features/roles-permissions';

const schema = z
  .object({
    firstName: z.string().min(2, 'Mínimo 2 caracteres'),
    lastName: z.string().min(2, 'Mínimo 2 caracteres'),
    email: z.email('Correo inválido'),
    roleId: z.string().uuid('El rol es obligatorio'),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateUserModal({ open, onClose }: CreateUserModalProps) {
  const { mutate: createUser, isPending } = useCreateUser();
  const { data: roles = [] } = useRoles();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const handleClose = () => {
    reset();
    setShowPassword(false);
    setShowConfirm(false);
    onClose();
  };

  const onSubmit = ({ confirmPassword: _confirm, ...payload }: FormData) => {
    createUser(payload, { onSuccess: () => handleClose() });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}
      >
        Crear Nuevo Usuario
        <IconButton size="small" onClick={handleClose}>
          <CloseOutlined fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Nombre"
                fullWidth
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
                {...register('firstName')}
              />
              <TextField
                label="Apellido"
                fullWidth
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
                {...register('lastName')}
              />
            </Stack>

            <TextField
              label="Correo electrónico"
              fullWidth
              type="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register('email')}
            />

            <Controller
              name="roleId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.roleId}>
                  <InputLabel>Rol</InputLabel>
                  <Select {...field} label="Rol" value={field.value ?? ''}>
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.roleId && (
                    <FormHelperText>{errors.roleId.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />

            <TextField
              label="Contraseña"
              fullWidth
              type={showPassword ? 'text' : 'password'}
              error={!!errors.password}
              helperText={errors.password?.message}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              {...register('password')}
            />

            <TextField
              label="Confirmar contraseña"
              fullWidth
              type={showConfirm ? 'text' : 'password'}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirm((v) => !v)}
                        edge="end"
                        size="small"
                      >
                        {showConfirm ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              {...register('confirmPassword')}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={handleClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? 'Creando...' : 'Crear Usuario'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
